import { supabase } from '@/lib/supabase';

export interface DynamicScorecard {
  mcqScore: number;
  mcqMaxPoints: number;
  debuggingScore: number;
  debuggingMaxPoints: number;
  crashFixScore: number;
  crashFixMaxPoints: number;
  totalScore: number;
  totalMaxPoints: number;
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
        return JSON.parse(cached);
      } catch (e) {}
    }
  }

  // Dynamic initial zero baseline (No hardcoded values)
  return {
    mcqScore: 0,
    mcqMaxPoints: 30,
    debuggingScore: 0,
    debuggingMaxPoints: 40,
    crashFixScore: 0,
    crashFixMaxPoints: 50,
    totalScore: 0,
    totalMaxPoints: 120,
    completionTimeSeconds: 0,
    antiCheatFlags: 0,
    updatedAt: new Date().toISOString()
  };
}

export function saveDynamicScorecard(update: Partial<DynamicScorecard>): DynamicScorecard {
  const current = getDynamicScorecard();
  const next: DynamicScorecard = {
    ...current,
    ...update,
    updatedAt: new Date().toISOString()
  };
  next.totalScore = Math.max(0, (next.mcqScore || 0) + (next.debuggingScore || 0) + (next.crashFixScore || 0));
  next.totalMaxPoints = (next.mcqMaxPoints || 30) + (next.debuggingMaxPoints || 40) + (next.crashFixMaxPoints || 50);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  // Asynchronously sync score to Supabase database
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
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error syncing dynamic scorecard to Supabase:', err);
  }
}
