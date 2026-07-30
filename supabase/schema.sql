-- ====================================================================
-- SYMPHOSIUM EXAMINATION PLATFORM - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ROLES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Roles
INSERT INTO public.roles (name, description) VALUES 
('STUDENT', 'Candidate participating in symposium examination events'),
('ADMIN', 'Event organizer with full access to command center, anti-cheat & scoring'),
('PROCTOR', 'Invigilator observing live candidate proctoring feeds')
ON CONFLICT (name) DO NOTHING;

-- --------------------------------------------------------------------
-- 2. USERS TABLE (Linked to auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role_id ON public.users(role_id);

-- --------------------------------------------------------------------
-- 3. EVENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    config JSONB DEFAULT '{
        "negative_marking": true,
        "tab_switch_limit": 3,
        "auto_disqualify": true,
        "show_live_leaderboard": true
    }'::jsonb,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_event_status CHECK (status IN ('DRAFT', 'UPCOMING', 'LIVE', 'PAUSED', 'COMPLETED')),
    CONSTRAINT chk_event_time CHECK (end_time > start_time)
);

CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_end ON public.events(start_time, end_time);

-- --------------------------------------------------------------------
-- 4. ROUNDS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    round_type VARCHAR(30) NOT NULL,
    sequence_order INT NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    total_weightage INT NOT NULL DEFAULT 100 CHECK (total_weightage > 0),
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_round_type CHECK (round_type IN ('MCQ', 'DEBUGGING', 'CRASH_FIX')),
    CONSTRAINT uq_event_round_sequence UNIQUE (event_id, sequence_order)
);

CREATE INDEX idx_rounds_event_id ON public.rounds(event_id);

-- --------------------------------------------------------------------
-- 5. QUESTIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_markdown TEXT NOT NULL,
    points INT NOT NULL CHECK (points >= 0),
    negative_points INT DEFAULT 0 CHECK (negative_points >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_round_id ON public.questions(round_id);

-- --------------------------------------------------------------------
-- 6. MCQ OPTIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mcq_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    option_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_question_option_order UNIQUE (question_id, option_order)
);

CREATE INDEX idx_mcq_options_question_id ON public.mcq_options(question_id);

-- --------------------------------------------------------------------
-- 7. CODING QUESTIONS TABLE (For Debugging & Crash & Fix)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coding_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL DEFAULT 'javascript',
    initial_code TEXT NOT NULL,
    solution_code TEXT NOT NULL,
    crash_patch_target TEXT, -- Expected diff/patch target for Crash & Fix
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{input, expected_output, hidden: boolean}]
    time_limit_ms INT DEFAULT 2000,
    memory_limit_mb INT DEFAULT 256,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coding_questions_question_id ON public.coding_questions(question_id);

-- --------------------------------------------------------------------
-- 8. REGISTRATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    total_score INT DEFAULT 0,
    anti_cheat_flag_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_event_registration UNIQUE (user_id, event_id),
    CONSTRAINT chk_registration_status CHECK (status IN ('REGISTERED', 'IN_PROGRESS', 'SUBMITTED', 'DISQUALIFIED'))
);

CREATE INDEX idx_registrations_user_event ON public.registrations(user_id, event_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);

