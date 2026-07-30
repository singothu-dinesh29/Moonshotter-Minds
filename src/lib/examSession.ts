import { supabase } from '@/lib/supabase';

export interface ExamSession {
  studentId: string;
  eventId: string;
  startTime: string; // ISO timestamp
  endTime: string;   // ISO timestamp
  durationSeconds: number;
  isStarted: boolean;
}

const SESSION_KEY_PREFIX = 'symposium_active_exam_session_';

/**
 * Returns active exam session if student HAS already started the exam.
 * Returns null if student is still in lobby and has NOT started yet.
 */
export function getActiveExamSession(studentId: string = 'candidate-2026-cs-942'): ExamSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`${SESSION_KEY_PREFIX}${studentId}`) || sessionStorage.getItem(`${SESSION_KEY_PREFIX}${studentId}`);
  if (!raw) return null;
  try {
    const session: ExamSession = JSON.parse(raw);
    if (session && session.isStarted) {
      return session;
    }
  } catch (e) {}
  return null;
}

/**
 * Calculates remaining exam seconds based on real clock end time.
 */
export function getRemainingExamSeconds(session: ExamSession): number {
  if (!session || !session.endTime) return 0;
  const endMs = new Date(session.endTime).getTime();
  const nowMs = Date.now();
  const diffSec = Math.floor((endMs - nowMs) / 1000);
  return Math.max(0, diffSec);
}

/**
 * Starts an exam session ONLY when student confirms "Start Exam".
 * Writes start time, end time, and duration to Supabase DB & Local Storage.
 */
export async function startExamSession(
  durationSeconds: number,
  studentId: string = 'candidate-2026-cs-942',
  eventId: string = 'evt-symposium-2026'
): Promise<ExamSession> {
  const startTime = new Date().toISOString();
  const endTime = new Date(Date.now() + durationSeconds * 1000).toISOString();

  const session: ExamSession = {
    studentId,
    eventId,
    startTime,
    endTime,
    durationSeconds,
    isStarted: true
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${SESSION_KEY_PREFIX}${studentId}`, JSON.stringify(session));
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${studentId}`, JSON.stringify(session));
  }

  try {
    const regId = `reg-${studentId}`;
    await supabase.from('registrations').upsert({
      id: regId,
      user_id: studentId,
      event_id: eventId,
      status: 'IN_PROGRESS',
      started_at: startTime,
      exam_start_time: startTime,
      exam_end_time: endTime,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error saving exam start session to Supabase:', err);
  }

  return session;
}

/**
 * Fetches configured exam duration in seconds from Supabase rounds / settings.
 */
export async function getConfiguredExamDurationSeconds(): Promise<number> {
  try {
    const { data: rounds } = await supabase.from('rounds').select('duration_minutes');
    if (rounds && rounds.length > 0) {
      const totalMins = rounds.reduce((sum: number, r: any) => sum + (r.duration_minutes || 0), 0);
      if (totalMins > 0) return totalMins * 60;
    }
  } catch (e) {}

  // Fallback to 45 minutes (2700 seconds) if no custom admin rounds configured
  return 45 * 60;
}
