'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Award, Clock, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import { getDynamicScorecard, calculatePublishedQuestionsMaxScore, DynamicScorecard } from '@/lib/scoringEngine';
import { formatSeconds } from '@/lib/utils';

export default function SubmissionSummaryPage() {
  const [scorecard, setScorecard] = React.useState<DynamicScorecard | null>(null);
  const [dynamicMaxScore, setDynamicMaxScore] = React.useState<number>(0);

  React.useEffect(() => {
    const sc = getDynamicScorecard();
    setScorecard(sc);
    if (!sc.totalMaxPoints || sc.totalMaxPoints === 0) {
      calculatePublishedQuestionsMaxScore().then((maxVal) => {
        if (maxVal > 0) setDynamicMaxScore(maxVal);
      });
    } else {
      setDynamicMaxScore(sc.totalMaxPoints);
    }
  }, []);

  const totalScore = scorecard ? scorecard.totalScore : 0;
  const totalMax = dynamicMaxScore || (scorecard ? scorecard.totalMaxPoints : 0);
  const completionSec = scorecard ? scorecard.completionTimeSeconds : 0;
  const flags = scorecard ? scorecard.antiCheatFlags : 0;

  const correctAnswers = scorecard ? scorecard.correctAnswers : 0;
  const wrongAnswers = scorecard ? scorecard.wrongAnswers : 0;
  const skippedQuestions = scorecard ? scorecard.skippedQuestions : 0;
  const positiveMarks = scorecard ? scorecard.positiveMarks : 0;
  const negativeMarks = scorecard ? scorecard.negativeMarks : 0;
  const percentage = totalMax > 0 ? Number(((totalScore / totalMax) * 100).toFixed(1)) : 0;

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
