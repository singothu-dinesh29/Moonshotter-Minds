'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import IntroSplashScreen from '@/components/ui/IntroSplashScreen';
import CinematicCampusReveal from '@/components/landing/CinematicCampusReveal';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import AboutDepartmentSection from '@/components/landing/AboutDepartmentSection';
import AboutCollegeSection from '@/components/landing/AboutCollegeSection';
import { useAuth } from '@/components/auth/AuthProvider';

// Dynamically load below-the-fold landing components
const RoundsSection = dynamic(() => import('@/components/landing/RoundsSection'), { ssr: false });
const ScheduleTimeline = dynamic(() => import('@/components/landing/ScheduleTimeline'), { ssr: false });
const EventRules = dynamic(() => import('@/components/landing/EventRules'), { ssr: false });
const PrizesSection = dynamic(() => import('@/components/landing/PrizesSection'), { ssr: false });
const SponsorsSection = dynamic(() => import('@/components/landing/SponsorsSection'), { ssr: false });
const CoordinatorsSection = dynamic(() => import('@/components/landing/CoordinatorsSection'), { ssr: false });
const GallerySection = dynamic(() => import('@/components/landing/GallerySection'), { ssr: false });
const FaqSection = dynamic(() => import('@/components/landing/FaqSection'), { ssr: false });
const ContactSection = dynamic(() => import('@/components/landing/ContactSection'), { ssr: false });

export default function HomePage() {
  const { hasPlayedIntro, markIntroAsPlayed } = useAuth();
  const [splashState, setSplashState] = useState<'splash' | 'reveal' | 'hero'>('hero');
  const [shouldRenderBelowFold, setShouldRenderBelowFold] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Sync Global Intro Session State on Mount
  useEffect(() => {
    setIsMounted(true);
    if (hasPlayedIntro) {
      setSplashState('hero');
      setShouldRenderBelowFold(true);
    } else {
      setSplashState('splash');
      setShouldRenderBelowFold(false);
    }
  }, [hasPlayedIntro]);

  // Preload Hero Images into Browser Cache immediately on mount during Splash Screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const heroImages = [
        '/images/college_logo.png',
        '/images/campus_building.png',
        '/images/campus_facade.png'
      ];
      heroImages.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, []);

  // Preload below-the-fold modules while reveal sequence is active
  useEffect(() => {
    if (splashState === 'reveal') {
      const timer = setTimeout(() => {
        setShouldRenderBelowFold(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (splashState === 'hero') {
      setShouldRenderBelowFold(true);
    }
  }, [splashState]);

  const handleSplashComplete = () => {
    setSplashState('reveal');
  };

  const handleRevealComplete = () => {
    setSplashState('hero');
    setShouldRenderBelowFold(true);
    markIntroAsPlayed();
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* STEP 1: Intro Splash Screen Overlay (Only renders when intro hasn't played) */}
      {isMounted && splashState === 'splash' && (
        <IntroSplashScreen onComplete={handleSplashComplete} />
      )}

      {/* STEP 2: Cinematic Campus Reveal Section (Only renders during sequence) */}
      {isMounted && splashState === 'reveal' && (
        <CinematicCampusReveal onComplete={handleRevealComplete} />
      )}

      {/* STEP 3: Main Landing Homepage & Hero Slider (Preloaded & Pre-rendered in DOM) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.995 }}
        animate={{ 
          opacity: splashState === 'hero' ? 1 : 0,
          scale: splashState === 'hero' ? 1 : 0.995
        }}
        transition={{ 
          duration: 0.9, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        style={{ 
          pointerEvents: splashState === 'hero' ? 'auto' : 'none',
          transform: 'translateZ(0)'
        }}
        className="will-change-transform min-h-screen"
      >
        {/* Section 1: Hero */}
        <div id="home"><HeroSection /></div>

        {/* Section 2: About Symposium */}
        <div id="about"><AboutSection /></div>

        {/* Section 3: About Department */}
        <AboutDepartmentSection />

        {/* Section 4: About College */}
        <AboutCollegeSection />

        {(splashState === 'hero' || shouldRenderBelowFold) && (
          <>
            {/* Section 5: Rounds */}
            <div id="rounds"><RoundsSection /></div>

            {/* Section 6: Timeline */}
            <div id="schedule"><ScheduleTimeline /></div>

            {/* Section 7: Rules */}
            <div id="rules"><EventRules /></div>

            {/* Section 8: Prizes */}
            <div id="symposium"><PrizesSection /></div>

            {/* Section 9: Sponsors */}
            <SponsorsSection />

            {/* Section 10: Faculty & Student Coordinators */}
            <CoordinatorsSection />

            {/* Section 11: Gallery */}
            <div id="gallery"><GallerySection /></div>

            {/* Section 12: FAQs */}
            <div id="faq"><FaqSection /></div>

            {/* Section 13: Contact */}
            <div id="contact"><ContactSection /></div>
          </>
        )}
      </motion.div>

    </main>
  );
}
