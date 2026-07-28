'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel-glow p-8 rounded-2xl border border-slate-800 space-y-6 text-center">
        
        <div className="h-16 w-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <Mail className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            EMAIL VERIFICATION REQUIRED
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verify Your Email Address</h1>
          <p className="text-xs text-slate-400">
            A confirmation link was dispatched via Supabase Auth. Click the link in your email to verify your candidate account and unlock exam arena access.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/25"
          >
            Proceed to Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
