'use client';

import React, { useState } from 'react';
import { ShieldCheck, Maximize2, Lock, AlertTriangle, Check } from 'lucide-react';

interface GuardProps {
  onStartExam: () => void;
  maxViolationsAllowed?: number;
}

export default function AntiCheatGuardModal({ onStartExam, maxViolationsAllowed = 3 }: GuardProps) {
  const [fullscreenReady, setFullscreenReady] = useState(false);

  const handleEnableFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setFullscreenReady(true);
    } else {
      setFullscreenReady(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Anti-Cheat Security & System Diagnostics</h3>
            <p className="text-xs text-slate-400">Mandatory browser security verification before launching exam</p>
          </div>
        </div>

        {/* Security Rules Breakdown */}
        <div className="space-y-3 font-mono text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-200 font-bold">
              <span>Full Screen Lockdown Mode:</span>
              <span className={fullscreenReady ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {fullscreenReady ? 'ENABLED' : 'REQUIRED'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Tab Switch Limit:</span>
              <span className="text-red-400 font-bold">{maxViolationsAllowed} Flags Max</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Clipboard Guard:</span>
              <span className="text-emerald-400 font-bold">Copy / Paste Disabled</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Shortcut Guard:</span>
              <span className="text-emerald-400 font-bold">F12 / Ctrl+C/V Locked</span>
            </div>
          </div>
        </div>

        {/* Disclaimer on Security Limits */}
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Notice: Anti-cheat sensors log window blur, tab switching, and fullscreen exits. Accumulating {maxViolationsAllowed} flag violations will automatically lock and submit your examination paper.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!fullscreenReady ? (
            <button
              onClick={handleEnableFullscreen}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Maximize2 className="h-4 w-4" /> Enable Full Screen Lock Mode
            </button>
          ) : (
            <button
              onClick={onStartExam}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" /> System Verified — Enter Examination Arena
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
