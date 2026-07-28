'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, Cpu, Terminal, Database, Globe } from 'lucide-react';

export default function SponsorsSection() {
  const sponsors = [
    { name: "Supabase Platform", category: "Title Infrastructure Partner", icon: Database },
    { name: "Next.js Vercel Engine", category: "Edge Frontend Partner", icon: Globe },
    { name: "Monaco Code Editor", category: "IDE Technology Partner", icon: Terminal },
    { name: "Docker Container Systems", category: "Execution Sandbox Partner", icon: Cpu }
  ];

  return (
    <section id="sponsors" className="py-20 max-w-7xl mx-auto px-4 lg:px-8 border-b border-slate-800/80">
      <div className="text-center mb-16 space-y-3">
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          SYMPOSIUM SPONSORS & PARTNERS
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Powered by Industry Leaders</h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Backed by leading cloud infrastructure, developer tools, and database providers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sponsors.map((sp, idx) => {
          const IconComp = sp.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-xl border border-slate-800 flex items-center gap-4 hover:border-cyan-500/40 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                <IconComp className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{sp.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{sp.category}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
