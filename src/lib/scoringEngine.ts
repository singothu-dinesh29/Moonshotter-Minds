import { supabase } from '@/lib/supabase';

export interface DynamicScorecard {
  mcqScore: number;
  mcqMaxPoints: number;
  debuggingScore: number;
  debuggingMaxPoints: number;
  crashFixScore: number;
  crashFixMaxPoints: number;
  
  // Detailed marking metrics
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  positiveMarks: number;
  negativeMarks: number;

  totalScore: number;
  totalMaxPoints: number;
  percentage: number;

  completionTimeSeconds: number;
  antiCheatFlags: number;
  updatedAt: string;
}

const STORAGE_KEY = 'symposium_exam_scorecard_v2';

export function getDynamicScorecard(): DynamicScorecard {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.totalMaxPoints = (parsed.mcqMaxPoints || 0) + (parsed.debuggingMaxPoints || 0) + (parsed.crashFixMaxPoints || 0);
        parsed.percentage = parsed.totalMaxPoints > 0 ? Number(((parsed.totalScore / parsed.totalMaxPoints) * 100).toFixed(1)) : 0;
        return parsed;
      } catch (e) {}
    }
  }

  return {
    mcqScore: 0,
    mcqMaxPoints: 0,
    debuggingScore: 0,
    debuggingMaxPoints: 0,
    crashFixScore: 0,
    crashFixMaxPoints: 0,

    correctAnswers: 0,
    wrongAnswers: 0,
    skippedQuestions: 0,
    positiveMarks: 0,
    negativeMarks: 0,

    totalScore: 0,
    totalMaxPoints: 0,
    percentage: 0,

    completionTimeSeconds: 0,
    antiCheatFlags: 0,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Calculates Maximum Score = Sum of Positive Marks of every published question in Supabase DB.
 */
export async function calculatePublishedQuestionsMaxScore(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*');

    if (!error && data) {
      const published = data.filter((q: any) => q.status === 'PUBLISHED' || q.status === 'Published');
      if (published.length > 0) {
        return published.reduce((sum: number, q: any) => {
          const positiveMarks = typeof q.points === 'number' ? q.points : (typeof q.marks === 'number' ? q.marks : 0);
          return sum + positiveMarks;
        }, 0);
      }
    }
  } catch (err) {
    console.error('Error fetching published questions max score:', err);
  }
  return 0;
}

export function saveDynamicScorecard(update: Partial<DynamicScorecard>): DynamicScorecard {
  const current = getDynamicScorecard();
  const next: DynamicScorecard = {
    ...current,
    ...update,
    updatedAt: new Date().toISOString()
  };
  
  next.totalScore = Math.max(0, (next.mcqScore || 0) + (next.debuggingScore || 0) + (next.crashFixScore || 0));
  next.totalMaxPoints = (next.mcqMaxPoints || 0) + (next.debuggingMaxPoints || 0) + (next.crashFixScore || 0) > 0 
    ? (next.mcqMaxPoints || 0) + (next.debuggingMaxPoints || 0) + (next.crashFixMaxPoints || 0) 
    : next.totalMaxPoints;

  next.percentage = next.totalMaxPoints > 0 ? Number(((next.totalScore / next.totalMaxPoints) * 100).toFixed(1)) : 0;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  // Asynchronously sync score & leaderboard to Supabase
  syncScorecardToSupabase(next);

  return next;
}

export async function syncScorecardToSupabase(scorecard: DynamicScorecard) {
  try {
    const studentId = 'candidate-2026-cs-942';
    const eventId = 'evt-symposium-2026';

    // 1. Sync candidate registration record in Supabase
    await supabase.from('registrations').upsert({
      id: 'reg-candidate-942',
      user_id: studentId,
      event_id: eventId,
      status: 'SUBMITTED',
      total_score: scorecard.totalScore,
      anti_cheat_flag_count: scorecard.antiCheatFlags,
      updated_at: new Date().toISOString()
    });

    // 2. Sync candidate leaderboard record in Supabase
    await supabase.from('leaderboard').upsert({
      id: `lb-${studentId}`,
      event_id: eventId,
      registration_id: 'reg-candidate-942',
      student_id: studentId,
      round_1_score: scorecard.mcqScore,
      round_2_score: scorecard.debuggingScore,
      round_3_score: scorecard.crashFixScore,
      total_score: scorecard.totalScore,
      completion_time_seconds: scorecard.completionTimeSeconds,
      anti_cheat_flag_count: scorecard.antiCheatFlags,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error syncing dynamic scorecard to Supabase:', err);
  }
}

/**
 * Ranks students strictly by:
 * 1. Final Score (total_score DESC)
 * 2. Completion Time (completion_time_seconds ASC)
 * 3. Least Malpractice Flags (anti_cheat_flag_count ASC)
 */
export function sortLeaderboardRecords<T extends Record<string, any>>(records: T[]): T[] {
  const sorted = [...records].sort((a, b) => {
    // 1. Final Score (descending)
    const scoreA = Number(a.total_score ?? a.totalScore ?? 0);
    const scoreB = Number(b.total_score ?? b.totalScore ?? 0);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // 2. Completion Time (ascending)
    const timeA = Number(a.completion_time_seconds ?? a.completionTimeSeconds ?? Infinity);
    const timeB = Number(b.completion_time_seconds ?? b.completionTimeSeconds ?? Infinity);
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 3. Least Malpractice Flags (ascending)
    const flagsA = Number(a.anti_cheat_flag_count ?? a.antiCheatFlags ?? a.registration?.anti_cheat_flag_count ?? 0);
    const flagsB = Number(b.anti_cheat_flag_count ?? b.antiCheatFlags ?? b.registration?.anti_cheat_flag_count ?? 0);
    return flagsA - flagsB;
  });

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}

/**
 * Universal, case-insensitive question publisher and round filter.
 * Guarantees 100% data flow parity between Admin, Dashboard, and Arena.
 */
export function isQuestionPublishedForRound(q: any, targetRound: 'MCQ' | 'DEBUGGING' | 'CRASH_FIX'): boolean {
  if (!q) return false;

  const status = (q.status || '').toString().trim().toUpperCase();
  if (status !== 'PUBLISHED') return false;

  const type = (q.type || '').toString().trim().toUpperCase();
  const round = (q.round || '').toString().trim().toUpperCase();
  const roundId = (q.round_id || '').toString().trim().toLowerCase();

  if (targetRound === 'MCQ') {
    return (
      type === 'MCQ' ||
      type.includes('MCQ') ||
      roundId === 'round-1' ||
      round.includes('MCQ') ||
      round.includes('ROUND 1') ||
      round.includes('ROUND 01') ||
      !q.type
    );
  }

  if (targetRound === 'DEBUGGING') {
    return (
      type === 'DEBUGGING' ||
      type.includes('DEBUG') ||
      roundId === 'round-2' ||
      round.includes('DEBUG') ||
      round.includes('ROUND 2') ||
      round.includes('ROUND 02')
    );
  }

  if (targetRound === 'CRASH_FIX') {
    return (
      type === 'CRASH & FIX' ||
      type === 'CRASH_FIX' ||
      type.includes('CRASH') ||
      roundId === 'round-3' ||
      round.includes('CRASH') ||
      round.includes('ROUND 3') ||
      round.includes('ROUND 03')
    );
  }

  return false;
}
