'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { Lock, User, ArrowRight, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

function LoginContent() {
  const { signIn, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('Registration completed successfully! Please sign in with your credentials.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(username.trim(), password.trim());
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 relative overflow-hidden bg-[#081120]">
      
      {/* ANIMATED BACKGROUND GRADIENT GLOW ORBS */}
      <div 
        aria-hidden="true"
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-indigo-600/15 to-purple-600/15 blur-[140px] pointer-events-none rounded-full will-change-transform animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div 
        aria-hidden="true"
        className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/15 to-transparent blur-[140px] pointer-events-none rounded-full"
      />

      {/* GLASSMORPHISM SINGLE UNIFIED LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md relative z-10"
      >
        
        {/* COLLEGE LOGO & BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl border border-amber-400/50 flex items-center justify-center mx-auto">
            <Image
              src="/images/college_logo.png"
              alt="Muthayammal Crest Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Symphosium Auth Portal</h2>
            <p className="text-xs text-slate-400 font-mono">Muthayammal Engineering College • AI & ML Dept</p>
          </div>
        </div>

        {/* REGISTRATION SUCCESS BANNER */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* ERROR ALERT BANNER */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-mono flex items-center gap-2"
          >
            <span className="shrink-0">⚠️</span>
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* UNIFIED SINGLE LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Username / Email</label>
            <div className="relative">
              <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your registered email or username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-amber-400 hover:underline font-mono">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full py-3.5 rounded-xl font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-500/25 hover:scale-[1.01] disabled:opacity-50"
          >
            {isLoading || isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Registration Link */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 font-sans">
          Don't have an account?{' '}
          <Link href="/register" className="text-amber-400 hover:underline font-bold">
            Register for Symposium 2026
          </Link>
        </div>

      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#081120]" />}>
      <LoginContent />
    </Suspense>
  );
}
