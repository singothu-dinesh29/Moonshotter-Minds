'use client';

import React from 'react';
import { Terminal, Shield, Cpu, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#D4AF37]/20 bg-[#0A111E] mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-md shadow-[#D4AF37]/20">
                <Terminal className="h-4 w-4 text-[#0A111E]" />
              </div>
              <span className="font-serif font-bold text-lg text-white tracking-wide">MUTHAYAMMAL ENGINEERING COLLEGE</span>
            </div>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-sans">
              National Level Technical Symposium Examination Engine powered by Next.js 16, Supabase Realtime, and isolated execution sandbox.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                <Activity className="h-3 w-3 animate-pulse text-emerald-400" />
                Supabase Realtime Operational
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                <Shield className="h-3 w-3 text-amber-400" />
                Proctoring Guard Active
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xs font-bold text-amber-300 tracking-wider uppercase mb-3">Academic Competitions</h4>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li className="hover:text-amber-300 transition-colors">Round 1: Speed MCQ & Core CS</li>
              <li className="hover:text-amber-300 transition-colors">Round 2: Algorithmic Debugging</li>
              <li className="hover:text-amber-300 transition-colors">Round 3: Crash & Fix Engineering</li>
              <li className="hover:text-amber-300 transition-colors">Real-Time Leaderboard Matrix</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xs font-bold text-amber-300 tracking-wider uppercase mb-3">Institutional Specs</h4>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li>Framework: Next.js 16 (App Router)</li>
              <li>Database: Supabase PostgreSQL</li>
              <li>Realtime: Supabase WebSockets</li>
              <li>Runner: Sandboxed Code Engine</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#D4AF37]/15 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-sans">
          <p>© 2026 Muthayammal Engineering College. All rights reserved.</p>
          <p className="text-[11px] text-amber-400/80">Institutional Grand Prix Edition</p>
        </div>
      </div>
    </footer>
  );
}