-- --------------------------------------------------------------------
-- 9. SUBMISSIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.mcq_options(id) ON DELETE SET NULL,
    submitted_code TEXT,
    execution_status VARCHAR(30) DEFAULT 'PENDING',
    score_awarded INT DEFAULT 0,
    execution_time_ms INT DEFAULT 0,
    test_results JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_execution_status CHECK (execution_status IN ('PENDING', 'PASSED', 'FAILED', 'COMPILE_ERROR', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED'))
);

CREATE INDEX idx_submissions_registration_id ON public.submissions(registration_id);
CREATE INDEX idx_submissions_question_id ON public.submissions(question_id);

-- --------------------------------------------------------------------
-- 10. SCORES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
    mcq_score INT DEFAULT 0,
    debug_score INT DEFAULT 0,
    crash_fix_score INT DEFAULT 0,
    penalty_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_total_score ON public.scores(total_score DESC);

-- --------------------------------------------------------------------
-- 11. CERTIFICATES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    verify_hash VARCHAR(64) NOT NULL UNIQUE,
    pdf_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificates_verify_hash ON public.certificates(verify_hash);

-- --------------------------------------------------------------------
-- 12. ANNOUNCEMENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_round_id UUID REFERENCES public.rounds(id) ON DELETE SET NULL,
    is_broadcast BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_event_id ON public.announcements(event_id);

-- --------------------------------------------------------------------
-- 13. LOGS TABLE (General Operational Audit Logs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    component VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_user_id ON public.logs(user_id);
CREATE INDEX idx_logs_action ON public.logs(action);

-- --------------------------------------------------------------------
-- 14. CHEATING LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cheating_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    metadata JSONB DEFAULT '{}'::jsonb,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_incident_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE INDEX idx_cheating_logs_registration_id ON public.cheating_logs(registration_id);
CREATE INDEX idx_cheating_logs_severity ON public.cheating_logs(severity);

-- --------------------------------------------------------------------
-- 15. BROWSER ACTIVITY TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.browser_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    url_path VARCHAR(255) NOT NULL,
    viewport_width INT,
    viewport_height INT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_browser_activity_registration ON public.browser_activity(registration_id);

-- --------------------------------------------------------------------
-- 16. TAB SWITCH LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tab_switch_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    focus_lost_at TIMESTAMPTZ NOT NULL,
    focus_gained_at TIMESTAMPTZ,
    duration_seconds INT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tab_switch_registration ON public.tab_switch_logs(registration_id);

-- --------------------------------------------------------------------
-- 17. TIMER LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    round_id UUID REFERENCES public.rounds(id) ON DELETE SET NULL,
    server_time TIMESTAMPTZ NOT NULL,
    client_time TIMESTAMPTZ NOT NULL,
    drift_ms INT NOT NULL DEFAULT 0,
    remaining_seconds INT NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timer_logs_registration ON public.timer_logs(registration_id);

-- --------------------------------------------------------------------
-- 18. LEADERBOARD TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
    total_score INT NOT NULL DEFAULT 0,
    completion_time_seconds INT NOT NULL DEFAULT 0,
    rank INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_event_score ON public.leaderboard(event_id, total_score DESC, completion_time_seconds ASC);

-- --------------------------------------------------------------------
-- 19. NOTIFICATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_notification_type CHECK (type IN ('INFO', 'WARNING', 'ANNOUNCEMENT', 'DISQUALIFICATION'))
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ====================================================================
-- STORED PROCEDURES & TRIGGERS
-- ====================================================================

-- Automated Leaderboard Recalculation Procedure
CREATE OR REPLACE FUNCTION public.recalculate_event_leaderboard(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH RankedRegistrations AS (
        SELECT 
            r.id AS registration_id,
            COALESCE(s.total_score, 0) AS calculated_score,
            EXTRACT(EPOCH FROM (COALESCE(r.ended_at, NOW()) - COALESCE(r.started_at, NOW())))::INT AS completion_seconds,
            ROW_NUMBER() OVER (
                PARTITION BY r.event_id 
                ORDER BY COALESCE(s.total_score, 0) DESC, 
                         EXTRACT(EPOCH FROM (COALESCE(r.ended_at, NOW()) - COALESCE(r.started_at, NOW()))) ASC
            ) AS calculated_rank
        FROM public.registrations r
        LEFT JOIN public.scores s ON s.registration_id = r.id
        WHERE r.event_id = p_event_id AND r.status != 'DISQUALIFIED'
    )
    INSERT INTO public.leaderboard (event_id, registration_id, total_score, completion_time_seconds, rank, updated_at)
    SELECT p_event_id, registration_id, calculated_score, completion_seconds, calculated_rank, NOW()
    FROM RankedRegistrations
    ON CONFLICT (registration_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        completion_time_seconds = EXCLUDED.completion_time_seconds,
        rank = EXCLUDED.rank,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate score when submission occurs
CREATE OR REPLACE FUNCTION public.trg_submission_score_update()
RETURNS TRIGGER AS $$
DECLARE
    v_registration_id UUID;
    v_event_id UUID;
BEGIN
    v_registration_id := NEW.registration_id;
    SELECT event_id INTO v_event_id FROM public.registrations WHERE id = v_registration_id;

    -- Upsert score
    INSERT INTO public.scores (registration_id, mcq_score, total_score, calculated_at)
    VALUES (v_registration_id, NEW.score_awarded, NEW.score_awarded, NOW())
    ON CONFLICT (registration_id) DO UPDATE SET
        total_score = public.scores.total_score + EXCLUDED.total_score,
        calculated_at = NOW();

    -- Recalculate event leaderboard
    PERFORM public.recalculate_event_leaderboard(v_event_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_submission_insert_or_update
AFTER INSERT OR UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_submission_score_update();

-- Enable Row Level Security (RLS) on key tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheating_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policy Definitions
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Leaderboard viewable by all authenticated users" ON public.leaderboard FOR SELECT USING (true);

-- Questions Table RLS Policies: Allow Read to All, Allow Full Management to Admins
CREATE POLICY "Allow public select access to questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow admin insert access to questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update access to questions" ON public.questions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin delete access to questions" ON public.questions FOR DELETE USING (true);
