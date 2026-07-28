'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Award, Clock, ShieldCheck, ArrowRight, Home } from 'lucide-react';

export default function SubmissionSummaryPage() {
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

        {/* Attempt Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-left">
          <div>
            <span className="text-[10px] text-slate-500 block">TOTAL SCORE</span>
            <span className="text-xl font-bold text-indigo-400">98 / 120</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block">COMPLETION TIME</span>
            <span className="text-xl font-bold text-slate-200">14m 22s</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block">ANTI-CHEAT AUDIT</span>
            <span className="text-xl font-bold text-emerald-400">CLEAN (0 Flags)</span>
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
