'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Brain, Sparkles, Network, Database } from 'lucide-react';

export default function AboutDepartmentSection() {
  return (
    <section id="symposium" className="py-20 md:py-28 bg-[#081120] border-b border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono"
          >
            <Brain className="h-4 w-4 text-cyan-400" />
            <span>DEPARTMENT OF AI & MACHINE LEARNING</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            Pioneering Artificial Intelligence <br />
            <span className="gradient-text">& Next-Gen Computing</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 leading-relaxed font-sans"
          >
            The Department of Artificial Intelligence & Machine Learning at Muthayammal Engineering College empowers students to build intelligent systems, deep neural networks, and scalable algorithms through hands-on hackathons and rigorous technical symposiums.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Deep Learning & Neural Networks</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curriculum focused on modern AI architectures including Convolutional Networks, Transformers, LLMs, and Reinforcement Learning.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-white">High-Performance Computing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              State-of-the-art GPU clusters enabling real-time model training, big data analytics, and high-speed algorithm execution.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition-all hover:scale-[1.02] shadow-xl"
          >
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Industry Collaboration</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Direct partnerships with top tech research labs, providing students with industrial internships and competitive problem statements.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
