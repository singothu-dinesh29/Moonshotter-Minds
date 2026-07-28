'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Users, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function CoordinatorsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#081120] border-b border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono"
          >
            <Users className="h-4 w-4 text-indigo-400" />
            <span>ORGANIZING COMMITTEE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            Faculty & Student Coordinators
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 font-sans"
          >
            Meet the leadership team organizing the National Technical Grand Prix 2026.
          </motion.p>
        </div>

        {/* Coordinators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Faculty Coordinators Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-6 shadow-xl"
          >
            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-400" /> Faculty Coordinators
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="font-sans font-bold text-white text-sm">Dr. S. Rajendran, Ph.D.</div>
                <div className="text-indigo-400 text-xs">Head of Department, AI & ML</div>
                <div className="text-slate-400 text-[11px] pt-1 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" /> hod.aiml@mec.edu.in
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="font-sans font-bold text-white text-sm">Prof. K. Anand, M.E.</div>
                <div className="text-indigo-400 text-xs">Associate Professor & Convener</div>
                <div className="text-slate-400 text-[11px] pt-1 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" /> +91 98765 43210
                </div>
              </div>
            </div>
          </motion.div>

          {/* Student Coordinators Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-6 shadow-xl"
          >
            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" /> Student Lead Coordinators
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="font-sans font-bold text-white text-sm">Alex Chen</div>
                <div className="text-cyan-400 text-xs">President, AI & ML Student Association</div>
                <div className="text-slate-400 text-[11px] pt-1 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" /> +91 91234 56789
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="font-sans font-bold text-white text-sm">Sriya Verma</div>
                <div className="text-cyan-400 text-xs">Technical Event Secretary</div>
                <div className="text-slate-400 text-[11px] pt-1 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" /> sriya.v@mec.edu.in
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
