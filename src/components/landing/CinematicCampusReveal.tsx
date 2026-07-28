'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function CinematicCampusReveal({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Timeline sequence:
    // 5.4s -> begin slow fade out
    // 6.0s -> complete handoff to Hero Slider
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5400);

    const removeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 6000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="region"
          aria-label="Cinematic Campus Reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center select-none overflow-hidden touch-none pointer-events-auto bg-[#040914]"
        >
          
          {/* KEN BURNS ANIMATED OFFICIAL CAMPUS BUILDING BACKDROP */}
          <motion.div
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: 6.0, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full will-change-transform"
            style={{ transform: 'translateZ(0)' }}
          >
            {/* Official Uploaded Campus Building Image */}
            <Image
              src="/images/campus_building.png"
              alt="Muthayammal Engineering College Campus Architecture"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            {/* Dark Cinematic Overlay */}
            <div className="absolute inset-0 bg-slate-950/75 backdrop-brightness-75" />

            {/* Morning Sunlight Glow (Top-Right Warm Golden Light) */}
            <div 
              aria-hidden="true"
              className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none opacity-50 blur-[120px]"
              style={{
                background: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 70%)'
              }}
            />
          </motion.div>

          {/* CENTER TEXT CONTENT */}
          <div className="relative z-10 max-w-4xl mx-auto text-center px-6 space-y-5 flex flex-col items-center justify-center">
            
            {/* STEP 1 (0.5s): OFFICIAL COLLEGE LOGO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center bg-white/95 p-2.5 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.25)]"
            >
              <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] relative flex items-center justify-center">
                <Image
                  src="/images/college_logo.png"
                  alt="Muthayammal Engineering College Crest Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* STEP 2 (1.2s): MUTHAYAMMAL ENGINEERING COLLEGE */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-[0.18em] sm:tracking-[0.22em] uppercase font-sans leading-tight">
                Muthayammal Engineering College
              </h1>
              <p className="text-[10px] sm:text-xs font-mono text-slate-400 tracking-[0.3em] uppercase pt-0.5">
                An Autonomous Institution • Accredited by NAAC & NBA
              </p>
            </motion.div>

            {/* STEP 3 (2.0s): DESIGNING YOUR FUTURE */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3">
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-amber-400/60" />
                <span className="text-xs sm:text-sm md:text-base font-semibold text-amber-400 tracking-[0.25em] uppercase font-sans">
                  Designing Your Future
                </span>
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-amber-400/60" />
              </div>
            </motion.div>

            {/* STEP 4 (2.7s): DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.7, ease: [0.16, 1, 0.3, 1] }}
              className="pt-1"
            >
              <p className="text-xs sm:text-sm md:text-base font-medium text-cyan-300 tracking-[0.15em] uppercase font-sans">
                Department of Artificial Intelligence & Machine Learning
              </p>
            </motion.div>

            {/* STEP 5 (3.4s): PRESENTS */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 3.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase">
                Presents
              </span>
            </motion.div>

            {/* STEP 6 (4.0s): SYMPOSIUM NAME */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 4.0, ease: [0.16, 1, 0.3, 1] }}
              className="pt-1"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-indigo-400 tracking-wider uppercase font-sans drop-shadow-lg">
                SYMPOSIUM 2026: GRAND PRIX
              </h2>
            </motion.div>

          </div>

          {/* Bottom Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-slate-800 rounded-full overflow-hidden z-20"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5.4, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-500"
            />
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
