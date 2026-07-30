import { createClient } from '@supabase/supabase-js';
import type { 
  EventRecord, 
  RoundRecord, 
  QuestionRecord, 
  McqOptionRecord, 
  CodingQuestionRecord,
  LeaderboardRecord,
  CheatingLogRecord
} from '@/types/database';

export type { 
  EventRecord, 
  RoundRecord, 
  QuestionRecord, 
  McqOptionRecord, 
  CodingQuestionRecord,
  LeaderboardRecord,
  CheatingLogRecord
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rmorfjubnpplfqjdfisa.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_B7haRoKT-yVPDiYGjXpolw_WSPZ26JJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createClient(SUPABASE_URL, serviceRoleKey);
  }
  return supabase;
}

// Mock Database Initializer for standalone dynamic execution
export const MOCK_EVENT: EventRecord = {
  id: 'evt-symposium-2026',
  title: 'Symposium National Technical Grand Prix 2026',
  description: 'The ultimate multi-tier competitive coding & debugging championship hosted for collegiate developers. Test your speed, logic, and patch engineering across 3 high-intensity rounds.',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 mins total
  status: 'LIVE',
  config: {
    negative_marking: true,
    tab_switch_limit: 3,
    auto_disqualify: true,
    show_live_leaderboard: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_ROUNDS: RoundRecord[] = [
  {
    id: 'rnd-1-mcq',
    event_id: MOCK_EVENT.id,
    title: 'Round 1: Speed MCQ & Logic Blitz',
    round_type: 'MCQ',
    sequence_order: 1,
    duration_minutes: 15,
    total_weightage: 30,
    instructions: 'Select the optimal answer for core CS fundamentals, algorithms, and system design questions. +10 pts for correct, -2 pts for incorrect.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rnd-2-debug',
    event_id: MOCK_EVENT.id,
    title: 'Round 2: Algorithmic Debugging Arena',
    round_type: 'DEBUGGING',
    sequence_order: 2,
    duration_minutes: 15,
    total_weightage: 40,
    instructions: 'Identify logic flaws, edge-case bugs, and off-by-one errors in the code snippet. Make all test cases pass!',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rnd-3-crashfix',
    event_id: MOCK_EVENT.id,
    title: 'Round 3: Crash & Fix Patch Engineering',
    round_type: 'CRASH_FIX',
    sequence_order: 3,
    duration_minutes: 15,
    total_weightage: 50,
    instructions: 'The target module is throwing an unhandled runtime Exception or infinite recursion crash. Patch the code under time pressure!',
    created_at: new Date().toISOString(),
  }
];

export const MOCK_MCQ_QUESTIONS: (QuestionRecord & { options: McqOptionRecord[] })[] = [
  {
    id: 'q-mcq-1',
    round_id: MOCK_ROUNDS[0].id,
    title: 'PostgreSQL Indexing & RLS',
    content_markdown: 'What is the time complexity of B-tree index lookup in PostgreSQL for $N$ records?',
    points: 10,
    negative_points: 2,
    created_at: new Date().toISOString(),
    options: [
      { id: 'opt-1a', question_id: 'q-mcq-1', option_text: 'O(1) constant time', is_correct: false, option_order: 1, created_at: '' },
      { id: 'opt-1b', question_id: 'q-mcq-1', option_text: 'O(log N) logarithmic time', is_correct: true, option_order: 2, created_at: '' },
      { id: 'opt-1c', question_id: 'q-mcq-1', option_text: 'O(N) linear time', is_correct: false, option_order: 3, created_at: '' },
      { id: 'opt-1d', question_id: 'q-mcq-1', option_text: 'O(N log N) linearithmic time', is_correct: false, option_order: 4, created_at: '' }
    ]
  },
  {
    id: 'q-mcq-2',
    round_id: MOCK_ROUNDS[0].id,
    title: 'Next.js 16 Server Component Lifecycle',
    content_markdown: 'Where do Next.js App Router React Server Components (RSC) execute by default?',
    points: 10,
    negative_points: 2,
    created_at: new Date().toISOString(),
    options: [
      { id: 'opt-2a', question_id: 'q-mcq-2', option_text: 'Strictly inside the user\'s Web Browser DOM', is_correct: false, option_order: 1, created_at: '' },
      { id: 'opt-2b', question_id: 'q-mcq-2', option_text: 'Exclusively on the Node.js / Edge Server environment', is_correct: true, option_order: 2, created_at: '' },
      { id: 'opt-2c', question_id: 'q-mcq-2', option_text: 'Inside Service Workers only', is_correct: false, option_order: 3, created_at: '' },
      { id: 'opt-2d', question_id: 'q-mcq-2', option_text: 'On client device GPU accelerators', is_correct: false, option_order: 4, created_at: '' }
    ]
  }
];

export const MOCK_DEBUG_QUESTION: QuestionRecord & { coding: CodingQuestionRecord } = {
  id: 'q-debug-1',
  round_id: MOCK_ROUNDS[1].id,
  title: 'Fix Two-Sum Array Algorithm',
  content_markdown: 'The following function is supposed to return indices of the two numbers such that they add up to a target. However, it contains a bug causing wrong indices for duplicate values. Debug and fix the implementation.',
  points: 40,
  negative_points: 0,
  created_at: new Date().toISOString(),
  coding: {
    id: 'code-debug-1',
    question_id: 'q-debug-1',
    language: 'javascript',
    initial_code: `function twoSum(nums, target) {
  // BUG: Map stores key/value incorrectly, missing index check
  const map = {};
  for (let i = 0; i <= nums.length; i++) { // Bug: <= instead of <
    const diff = target - nums[i];
    if (map[diff]) { // Bug: truthy check fails for index 0!
      return [map[diff], i];
    }
    map[nums[i]] = i;
  }
  return [];
}`,
    solution_code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    test_cases: [
      { input: 'twoSum([2, 7, 11, 15], 9)', expected_output: '[0,1]' },
      { input: 'twoSum([3, 2, 4], 6)', expected_output: '[1,2]' },
      { input: 'twoSum([3, 3], 6)', expected_output: '[0,1]' }
    ],
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    created_at: new Date().toISOString()
  }
};

export const MOCK_CRASH_QUESTION: QuestionRecord & { coding: CodingQuestionRecord } = {
  id: 'q-crash-1',
  round_id: MOCK_ROUNDS[2].id,
  title: 'Fix Infinite Recursion Call Stack Crash',
  content_markdown: 'CRITICAL ALERT: The tree depth calculation function crashes with `RangeError: Maximum call stack size exceeded` on deep branches because it lacks a base case termination check! Patch the function to prevent the crash.',
  points: 50,
  negative_points: 0,
  created_at: new Date().toISOString(),
  coding: {
    id: 'code-crash-1',
    question_id: 'q-crash-1',
    language: 'javascript',
    initial_code: `function maxDepth(node) {
  // CRASH HAZARD: Lacks null base case check!
  // Causes RangeError: Maximum call stack size exceeded
  const leftDepth = maxDepth(node.left);
  const rightDepth = maxDepth(node.right);
  return Math.max(leftDepth, rightDepth) + 1;
}`,
    solution_code: `function maxDepth(node) {
  if (!node) return 0;
  const leftDepth = maxDepth(node.left);
  const rightDepth = maxDepth(node.right);
  return Math.max(leftDepth, rightDepth) + 1;
}`,
    crash_patch_target: `+ if (!node) return 0;`,
    test_cases: [
      { input: 'maxDepth({ val: 1, left: { val: 2, left: null, right: null }, right: null })', expected_output: '2' },
      { input: 'maxDepth(null)', expected_output: '0' }
    ],
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    created_at: new Date().toISOString()
  }
};

export const MOCK_INITIAL_LEADERBOARD: LeaderboardRecord[] = [
  {
    id: 'lb-1',
    event_id: MOCK_EVENT.id,
    registration_id: 'reg-101',
    total_score: 98,
    completion_time_seconds: 412,
    rank: 1,
    updated_at: new Date().toISOString(),
    registration: {
      id: 'reg-101',
      user_id: 'u-1',
      event_id: MOCK_EVENT.id,
      status: 'SUBMITTED',
      total_score: 98,
      anti_cheat_flag_count: 0,
      created_at: '',
      user: {
        id: 'u-1',
        email: 'alex.chen@mit.edu',
        full_name: 'Alex Chen',
        college_name: 'MIT Institute of Tech',
        role_id: 'r-student',
        created_at: '',
        updated_at: ''
      }
    }
  },
  {
    id: 'lb-2',
    event_id: MOCK_EVENT.id,
    registration_id: 'reg-102',
    total_score: 90,
    completion_time_seconds: 530,
    rank: 2,
    updated_at: new Date().toISOString(),
    registration: {
      id: 'reg-102',
      user_id: 'u-2',
      event_id: MOCK_EVENT.id,
      status: 'SUBMITTED',
      total_score: 90,
      anti_cheat_flag_count: 1,
      created_at: '',
      user: {
        id: 'u-2',
        email: 'sriya.v@stanford.edu',
        full_name: 'Sriya Verma',
        college_name: 'Stanford University',
        role_id: 'r-student',
        created_at: '',
        updated_at: ''
      }
    }
  },
  {
    id: 'lb-3',
    event_id: MOCK_EVENT.id,
    registration_id: 'reg-103',
    total_score: 80,
    completion_time_seconds: 620,
    rank: 3,
    updated_at: new Date().toISOString(),
    registration: {
      id: 'reg-103',
      user_id: 'u-3',
      event_id: MOCK_EVENT.id,
      status: 'SUBMITTED',
      total_score: 80,
      anti_cheat_flag_count: 0,
      created_at: '',
      user: {
        id: 'u-3',
        email: 'dev.k@iit.ac.in',
        full_name: 'Dev Kumar',
        college_name: 'IIT Bombay',
        role_id: 'r-student',
        created_at: '',
        updated_at: ''
      }
    }
  }
];

export const MOCK_CHEATING_LOGS: CheatingLogRecord[] = [
  {
    id: 'ch-1',
    registration_id: 'reg-102',
    incident_type: 'TAB_SWITCH',
    severity: 'MEDIUM',
    metadata: { duration: '4 seconds', url: '/arena/evt-symposium-2026' },
    logged_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    registration: MOCK_INITIAL_LEADERBOARD[1].registration
  },
  {
    id: 'ch-2',
    registration_id: 'reg-104',
    incident_type: 'COPY_PASTE',
    severity: 'HIGH',
    metadata: { clipboardLength: 420, snippet: 'function twoSum...' },
    logged_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    registration: {
      id: 'reg-104',
      user_id: 'u-4',
      event_id: MOCK_EVENT.id,
      status: 'DISQUALIFIED',
      total_score: 0,
      anti_cheat_flag_count: 4,
      created_at: '',
      user: {
        id: 'u-4',
        email: 'suspect.user@hack.org',
        full_name: 'Rohan Sharma',
        college_name: 'XYZ State College',
        role_id: 'r-student',
        created_at: '',
        updated_at: ''
      }
    }
  }
];

export async function createExamSnapshot(payload: {
  studentId: string;
  round: string;
  questions: any[];
  timer: number;
  marks: number;
  negativeMarks: number;
}) {
  const snapshotRecord = {
    id: `snap-${Date.now()}-${payload.studentId}-${payload.round.replace(/\s+/g, '_')}`,
    student_id: payload.studentId,
    round: payload.round,
    question_ids: payload.questions.map((q) => q.id),
    question_order: payload.questions.map((q, idx) => ({ id: q.id, index: idx + 1 })),
    mcq_option_order: payload.questions.map((q) => ({
      id: q.id,
      options: q.options ? q.options.map((o: any) => o.id || o.text) : []
    })),
    timer: payload.timer,
    marks: payload.marks,
    negative_marks: payload.negativeMarks,
    snapshot_data: payload.questions,
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from('exam_snapshots').upsert(snapshotRecord);
  } catch (err) {
    console.error('Error creating exam snapshot in Supabase:', err);
  }

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`exam_snapshot_${payload.studentId}_${payload.round}`, JSON.stringify(snapshotRecord));
  }

  return snapshotRecord;
}

