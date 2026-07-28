'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Lock, 
  CopyX, 
  Maximize2, 
  Clock, 
  Send, 
  Ban, 
  AlertTriangle,
  CheckCircle2,
  FileCode
} from 'lucide-react';

export default function EventRules() {
  const RULES = [
    {
      id: 'rule-1',
      title: 'No Tab Switching (3 Flags Limit)',
      description: 'Switching browser tabs or minimizing the window logs a security flag. Exceeding 3 flags will automatically terminate your exam session.',
      icon: ShieldAlert,
      accentColor: 'red',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30'
    },
    {
      id: 'rule-2',
      title: 'No Copying Allowed',
      description: 'Copying question text, code templates, or problem statements is strictly locked by client-side security sensors.',
      icon: CopyX,
      accentColor: 'amber',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'rule-3',
      title: 'No Pasting Allowed',
      description: 'Pasting external code snippets into the Monaco Code Editor is disabled for anti-cheat integrity.',
      icon: Lock,
      accentColor: 'amber',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'rule-4',
      title: 'Fullscreen Mode Required',
      description: 'Candidates must enable full-screen mode before launching any round. Exiting full-screen mode logs an immediate severity flag.',
      icon: Maximize2,
      accentColor: 'indigo',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'rule-5',
      title: 'Server-Synced Live Timer',
      description: 'Each round runs on a strict server-synced countdown timer. The timer continues even if you disconnect.',
      icon: Clock,
      accentColor: 'cyan',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'rule-6',
      title: 'Automatic Paper Submission',
      description: 'When the timer reaches 00:00, your current code draft and MCQ answers are automatically locked and submitted to Supabase.',
      icon: Send,
      accentColor: 'emerald',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'rule-7',
      title: 'Late Submissions Disabled',
      description: 'No late submissions or re-entries are accepted after the global round cutoff time has elapsed.',
      icon: Ban,
      accentColor: 'red',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30'
    }
  ];

  return (
    <section id="rules" className="py-20 md:py-28 bg-[#081120] border-b border-slate-800/80 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-red-600/10 via-amber-500/10 to-transparent blur-[160px] pointer-events-none rounded-full" 
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono"
          >
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>ANTI-CHEAT & EXAM REGULATIONS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            Competition Rules & Integrity Guidelines
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 leading-relaxed font-sans"
          >
            Please review the security regulations below. All candidate sessions are actively monitored by our real-time proctoring engine.
          </motion.p>
        </div>

        {/* PREMIUM RULES CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RULES.map((rule, idx) => {
            const Icon = rule.icon;

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-6 md:p-8 rounded-2xl space-y-4 hover:scale-[1.02] transition-all shadow-xl backdrop-blur-md relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${rule.badgeBg}`}>
                    ENFORCED
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-white">{rule.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{rule.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
