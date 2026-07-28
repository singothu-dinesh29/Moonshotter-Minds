-- ====================================================================
-- SYMPHOSIUM EXAMINATION PLATFORM - COMPLETE SUPABASE SECURITY & CONFIG
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. AUTOMATED AUTH.USERS TO PUBLIC.USERS SYNC TRIGGER
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_student_role_id UUID;
    v_role_name VARCHAR(50);
    v_target_role_id UUID;
BEGIN
    -- Fetch default STUDENT role ID
    SELECT id INTO v_student_role_id FROM public.roles WHERE name = 'STUDENT' LIMIT 1;
    
    -- Check if role passed in raw_user_meta_data
    v_role_name := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
    SELECT id INTO v_target_role_id FROM public.roles WHERE name = v_role_name;
    IF v_target_role_id IS NULL THEN
        v_target_role_id := v_student_role_id;
    END IF;

    -- Insert into public.users
    INSERT INTO public.users (
        id,
        email,
        full_name,
        college_name,
        phone_number,
        role_id,
        avatar_url
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'college_name', 'Independent Candidate'),
        NEW.raw_user_meta_data->>'phone_number',
        v_target_role_id,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 2. HELPER RPC FUNCTIONS FOR ROLE-BASED ACCESS CONTROL (RBAC)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_role_name VARCHAR(50);
BEGIN
    SELECT r.name INTO v_role_name
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = p_user_id;

    RETURN v_role_name = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 3. AUTO DISQUALIFICATION & CHEATING LOG TRIGGER
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_cheating_log_process()
RETURNS TRIGGER AS $$
DECLARE
    v_flag_count INT;
    v_max_allowed INT := 3;
BEGIN
    -- Increment anti_cheat_flag_count on registrations
    UPDATE public.registrations
    SET anti_cheat_flag_count = anti_cheat_flag_count + 1
    WHERE id = NEW.registration_id
    RETURNING anti_cheat_flag_count INTO v_flag_count;

    -- Check if auto-disqualification threshold reached
    IF v_flag_count >= v_max_allowed THEN
        UPDATE public.registrations
        SET status = 'DISQUALIFIED',
            ended_at = NOW()
        WHERE id = NEW.registration_id;

        -- Create notification
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT user_id, 'Exam Disqualification Warning', 
               'Your examination session was terminated due to repeated anti-cheat violations.', 'DISQUALIFICATION'
        FROM public.registrations WHERE id = NEW.registration_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_cheating_log_insert ON public.cheating_logs;
CREATE TRIGGER after_cheating_log_insert
  AFTER INSERT ON public.cheating_logs
  FOR EACH ROW EXECUTE FUNCTION public.trg_cheating_log_process();

-- --------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 19 TABLES
-- --------------------------------------------------------------------

-- Table 1: roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles viewable by all authenticated users" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');

-- Table 2: users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users viewable by authenticated users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Table 3: events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin full management of events" ON public.events FOR ALL USING (public.is_admin(auth.uid()));

-- Table 4: rounds
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rounds viewable by everyone" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Admin full management of rounds" ON public.rounds FOR ALL USING (public.is_admin(auth.uid()));

-- Table 5: questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable by registered candidate during live event" ON public.questions FOR SELECT USING (
    public.is_admin(auth.uid()) OR EXISTS (
        SELECT 1 FROM public.rounds r
        JOIN public.events e ON r.event_id = e.id
        JOIN public.registrations reg ON reg.event_id = e.id
        WHERE r.id = questions.round_id 
          AND reg.user_id = auth.uid()
          AND reg.status = 'IN_PROGRESS'
    )
);

-- Table 6: mcq_options
ALTER TABLE public.mcq_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MCQ Options viewable by registered candidates" ON public.mcq_options FOR SELECT USING (auth.role() = 'authenticated');

-- Table 7: coding_questions
ALTER TABLE public.coding_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coding Questions viewable by active candidates" ON public.coding_questions FOR SELECT USING (auth.role() = 'authenticated');

-- Table 8: registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can view own registrations" ON public.registrations FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Candidates can register for events" ON public.registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Candidates can update own active session" ON public.registrations FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Table 9: submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.registrations r 
        WHERE r.id = registration_id AND r.user_id = auth.uid() AND r.status = 'IN_PROGRESS'
    ) OR public.is_admin(auth.uid())
);
CREATE POLICY "Candidates can view own submissions" ON public.submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.user_id = auth.uid()) OR public.is_admin(auth.uid())
);

-- Table 10: scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scores viewable by candidate and admin" ON public.scores FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.user_id = auth.uid()) OR public.is_admin(auth.uid())
);

-- Table 11: certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates publicly verifiable by hash" ON public.certificates FOR SELECT USING (true);

-- Table 12: announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements viewable by all" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admin can insert announcements" ON public.announcements FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Table 13: logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access to audit logs" ON public.logs FOR ALL USING (public.is_admin(auth.uid()));

-- Table 14: cheating_logs
ALTER TABLE public.cheating_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can insert cheating telemetry" ON public.cheating_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.user_id = auth.uid())
);
CREATE POLICY "Admin full view of cheating logs" ON public.cheating_logs FOR SELECT USING (public.is_admin(auth.uid()));

-- Table 15: browser_activity
ALTER TABLE public.browser_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates insert browser activity" ON public.browser_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view browser activity" ON public.browser_activity FOR SELECT USING (public.is_admin(auth.uid()));

-- Table 16: tab_switch_logs
ALTER TABLE public.tab_switch_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates insert tab switch logs" ON public.tab_switch_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view tab switch logs" ON public.tab_switch_logs FOR SELECT USING (public.is_admin(auth.uid()));

-- Table 17: timer_logs
ALTER TABLE public.timer_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Timer logs insertable by candidate" ON public.timer_logs FOR INSERT WITH CHECK (true);

-- Table 18: leaderboard
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard viewable by everyone" ON public.leaderboard FOR SELECT USING (true);

-- Table 19: notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notification read state" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- --------------------------------------------------------------------
-- 5. STORAGE BUCKETS & STORAGE RLS POLICIES
-- --------------------------------------------------------------------

-- Insert Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('certificate-pdfs', 'certificate-pdfs', true),
('incident-snapshots', 'incident-snapshots', false),
('question-assets', 'question-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket Policy 1: Certificate PDFs Public Read
CREATE POLICY "Public read certificate PDFs" ON storage.objects FOR SELECT USING (bucket_id = 'certificate-pdfs');
CREATE POLICY "Admin upload certificate PDFs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificate-pdfs' AND public.is_admin(auth.uid()));

-- Bucket Policy 2: Incident Snapshots Admin Only
CREATE POLICY "Candidate upload incident snapshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'incident-snapshots');
CREATE POLICY "Admin read incident snapshots" ON storage.objects FOR SELECT USING (bucket_id = 'incident-snapshots' AND public.is_admin(auth.uid()));

-- Bucket Policy 3: Question Assets Public Read
CREATE POLICY "Public read question assets" ON storage.objects FOR SELECT USING (bucket_id = 'question-assets');

-- --------------------------------------------------------------------
-- 6. REALTIME WEBSOCKET PUBLICATION SETUP
-- --------------------------------------------------------------------
BEGIN;
  -- Add key tables to Supabase Realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.cheating_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;
