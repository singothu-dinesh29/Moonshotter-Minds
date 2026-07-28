-- -------------------------------------------------------------
-- SYMPHOSIUM 2026 COMPLETE DATABASE SCHEMA & TABLES MIGRATION
-- Project: https://rmorfjubnpplfqjdfisa.supabase.co
-- -------------------------------------------------------------

-- 1. DROP EXISTING IF NEEDED
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.leaderboards CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.coding_questions CASCADE;
DROP TABLE IF EXISTS public.mcq_options CASCADE;
DROP TABLE IF EXISTS public.question_versions CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.rounds CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS round_type CASCADE;
DROP TYPE IF EXISTS registration_status CASCADE;
DROP TYPE IF EXISTS question_status CASCADE;

-- 2. CREATE ENUMS
CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE round_type AS ENUM ('MCQ', 'DEBUGGING', 'CRASH_FIX');
CREATE TYPE registration_status AS ENUM ('REGISTERED', 'IN_PROGRESS', 'SUBMITTED', 'DISQUALIFIED');
CREATE TYPE question_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- 3. USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  college_name TEXT NOT NULL,
  role user_role DEFAULT 'STUDENT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EVENTS TABLE
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'UPCOMING',
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROUNDS TABLE
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  round_type round_type NOT NULL,
  sequence_order INT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 15,
  total_weightage INT NOT NULL DEFAULT 30,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTIONS TABLE
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  points INT NOT NULL DEFAULT 10,
  negative_points INT DEFAULT 0,
  version INT DEFAULT 1,
  status question_status DEFAULT 'PUBLISHED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUESTION VERSIONS TABLE
CREATE TABLE public.question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  version INT NOT NULL,
  editor_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MCQ OPTIONS TABLE
CREATE TABLE public.mcq_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  option_order INT NOT NULL
);

-- 9. CODING QUESTIONS TABLE
CREATE TABLE public.coding_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'javascript',
  initial_code TEXT NOT NULL,
  solution_code TEXT NOT NULL,
  test_cases JSONB DEFAULT '[]'::jsonb,
  time_limit_ms INT DEFAULT 2000,
  memory_limit_mb INT DEFAULT 256
);

-- 10. REGISTRATIONS TABLE
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'REGISTERED',
  total_score INT DEFAULT 0,
  anti_cheat_flag_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. LEADERBOARD TABLE
CREATE TABLE public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  total_score INT NOT NULL DEFAULT 0,
  completion_time_seconds INT NOT NULL DEFAULT 0,
  rank INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  device TEXT,
  browser TEXT
);

-- ENABLE RLS & PUBLIC POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read access on rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Allow public read access on questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on leaderboards" ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "Allow public read access on audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- INSERT INITIAL SYMPHOSIUM 2026 EVENT DATA
INSERT INTO public.events (title, description, start_time, end_time, status)
VALUES (
  'Symposium National Technical Grand Prix 2026',
  'Multi-tier collegiate coding & debugging championship hosted by Muthayammal Engineering College.',
  NOW(),
  NOW() + INTERVAL '1 day',
  'LIVE'
);
