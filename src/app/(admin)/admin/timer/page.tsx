'use client';

import React, { useState } from 'react';
import { Clock, Pause, Play, PlusCircle, AlertTriangle } from 'lucide-react';

export default function TimerManagementPage() {
  const [examStatus, setExamStatus] = useState<'LIVE' | 'PAUSED'>('LIVE');
  const [remainingMinutes, setRemainingMinutes] = useState(28);

  const handleExtendTime = (mins: number) => {
    setRemainingMinutes((prev) => prev + mins);
    alert(`Broadcasted time extension: +${mins} minutes added to all candidate screens!`);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Live Exam Timer Management</h1>
        <p className="text-xs text-slate-400">Server-synchronized countdown control center & live broadcast time extenders</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-6 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs">
          <Clock className="h-4 w-4 animate-spin" style={{ animationDuration: '6s' }} />
          SERVER SYNCHRONIZED CLOCK
        </div>

        <div className="text-5xl font-black font-mono text-indigo-400">
          00:{remainingMinutes}:45
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setExamStatus(examStatus === 'LIVE' ? 'PAUSED' : 'LIVE')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs transition-all shadow-lg ${
              examStatus === 'LIVE'
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {examStatus === 'LIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {examStatus === 'LIVE' ? 'Pause Exam Broadcast' : 'Resume Live Exam'}
          </button>
        </div>

        <div className="border-t border-slate-800 pt-6 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Time Extension Controls</h4>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleExtendTime(5)}
              className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono"
            >
              +5 Minutes
            </button>
            <button
              onClick={() => handleExtendTime(10)}
              className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-mono font-bold"
            >
              +10 Minutes
            </button>
            <button
              onClick={() => handleExtendTime(15)}
              className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 text-xs font-mono font-bold"
            >
              +15 Minutes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
