'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function IntroSplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 3.5s -> begin slow fade out
    // 4.0s -> complete transition & remove overlay
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    const removeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="dialog"
          aria-label="Muthayammal Engineering College Welcome Screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden touch-none pointer-events-auto"
          style={{
            backgroundColor: '#081120',
            backgroundImage: 'radial-gradient(circle at center, rgba(16, 32, 60, 0.65) 0%, rgba(8, 17, 32, 1) 75%)',
          }}
        >
          <div className="flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto space-y-6">
            
            {/* 0.5s: OFFICIAL COLLEGE LOGO FADES IN WITH SCALE ANIMATION */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center bg-white/90 p-3 rounded-2xl shadow-[0_10px_35px_rgba(255,255,255,0.15)]"
            >
              <div className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] lg:w-[150px] lg:h-[150px] relative flex items-center justify-center">
                <Image
                  src="/images/college_logo.png"
                  alt="Muthayammal Engineering College Crest Logo"
                  fill
                  sizes="(max-width: 768px) 90px, (max-width: 1024px) 120px, 150px"
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* 1.3s: MUTHAYAMMAL ENGINEERING COLLEGE */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-[0.18em] sm:tracking-[0.22em] uppercase font-sans leading-tight">
                Muthayammal Engineering College
              </h1>
              <p className="text-[10px] sm:text-xs font-mono text-slate-400 tracking-[0.3em] uppercase pt-1">
                An Autonomous Institution • Accredited by NAAC & NBA
              </p>
            </motion.div>

            {/* 2.2s: "DESIGNING YOUR FUTURE" */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3">
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-amber-400/60" />
                <span className="text-xs sm:text-sm md:text-base font-semibold text-amber-400 tracking-[0.25em] uppercase font-sans">
                  Designing Your Future
                </span>
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-amber-400/60" />
              </div>
            </motion.div>

          </div>

          {/* Minimalist Bottom Progress Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-36 h-[2px] bg-slate-800 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.5, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-amber-400 to-indigo-500"
            />
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
