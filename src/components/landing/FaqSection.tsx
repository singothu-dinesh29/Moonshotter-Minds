'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const faqs = [
    {
      q: "Who is eligible to participate in the Symposium Examination?",
      a: "Any active undergraduate or postgraduate student enrolled in an accredited college or university is eligible. Registration requires a valid institution email."
    },
    {
      q: "How does the Anti-Cheat Surveillance Engine operate?",
      a: "The client browser sensor suite monitors focus loss, tab switching, clipboard events, and fullscreen state. Exceeding 3 tab switches triggers automated disqualification."
    },
    {
      q: "What programming languages are supported in Debugging and Crash & Fix rounds?",
      a: "The online Monaco Editor currently supports JavaScript (Node.js) and Python 3. additional language support (C++, Java) is provided depending on round configuration."
    },
    {
      q: "How are tie-breakers calculated on the master leaderboard?",
      a: "Tie-breakers prioritize Total Points first, followed by Completion Speed (lowest duration in seconds), lowest anti-cheat flags, and earliest submission timestamp."
    },
    {
      q: "How are PDF certificates verified?",
      a: "Every certificate contains a unique SHA-256 cryptographic hash embedded with a QR code, verifiable on our public /verify/[hash] portal endpoint."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 max-w-4xl mx-auto px-4 lg:px-8 border-b border-slate-800/80">
      <div className="text-center mb-16 space-y-3">
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          FREQUENTLY ASKED QUESTIONS
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Got Questions? We Have Answers.</h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-indigo-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
