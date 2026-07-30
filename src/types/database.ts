export type UserRole = 'STUDENT' | 'ADMIN' | 'PROCTOR';

export interface UserRoleRecord {
  id: string;
  name: UserRole;
  description: string;
  created_at: string;
}

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  college_name: string;
  phone_number?: string;
  role_id: string;
  role?: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'LIVE' | 'PAUSED' | 'COMPLETED';

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: EventStatus;
  config: {
    negative_marking: boolean;
    tab_switch_limit: number;
    auto_disqualify: boolean;
    show_live_leaderboard: boolean;
  };
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type RoundType = 'MCQ' | 'DEBUGGING' | 'CRASH_FIX';

export interface RoundRecord {
  id: string;
  event_id: string;
  title: string;
  round_type: RoundType;
  sequence_order: number;
  duration_minutes: number;
  total_weightage: number;
  instructions: string;
  created_at: string;
}

export interface QuestionRecord {
  id: string;
  round_id: string;
  title: string;
  content_markdown: string;
  points: number;
  negative_points: number;
  created_at: string;
}

export interface McqOptionRecord {
  id: string;
  question_id: string;
  option_text: string;
  is_correct?: boolean; // Hidden from candidate queries
  option_order: number;
  created_at: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  hidden?: boolean;
}

export interface CodingQuestionRecord {
  id: string;
  question_id: string;
  language: string;
  initial_code: string;
  solution_code: string;
  crash_patch_target?: string;
  test_cases: TestCase[];
  time_limit_ms: number;
  memory_limit_mb: number;
  created_at: string;
}

export interface ExamSnapshotRecord {
  id: string;
  student_id: string;
  round: string;
  question_ids: string[];
  question_order: { id: string; index: number }[];
  mcq_option_order?: { id: string; options: string[] }[];
  timer: number;
  marks: number;
  negative_marks: number;
  snapshot_data: any;
  created_at: string;
}

export type RegistrationStatus = 'REGISTERED' | 'IN_PROGRESS' | 'SUBMITTED' | 'DISQUALIFIED';

export interface RegistrationRecord {
  id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus;
  started_at?: string;
  ended_at?: string;
  total_score: number;
  anti_cheat_flag_count: number;
  user?: UserRecord;
  event?: EventRecord;
  created_at: string;
}

export type ExecutionStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'COMPILE_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED';

export interface SubmissionRecord {
  id: string;
  registration_id: string;
  question_id: string;
  selected_option_id?: string;
  submitted_code?: string;
  execution_status: ExecutionStatus;
  score_awarded: number;
  execution_time_ms: number;
  test_results?: any[];
  submitted_at: string;
}

export interface ScoreRecord {
  id: string;
  registration_id: string;
  mcq_score: number;
  debug_score: number;
  crash_fix_score: number;
  penalty_score: number;
  total_score: number;
  calculated_at: string;
}

export interface CertificateRecord {
  id: string;
  registration_id: string;
  certificate_number: string;
  verify_hash: string;
  pdf_url?: string;
  issued_at: string;
}

export interface AnnouncementRecord {
  id: string;
  event_id: string;
  title: string;
  content: string;
  target_round_id?: string;
  is_broadcast: boolean;
  created_at: string;
}

export interface LogRecord {
  id: string;
  user_id?: string;
  action: string;
  component: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CheatingLogRecord {
  id: string;
  registration_id: string;
  incident_type: 'TAB_SWITCH' | 'BLUR' | 'COPY_PASTE' | 'FULLSCREEN_EXIT' | 'MULTI_DEVICE' | 'PASTE_ATTEMPT';
  severity: SeverityLevel;
  metadata: Record<string, any>;
  logged_at: string;
  registration?: RegistrationRecord;
}

export interface BrowserActivityRecord {
  id: string;
  registration_id: string;
  event_type: string;
  url_path: string;
  viewport_width?: number;
  viewport_height?: number;
  logged_at: string;
}

export interface TabSwitchLogRecord {
  id: string;
  registration_id: string;
  focus_lost_at: string;
  focus_gained_at?: string;
  duration_seconds?: number;
  logged_at: string;
}

export interface TimerLogRecord {
  id: string;
  registration_id: string;
  round_id?: string;
  server_time: string;
  client_time: string;
  drift_ms: number;
  remaining_seconds: number;
  logged_at: string;
}

export interface LeaderboardRecord {
  id: string;
  event_id: string;
  registration_id: string;
  total_score: number;
  completion_time_seconds: number;
  rank: number;
  updated_at: string;
  registration?: RegistrationRecord;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ANNOUNCEMENT' | 'DISQUALIFICATION';
  is_read: boolean;
  created_at: string;
}
