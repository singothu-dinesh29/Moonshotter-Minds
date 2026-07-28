'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Landmark, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  Target, 
  Compass, 
  Users, 
  Briefcase, 
  Layers, 
  Building2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function AboutCollegeSection() {
  const STATS = [
    { label: 'Established', value: '2000', subtext: '25+ Yrs Legacy' },
    { label: 'NAAC Grade', value: "'A' Grade", subtext: 'Highest Accreditation' },
    { label: 'NBA Accredited', value: 'Tier 1', subtext: 'Engineering Programs' },
    { label: 'Enrolled Students', value: '10,000+', subtext: 'Active Scholars' },
    { label: 'Placements Rate', value: '95%+', subtext: 'Top Tier Companies' },
    { label: 'Departments', value: '12+', subtext: 'Engineering Disciplines' },
  ];

  return (
    <section id="about-college" className="py-20 md:py-28 bg-[#090d16] border-b border-slate-800/80 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-amber-500/10 via-indigo-600/10 to-transparent blur-[160px] pointer-events-none rounded-full" 
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-16">
        
        {/* 1. SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
          >
            <Landmark className="h-4 w-4 text-amber-400" />
            <span>MUTHAYAMMAL ENGINEERING COLLEGE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            A Quarter-Century of Academic & <br />
            <span className="gradient-text">Technological Leadership</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 leading-relaxed font-sans"
          >
            Muthayammal Engineering College (Autonomous) stands as a premier seat of technical education, nurturing global software engineers, AI researchers, and technology leaders.
          </motion.p>
        </div>

        {/* 2. ANIMATED STATISTIC CARDS (6 CARDS GRID) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl text-center space-y-1 hover:border-slate-700 transition-all hover:scale-[1.03] shadow-xl"
            >
              <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-white font-sans">{stat.label}</div>
              <div className="text-[10px] text-slate-400 font-mono">{stat.subtext}</div>
            </motion.div>
          ))}
        </div>

        {/* 3. VISION & MISSION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition-all hover:scale-[1.01] shadow-xl"
          >
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-white">Our Institutional Vision</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              To become a center of global excellence in engineering education and research, imparting world-class technical knowledge, ethical values, and innovative problem-solving skills to empower students for sustainable societal advancement.
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition-all hover:scale-[1.01] shadow-xl"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-white">Our Core Mission</h3>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Provide state-of-the-art infrastructure, advanced AI computing labs, and industry-aligned curricula.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Foster interdisciplinary research, patent filings, and competitive hackathon participation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Cultivate leadership, entrepreneurial mindset, and ethical engineering practices among all graduates.</span>
              </li>
            </ul>
          </motion.div>

        </div>

        {/* 4. HISTORY & CAMPUS HIGHLIGHTS */}
        <div className="bg-slate-900/90 border border-slate-800 p-8 md:p-10 rounded-2xl space-y-6 shadow-xl">
          <h3 className="font-bold text-xl text-white border-b border-slate-800 pb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-400" /> College History & Campus Infrastructure Highlights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans text-slate-300">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-amber-400 font-mono text-sm block">Founding History & Growth</strong>
              <p className="leading-relaxed text-slate-400">
                Founded in 2000, Muthayammal Engineering College has expanded from a founding batch into an autonomous institution hosting over 10,000+ students across 12 specialized engineering departments.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-cyan-400 font-mono text-sm block">Advanced AI & R&D Computing Labs</strong>
              <p className="leading-relaxed text-slate-400">
                Equipped with high-performance GPU supercomputing clusters, specialized Artificial Intelligence research centers, and 1 Gbps high-speed fiber-optic cloud infrastructure.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-emerald-400 font-mono text-sm block">Placements & Career Success</strong>
              <p className="leading-relaxed text-slate-400">
                Consistently achieving a 95%+ campus placement record with top global tech product corporations, research institutions, and software MNCs recruiting annually.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
