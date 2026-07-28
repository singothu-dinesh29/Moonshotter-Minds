'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  LogIn, 
  Zap, 
  Code2, 
  Terminal, 
  Award, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

export default function ScheduleTimeline() {
  const STEPS = [
    {
      step: '01',
      title: 'Registration & Verification',
      time: '08:30 AM - 09:30 AM',
      description: 'Candidate registration, institution verification, and credentials issuance.',
      icon: UserPlus,
      accentColor: 'indigo',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      step: '02',
      title: 'Candidate Authentication & System Diagnostics',
      time: '09:30 AM - 10:00 AM',
      description: 'Login to examination portal, full-screen security check, and Monaco Editor calibration.',
      icon: LogIn,
      accentColor: 'cyan',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      step: '03',
      title: 'Round One: Speed MCQ Challenge',
      time: '10:00 AM - 10:30 AM',
      description: '15 randomized single choice questions testing Data Structures, PostgreSQL, System Design & HTTP/2.',
      icon: Zap,
      accentColor: 'amber',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      step: '04',
      title: 'Round Two: Algorithmic Debugging Arena',
      time: '10:45 AM - 11:30 AM',
      description: 'Fix logic flaws and memory leaks in 2 program scripts using embedded Monaco Editor.',
      icon: Code2,
      accentColor: 'cyan',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      step: '05',
      title: 'Round Three: Crash & Fix Engineering',
      time: '11:45 AM - 12:30 PM',
      description: 'Solve medium-level buggy programs suffering from stack overflows and unhandled promise rejections.',
      icon: Terminal,
      accentColor: 'purple',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      step: '06',
      title: 'Automated Evaluation & Score Calculation',
      time: '12:30 PM - 01:30 PM',
      description: 'Automated MCQ check combined with manual instructor code scoring and percentage calculation.',
      icon: Award,
      accentColor: 'emerald',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      step: '07',
      title: 'Winner Announcement & Certificate Issuance',
      time: '02:00 PM - 03:00 PM',
      description: 'Live Realtime Leaderboard crowning, trophy presentation, and SHA-256 PDF certificate distribution.',
      icon: Trophy,
      accentColor: 'amber',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    }
  ];

  return (
    <section id="schedule" className="py-20 md:py-28 bg-[#090d16] border-b border-slate-800/80 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-amber-500/10 via-indigo-600/10 to-transparent blur-[160px] pointer-events-none rounded-full" 
      />

      <div className="max-w-5xl mx-auto px-4 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
          >
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>INTERACTIVE EVENT TIMELINE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            Symposium Schedule & Day Flow
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 leading-relaxed font-sans"
          >
            Follow the 7-stage event day progression from morning registration to afternoon winner crowning.
          </motion.p>
        </div>

        {/* ANIMATED VERTICAL TIMELINE CONTAINER */}
        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-32 space-y-12 pl-6 md:pl-10">
          
          {/* Animated Glowing Vertical Line */}
          <div className="absolute top-0 bottom-0 left-[-2px] w-[2px] bg-gradient-to-b from-amber-400 via-indigo-500 to-emerald-400" />

          {STEPS.map((stepItem, idx) => {
            const Icon = stepItem.icon;

            return (
              <motion.div
                key={stepItem.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative group"
              >
                {/* TIMELINE NODE ICON */}
                <div className="absolute -left-[31px] md:-left-[47px] top-1.5 h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-950 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 shadow-xl group-hover:scale-110 group-hover:border-amber-400 transition-all">
                  <Icon className="h-5 w-5" />
                </div>

                {/* TIMELINE STEP CARD */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-6 md:p-8 rounded-2xl space-y-3 shadow-xl hover:scale-[1.01] transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${stepItem.badgeBg}`}>
                        STEP {stepItem.step}
                      </span>
                      <h3 className="font-bold text-base md:text-lg text-white">{stepItem.title}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{stepItem.time}</span>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                    {stepItem.description}
                  </p>
                </div>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
