'use client';

import React from 'react';
import { Terminal, Shield, Cpu, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Terminal className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">SYMPHOSIUM PLATFORM</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Enterprise national college symposium examination platform powered by Next.js 16, Supabase Realtime, and isolated Docker sandbox execution engine.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Activity className="h-3 w-3 animate-pulse" />
                Supabase Engine Operational
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                <Shield className="h-3 w-3" />
                Anti-Cheat Shield Active
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-3">Examination Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-indigo-400 transition-colors">Round 1: MCQ & Logic Blitz</li>
              <li className="hover:text-indigo-400 transition-colors">Round 2: Debugging Arena</li>
              <li className="hover:text-indigo-400 transition-colors">Round 3: Crash & Fix Engineering</li>
              <li className="hover:text-indigo-400 transition-colors">Real-Time Leaderboard</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-3">Platform Specs</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Framework: Next.js 16 (App Router)</li>
              <li>Database: Supabase PostgreSQL</li>
              <li>Realtime: Supabase WebSockets</li>
              <li>Runner: Sandboxed Docker</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 Symphosium Examination Platform. Built for National Tech Symposiums.</p>
          <p className="font-mono text-[11px]">System Status: 100% Operational | Latency: 12ms</p>
        </div>
      </div>
    </footer>
  );
}
