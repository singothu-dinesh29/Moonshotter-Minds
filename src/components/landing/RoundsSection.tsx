'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Code2, Terminal, Clock, ShieldCheck, Award, ArrowRight, HelpCircle, AlertOctagon } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function RoundsSection() {
  const [questionCounts, setQuestionCounts] = React.useState({ mcq: 15, debug: 2, crash: 2 });

  const fetchPublishedQuestionCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (!error && data) {
        // Strict Visibility Policy: Only PUBLISHED questions are counted and shown to students
        const published = data.filter((q: any) => q.status === 'PUBLISHED' || q.status === 'Published');
        const mcqs = published.filter((q: any) => q.type === 'MCQ' || q.round_id === 'round-1');
        const debugs = published.filter((q: any) => q.type === 'Debugging' || q.round_id === 'round-2');
        const crashes = published.filter((q: any) => q.type === 'Crash & Fix' || q.round_id === 'round-3');

        setQuestionCounts({
          mcq: mcqs.length > 0 ? mcqs.length : 15,
          debug: debugs.length > 0 ? debugs.length : 2,
          crash: crashes.length > 0 ? crashes.length : 2
        });
      }
    } catch (err) {
      console.error('Error fetching published question counts:', err);
    }
  };

  React.useEffect(() => {
    fetchPublishedQuestionCounts();

    // Supabase Realtime WebSockets subscription for live question updates
    const channel = supabase
      .channel('realtime_student_rounds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        fetchPublishedQuestionCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const ROUNDS = [
    {
      id: 'round-1',
      number: 'ROUND 01',
      title: 'Speed MCQ Challenge',
      subtitle: 'Data Structures, PostgreSQL, System Design & HTTP/2',
      specs: [
        `${questionCounts.mcq} Published Single Choice Questions`,
        'Strict 15-Minute Countdown Timer',
        'Question Navigation Palette with Review Flags',
        '+10 Points / -2 Negative Marking',
        'Full Bidirectional Question Navigation'
      ],
      score: '30 PTS',
      time: '15 MINS',
      icon: Zap,
      accentColor: 'indigo',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20',
      href: '/arena/mcq'
    },
    {
      id: 'round-2',
      number: 'ROUND 02',
      title: 'Algorithmic Debugging Challenge',
      subtitle: 'Fix Logic Flaws, Memory Leaks & Edge Case Bugs',
      specs: [
        `Fix ${questionCounts.debug} Published Buggy Code Programs`,
        'Embedded Monaco Code Editor',
        'Copy, Paste & Right-Click Disabled',
        'Auto-Saving Draft Engine',
        'Live Test Matrix Evaluation'
      ],
      score: '40 PTS',
      time: '15 MINS',
      icon: Code2,
      accentColor: 'cyan',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20',
      href: '/arena/debugging'
    },
    {
      id: 'round-3',
      number: 'ROUND 03',
      title: 'Crash & Fix Engineering',
      subtitle: 'Medium-Level Buggy Programs & Runtime Exceptions',
      specs: [
        `Solve ${questionCounts.crash} Published Buggy Programs`,
        'Fix Recursion Stack Overflows & Async Crashes',
        'Embedded Monaco Code Editor',
        'High-Pressure Patch Validation',
        'Auto-Submit on Timer Expiration'
      ],
      score: '50 PTS',
      time: '15 MINS',
      icon: Terminal,
      accentColor: 'purple',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20',
      href: '/arena/crash-fix'
    }
  ];

  return (
    <section id="rounds" className="py-20 md:py-28 bg-[#081120] border-b border-slate-800/80 relative overflow-hidden">
      
      {/* Background Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-600/10 via-purple-600/10 to-transparent blur-[160px] pointer-events-none rounded-full" 
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono"
          >
            <Award className="h-4 w-4 text-indigo-400" />
            <span>3-STAGE COMPETITION ARENA</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            High-Intensity Technical Rounds
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 leading-relaxed font-sans"
          >
            Test your algorithmic agility across Speed MCQs, Code Debugging, and Medium-Level Crash & Fix Patching.
          </motion.p>
        </div>

        {/* THREE ROUND CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ROUNDS.map((round, idx) => {
            const Icon = round.icon;

            return (
              <motion.div
                key={round.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-8 rounded-3xl space-y-6 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 shadow-2xl backdrop-blur-md relative group"
              >
                <div className="space-y-5">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${round.badgeBg}`}>
                      {round.number}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>{round.time}</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{round.title}</h3>
                    <p className="text-xs text-slate-400 font-sans">{round.subtitle}</p>
                  </div>

                  {/* Specifications List */}
                  <ul className="space-y-2.5 pt-2 text-xs font-mono text-slate-300">
                    {round.specs.map((spec, specIdx) => (
                      <li key={specIdx} className="flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>

                </div>

                {/* Card Footer & CTA */}
                <div className="pt-6 border-t border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">ROUND WEIGHTAGE</span>
                    <span className="text-amber-400 font-bold text-sm">{round.score}</span>
                  </div>

                  <Link
                    href={round.href}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${round.buttonBg}`}
                  >
                    <span>Launch {round.number} Arena</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