export async function fetchExamSnapshot(studentId: string, round: string) {
  // Check sessionStorage first for instant load if non-empty
  if (typeof window !== 'undefined') {
    const local = sessionStorage.getItem(`exam_snapshot_${studentId}_${round}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.snapshot_data) && parsed.snapshot_data.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
  }

  // Fetch from Supabase
  try {
    const { data } = await supabase
      .from('exam_snapshots')
      .select('*')
      .eq('student_id', studentId)
      .eq('round', round)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0 && Array.isArray(data[0].snapshot_data) && data[0].snapshot_data.length > 0) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`exam_snapshot_${studentId}_${round}`, JSON.stringify(data[0]));
      }
      return data[0];
    }
  } catch (err) {
    console.error('Error fetching exam snapshot from Supabase:', err);
  }

  return null;
}

export function normalizeMonacoLanguage(lang?: string): string {
  if (!lang) return 'javascript';
  const l = lang.trim().toLowerCase();
  if (l === 'c') return 'c';
  if (l === 'c++' || l === 'cpp') return 'cpp';
  if (l === 'java') return 'java';
  if (l === 'python' || l === 'py') return 'python';
  if (l === 'javascript' || l === 'js') return 'javascript';
  if (l === 'sql') return 'sql';
  if (l === 'typescript' || l === 'ts') return 'typescript';
  return 'javascript';
}

export function getLanguageFileName(lang?: string): string {
  const monacoLang = normalizeMonacoLanguage(lang);
  switch (monacoLang) {
    case 'c': return 'main.c (C)';
    case 'cpp': return 'main.cpp (C++)';
    case 'java': return 'Solution.java (Java)';
    case 'python': return 'main.py (Python)';
    case 'javascript': return 'solution.js (JavaScript)';
    case 'sql': return 'query.sql (SQL)';
    case 'typescript': return 'solution.ts (TypeScript)';
    default: return 'solution.js (JavaScript)';
  }
}

export interface CodeSubmissionRecord {
  id?: string;
  studentId: string;
  questionId: string;
  round: string;
  code: string;
  language: string;
  compilationStatus: 'PASSED' | 'FAILED' | 'COMPILATION_ERROR';
  executionResult: any;
  submittedAt?: string;
}

export async function saveStudentCodeSubmission(payload: CodeSubmissionRecord) {
  const submissionRecord = {
    id: payload.id || `sub-${Date.now()}-${payload.studentId}-${payload.questionId}`,
    student_id: payload.studentId,
    question_id: payload.questionId,
    round: payload.round,
    code: payload.code,
    language: payload.language,
    compilation_status: payload.compilationStatus,
    compilationStatus: payload.compilationStatus,
    execution_result: payload.executionResult,
    executionResult: payload.executionResult,
    submission_time: payload.submittedAt || new Date().toISOString(),
    created_at: payload.submittedAt || new Date().toISOString()
  };

  try {
    await supabase.from('submissions').upsert(submissionRecord);
  } catch (err) {
    console.error('Error saving student code submission to Supabase:', err);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`submission_${payload.questionId}`, JSON.stringify(submissionRecord));
  }

  return submissionRecord;
}
