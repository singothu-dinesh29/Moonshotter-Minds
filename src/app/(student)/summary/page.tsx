'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Award, Home, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getDynamicScorecard, calculatePublishedQuestionsMaxScore, DynamicScorecard } from '@/lib/scoringEngine';
import { formatSeconds } from '@/lib/utils';

export default function SubmissionSummaryPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasSubmission, setHasSubmission] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<DynamicScorecard | null>(null);
  const [maxScore, setMaxScore] = useState<number>(0);

  useEffect(() => {
    async function loadStudentAttemptFromSupabase() {
      try {
        setIsLoading(true);

        // 1. Resolve student ID from active session
        let studentId = 'candidate-2026-cs-942';
        if (typeof window !== 'undefined') {
          const storedUserStr = sessionStorage.getItem('symphosium_user') || localStorage.getItem('symphosium_user');
          if (storedUserStr) {
            try {
              const parsed = JSON.parse(storedUserStr);
              if (parsed && parsed.id) studentId = parsed.id;
            } catch (e) {}
          }
        }

        // 2. Fetch latest submitted attempt record from Supabase leaderboard table
        const { data: lbData } = await supabase
          .from('leaderboard')
          .select('*')
          .or(`student_id.eq.${studentId},registration_id.eq.${studentId},registration_id.eq.reg-${studentId}`)
          .order('updated_at', { ascending: false })
          .limit(1);

        // 3. Fetch max score dynamically from published questions in Supabase
        const dbMax = await calculatePublishedQuestionsMaxScore();

        // 4. Read dynamic scorecard local storage cache
        const localSc = getDynamicScorecard();

        if ((lbData && lbData.length > 0) || localSc.totalMaxPoints > 0 || localSc.completionTimeSeconds > 0 || localSc.totalScore > 0) {
          const lb = lbData?.[0];
          const mergedScorecard: DynamicScorecard = {
            mcqScore: lb?.round_1_score ?? localSc.mcqScore ?? 0,
            mcqMaxPoints: localSc.mcqMaxPoints || 0,
            debuggingScore: lb?.round_2_score ?? localSc.debuggingScore ?? 0,
            debuggingMaxPoints: localSc.debuggingMaxPoints || 0,
            crashFixScore: lb?.round_3_score ?? localSc.crashFixScore ?? 0,
            crashFixMaxPoints: localSc.crashFixMaxPoints || 0,

            correctAnswers: localSc.correctAnswers || 0,
            wrongAnswers: localSc.wrongAnswers || 0,
            skippedQuestions: localSc.skippedQuestions || 0,
            positiveMarks: localSc.positiveMarks || 0,
            negativeMarks: localSc.negativeMarks || 0,

            totalScore: lb?.total_score ?? localSc.totalScore ?? 0,
            totalMaxPoints: dbMax || localSc.totalMaxPoints || 0,
            percentage: 0,

            completionTimeSeconds: lb?.completion_time_seconds ?? localSc.completionTimeSeconds ?? 0,
            antiCheatFlags: lb?.anti_cheat_flag_count ?? localSc.antiCheatFlags ?? 0,
            updatedAt: lb?.updated_at || new Date().toISOString()
          };

          const calculatedMax = dbMax || mergedScorecard.totalMaxPoints;
          mergedScorecard.percentage = calculatedMax > 0 ? Number(((mergedScorecard.totalScore / calculatedMax) * 100).toFixed(1)) : 0;

          setScorecard(mergedScorecard);
          setMaxScore(calculatedMax);
          setHasSubmission(true);
        } else {
          setHasSubmission(false);
        }
      } catch (err) {
        console.error('Error fetching student attempt from Supabase:', err);
        setHasSubmission(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadStudentAttemptFromSupabase();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          <span>Fetching submitted examination attempt from Supabase PostgreSQL...</span>
        </div>
      </div>
    );
  }

  if (!hasSubmission || !scorecard) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 space-y-5 text-center">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No submitted attempt found.</h2>
            <p className="text-xs text-slate-400">
              No active or historical exam submission record was found for your account in Supabase PostgreSQL.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Home className="h-4 w-4 text-slate-400" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalScore = scorecard.totalScore;
  const totalMax = maxScore || scorecard.totalMaxPoints;
  const percentage = scorecard.percentage;
  const completionSec = scorecard.completionTimeSeconds;

  const correctAnswers = scorecard.correctAnswers;
  const wrongAnswers = scorecard.wrongAnswers;
  const skippedQuestions = scorecard.skippedQuestions;
  const positiveMarks = scorecard.positiveMarks;
  const negativeMarks = scorecard.negativeMarks;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass-panel-glow p-8 rounded-2xl border border-slate-800 space-y-6 text-center">
        
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="h-8 w-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SUBMISSION ACCEPTED & LOGGED
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">Examination Completed Successfully</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your attempts for Speed MCQ, Debugging Arena, and Crash & Fix have been evaluated and stored into Supabase PostgreSQL.
          </p>
        </div>

        {/* Dynamic Detailed Evaluation Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-left">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block">FINAL SCORE</span>
            <span className="text-lg font-bold text-indigo-400">{totalScore}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block">MAXIMUM SCORE</span>
            <span className="text-lg font-bold text-slate-200">{totalMax}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block">PERCENTAGE</span>
            <span className="text-lg font-bold text-cyan-400">{percentage}%</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block">COMPLETION TIME</span>
            <span className="text-lg font-bold text-slate-200">{formatSeconds(completionSec)}</span>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">CORRECT ANSWERS</span>
            <span className="text-base font-bold text-emerald-400">{correctAnswers}</span>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">WRONG ANSWERS</span>
            <span className="text-base font-bold text-rose-400">{wrongAnswers}</span>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">SKIPPED QUESTIONS</span>
            <span className="text-base font-bold text-amber-400">{skippedQuestions}</span>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">POSITIVE / NEGATIVE</span>
            <span className="text-xs font-bold text-emerald-400">+{positiveMarks} <span className="text-rose-400">/ -{negativeMarks}</span></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/admin/leaderboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20"
          >
            <Award className="h-4 w-4" />
            View Live Leaderboard
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Home className="h-4 w-4 text-slate-400" />
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
