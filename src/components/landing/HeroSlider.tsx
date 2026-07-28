'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, UserPlus, Info, Sparkles, Building2 } from 'lucide-react';

export interface SlideData {
  id: string;
  imgSrc: string;
  tagline: string;
  yellowName: string;
  whiteName: string;
  eventTitle: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    imgSrc: '/images/campus_building.png',
    tagline: 'DEPT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING',
    yellowName: 'MUTHAYAMMAL',
    whiteName: 'ENGINEERING COLLEGE',
    eventTitle: 'NATIONAL TECHNICAL GRAND PRIX 2026',
    subtitle: 'Compete across 3 high-intensity technical rounds: Speed MCQ, Algorithmic Debugging & High-Pressure Crash Patching with $10,000+ in awards.',
  },
  {
    id: 'slide-2',
    imgSrc: '/images/campus_facade.png',
    tagline: 'AUTONOMOUS INSTITUTION • NAAC A GRADE & NBA ACCREDITED',
    yellowName: 'MUTHAYAMMAL',
    whiteName: 'ENGINEERING COLLEGE',
    eventTitle: 'INNOVATE. CODE. CONQUER.',
    subtitle: 'Real-time proctoring engine with live leaderboard telemetry, instant code execution & verified PDF certificates.',
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 5 seconds (5000ms) with infinite loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section 
      aria-label="Symposium Hero Slider"
      className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-slate-800/80 bg-[#081120]"
    >
      
      {/* SLIDE BACKDROP WITH BRIGHT VIVID CLARITY & KEN BURNS ZOOM */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.0 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 0.8, ease: 'easeInOut' },
            scale: { duration: 5.0, ease: 'linear' }
          }}
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          {/* Crisp, High-Resolution Campus Image Backdrop */}
          <Image
            src={currentSlide.imgSrc}
            alt="Muthayammal Engineering College Campus"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center filter brightness-115 contrast-110"
          />

          {/* Left-to-Right Gradient: Darker on Left for Legibility, Bright & Vivid on Middle/Right for Clear Campus View */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#081120] via-[#081120]/75 to-transparent md:to-[#081120]/20" />

          {/* Top & Bottom Soft Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#081120]/80 via-transparent to-[#081120]" />
        </motion.div>
      </AnimatePresence>

      {/* LEFT-SIDE MIDDLE CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-20 py-16">
        <div className="max-w-3xl text-left space-y-6">
          
          {/* OFFICIAL COLLEGE LOGO EMBLEM & BADGE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white p-1.5 shadow-xl border border-amber-400/50 flex items-center justify-center shrink-0">
              <Image
                src="/images/college_logo.png"
                alt="Muthayammal Crest Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-mono backdrop-blur-md shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{currentSlide.tagline}</span>
            </div>
          </motion.div>

          {/* COLLEGE NAME FROM LEFT SIDE MIDDLE WITH YELLOW AND WHITE */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id + '-name'}
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.6 }}
              className="space-y-1"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase font-sans leading-none drop-shadow-lg">
                <span className="text-amber-400 text-yellow-400 block pb-1">{currentSlide.yellowName}</span>
                <span className="text-white block">{currentSlide.whiteName}</span>
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* EVENT TITLE & SUBTITLE */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id + '-title'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-indigo-300 tracking-wider uppercase font-sans">
                {currentSlide.eventTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-sans text-shadow">
                {currentSlide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ACTION BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
          >
            <Link
              href="/register"
              aria-label="Enter Symposium 2026 Registration"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/50 hover:scale-[1.02] transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Enter Symposium</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/#about"
              aria-label="View Event Details"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-sm border border-slate-700/90 backdrop-blur-md transition-all shadow-lg"
            >
              <Info className="h-4 w-4 text-cyan-400" />
              <span>View Event Details</span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* GLASSMORPHISM NAVIGATION CONTROLS (LEFT / RIGHT) */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-slate-200 hover:text-white backdrop-blur-md transition-all shadow-xl hidden sm:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-slate-200 hover:text-white backdrop-blur-md transition-all shadow-xl hidden sm:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* BOTTOM NAVIGATION DOTS (GLASSMORPHISM BAR) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        {SLIDES.map((slide, idx) => {
          const isActive = currentIndex === idx;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                isActive ? 'w-9 bg-yellow-400 shadow-md' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          );
        })}
      </div>

    </section>
  );
}
