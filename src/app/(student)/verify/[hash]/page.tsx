'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Award, ShieldCheck, CheckCircle2, QrCode, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { getDynamicScorecard, DynamicScorecard } from '@/lib/scoringEngine';

export default function CertificateVerificationPage() {
  const params = useParams();
  const verifyHash = params.hash as string;
  const [scorecard, setScorecard] = React.useState<DynamicScorecard | null>(null);

  React.useEffect(() => {
    setScorecard(getDynamicScorecard());
  }, []);

  const totalScore = scorecard ? scorecard.totalScore : 0;
  const totalMax = scorecard ? scorecard.totalMaxPoints : 120;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full glass-panel-glow p-8 rounded-2xl border border-slate-800 space-y-6">
        
        {/* Verification Status Banner */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cryptographically Verified Certificate</h2>
              <p className="text-xs text-slate-400">Issued by Symphosium National Examination Authority</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            VALID 100%
          </span>
        </div>

        {/* Certificate Card Mockup */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Award className="h-32 w-32 text-indigo-400" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase">VERIFICATION HASH</span>
            <div className="font-mono text-xs text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
              {verifyHash || 'SHA256-SYM-948271048-VERIFIED'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs text-slate-300 pt-2">
            <div>
              <span className="text-slate-500 block text-[10px]">CANDIDATE NAME</span>
              <strong className="text-white">Alex Chen</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">INSTITUTION</span>
              <strong className="text-white">MIT Institute of Tech</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EVENT</span>
              <strong className="text-white">Symposium Grand Prix 2026</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">RANK ACHIEVED</span>
              <strong className="text-amber-400">Rank #1 (Score: {totalScore}/{totalMax})</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/"
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
          >
            ← Back to Symposium Platform
          </Link>

          <button
            onClick={() => alert("Certificate PDF Download triggered!")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF Certificate
          </button>
        </div>

      </div>
    </div>
  );
}
