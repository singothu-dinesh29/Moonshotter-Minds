'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, Zap, Cpu, Code2, Globe } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 max-w-7xl mx-auto px-4 lg:px-8 border-b border-slate-800/80">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: About Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
            ABOUT THE SYMPOSIUM PLATFORM
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Engineered for High-Stakes Technical Competition
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The Symphosium Examination Platform is an enterprise national tech event framework designed to evaluate computer science candidates across multiple dimensions of engineering competence.
          </p>
          
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Multi-Round Adaptive Evaluation</h4>
                <p className="text-xs text-slate-400">Combines speed logic tests with interactive code editor debugging and emergency crash patching.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Zero-Latency Supabase Realtime</h4>
                <p className="text-xs text-slate-400">Live scoreboards, candidate proctoring alerts, and organizer broadcast channels update in milliseconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Cryptographic Certificate Verification</h4>
                <p className="text-xs text-slate-400">Winners receive SHA-256 signed vector PDF certificates hosted on public verification endpoints.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Spec Graphic Panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel-glow p-8 rounded-2xl border border-slate-800 space-y-6 relative"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-slate-400">ARCHITECTURE STACK SPECIFICATION</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">FRONTEND FRAMEWORK</span>
              <div className="text-indigo-400 font-bold">Next.js 16 App Router</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">DATABASE ENGINE</span>
              <div className="text-cyan-400 font-bold">Supabase PostgreSQL</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">EXECUTION RUNNER</span>
              <div className="text-purple-400 font-bold">Isolated Docker Container</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">TELEMETRY ENGINE</span>
              <div className="text-emerald-400 font-bold">Realtime WebSockets</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
