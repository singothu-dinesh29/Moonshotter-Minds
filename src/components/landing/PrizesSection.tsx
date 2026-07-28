'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, Gift } from 'lucide-react';

export default function PrizesSection() {
  return (
    <section id="prizes" className="py-20 max-w-7xl mx-auto px-4 lg:px-8 border-b border-slate-800/80">
      <div className="text-center mb-16 space-y-3">
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          PRIZE POOL & REWARDS
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">$10,000 Total Prize Pool</h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Recognizing the top collegiate developers with cash rewards, physical trophies, and verified certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 2nd Place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 md:mt-6"
        >
          <div className="h-16 w-16 rounded-full bg-slate-400/10 border border-slate-400/30 flex items-center justify-center text-slate-300 mx-auto">
            <Medal className="h-8 w-8" />
          </div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">RUNNER-UP</span>
          <h3 className="text-3xl font-black text-white font-mono">$3,000</h3>
          <p className="text-xs text-slate-400">Cash Award + Silver Trophy + Verified Certificate</p>
        </motion.div>

        {/* 1st Place Champion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel-glow p-8 rounded-2xl border border-amber-500/40 text-center space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold font-mono uppercase tracking-wider rounded-bl-lg">
            GRAND CHAMPION
          </div>
          <div className="h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
            <Trophy className="h-10 w-10 animate-bounce" />
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest block">FIRST PLACE</span>
          <h3 className="text-4xl font-black text-amber-400 font-mono">$5,000</h3>
          <p className="text-xs text-slate-300">Grand Cash Award + Gold Trophy + Direct Tech Interview Voucher</p>
        </motion.div>

        {/* 3rd Place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 md:mt-6"
        >
          <div className="h-16 w-16 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-amber-600 mx-auto">
            <Medal className="h-8 w-8" />
          </div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">SECOND RUNNER-UP</span>
          <h3 className="text-3xl font-black text-white font-mono">$2,000</h3>
          <p className="text-xs text-slate-400">Cash Award + Bronze Trophy + Verified Certificate</p>
        </motion.div>

      </div>
    </section>
  );
}
