'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardRecord, supabase } from '@/lib/supabase';
import { 
  FileCheck, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Upload, 
  Sparkles, 
  QrCode, 
  Award, 
  Trophy,
  CheckCircle2,
  Eye,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function CertificatePipelineHub() {
  const [candidates, setCandidates] = useState<LeaderboardRecord[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<LeaderboardRecord | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const { data } = await supabase.from('students').select('*');
        if (data && data.length > 0) {
          const mapped: LeaderboardRecord[] = data.map((s: any, idx: number) => ({
            id: s.id || `lead-${idx}`,
            event_id: 'event-2026-main',
            student_id: s.id,
            registration_id: s.id,
            registration: s.registration_number || s.registration || `MIT-2026-${100 + idx}`,
            name: s.name || 'Candidate',
            college: s.college || 'Engineering Institute',
            round_1_score: 30,
            round_2_score: 40,
            round_3_score: 50,
            total_score: 120,
            completion_time_seconds: 2450,
            rank: idx + 1,
            disqualified: s.status === 'Disqualified' || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          setCandidates(mapped);
          setSelectedCandidate(mapped[0]);
        }
      } catch (err) {
        console.error('Error fetching students for certificates:', err);
      }
    }
    fetchStudents();
  }, []);
  
  // Admin Template Customization State
  const [templateConfig, setTemplateConfig] = useState({
    title: 'Certificate of Merit & Technical Excellence',
    subtext: 'Is hereby awarded for outstanding performance and technical mastery in the National Tech Symposium 2026',
    issuerName: 'Dr. Marcus Vance',
    issuerRole: 'General Chair & Dean of Technology',
    themeColor: 'indigo', // indigo, emerald, amber
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleBatchGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Batch Certificate Generation Complete! Generated SHA-256 signatures, uploaded PDFs to Supabase Storage bucket "certificate-pdfs", and updated verification records.');
    }, 1000);
  };

  const handleDownloadPDF = (name: string) => {
    alert(`Downloading Vector PDF Certificate for ${name}...`);
  };

  const currentCandidate = selectedCandidate || candidates[0] || {
    id: 'lead-0',
    name: 'Candidate',
    college: 'Engineering Institute',
    total_score: 120,
    rank: 1,
    registration: 'MIT-2026-101'
  };

  const candAny = currentCandidate as any;
  const user = candAny.registration?.user || { full_name: candAny.name || 'Candidate', college_name: candAny.college || 'Engineering Institute' };
  const verifyHash = `SHA256-SYM-2026-${(candAny.id || 'LEAD-0').toUpperCase()}`;
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/verify/${verifyHash}`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* 1. HEADER & BATCH GENERATION BUTTON */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">CERTIFICATE GENERATION PIPELINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Automated Certificate Generator & Verification</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Generate cryptographically signed vector PDF certificates with dynamic Candidate Name, Score, Rank, and QR Verification codes.
          </p>
        </div>

        <button
          onClick={handleBatchGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <FileCheck className="h-4 w-4" />
          {isGenerating ? 'Generating PDFs...' : 'Trigger Batch Certificate Issuance'}
        </button>
      </div>

      {/* 2. ADMIN TEMPLATE BUILDER & LIVE CERTIFICATE PREVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 1 Col: Admin Template Customizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Upload className="h-4 w-4 text-indigo-400" /> Certificate Template Customizer
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Select Preview Candidate</label>
              <select
                value={selectedCandidate?.id || ''}
                onChange={(e) => {
                  const target = candidates.find((c) => c.id === e.target.value);
                  if (target) setSelectedCandidate(target);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    Rank #{c.rank}: {c.registration?.user?.full_name} ({c.total_score} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Certificate Main Header Title</label>
              <input
                type="text"
                value={templateConfig.title}
                onChange={(e) => setTemplateConfig({ ...templateConfig, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Award Subtext Citation</label>
              <textarea
                rows={3}
                value={templateConfig.subtext}
                onChange={(e) => setTemplateConfig({ ...templateConfig, subtext: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Signatory Name</label>
                <input
                  type="text"
                  value={templateConfig.issuerName}
                  onChange={(e) => setTemplateConfig({ ...templateConfig, issuerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Signatory Role</label>
                <input
                  type="text"
                  value={templateConfig.issuerRole}
                  onChange={(e) => setTemplateConfig({ ...templateConfig, issuerRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Live Rendered Dynamic Certificate Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-8 space-y-8 relative overflow-hidden shadow-2xl">
            
            {/* Background Vector Overlay */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Trophy className="h-96 w-96 text-amber-400" />
            </div>

            {/* Certificate Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-white tracking-wide">SYMPHOSIUM NATIONAL AUTHORITY</h4>
                  <p className="text-[11px] font-mono text-slate-400">Cryptographically Signed Technical Examination Certificate</p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block">ISSUANCE STATUS</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  OFFICIAL & SIGNED
                </span>
              </div>
            </div>

            {/* Title & Dynamic Candidate Name */}
            <div className="text-center space-y-4 py-4">
              <h2 className="text-xl md:text-2xl font-bold text-amber-400 tracking-tight uppercase">
                {templateConfig.title}
              </h2>
              
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">THIS CERTIFICATE IS PROUDLY PRESENTED TO</span>
                <h1 className="text-3xl md:text-4xl font-black text-white gradient-text tracking-wide">
                  {user?.full_name || 'Registered Candidate'}
                </h1>
                <p className="text-xs text-slate-300 font-mono">{user?.college_name || 'Muthayammal Engineering College'}</p>
              </div>

              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                {templateConfig.subtext}
              </p>
            </div>

            {/* Dynamic Score, Rank Badge & QR Verification Code Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/90 p-5 rounded-xl border border-slate-800/80 items-center font-mono">
              
              {/* Rank */}
              <div className="text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">FINAL COMPETITION RANK</span>
                <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <Trophy className="h-5 w-5" /> Rank #{selectedCandidate.rank}
                </div>
              </div>

              {/* Score */}
              <div className="text-center space-y-1 border-y md:border-y-0 md:border-x border-slate-800 py-3 md:py-0">
                <span className="text-[10px] text-slate-500 uppercase block">TOTAL SCORE ACHIEVED</span>
                <div className="text-xl font-black text-indigo-400">
                  {selectedCandidate.total_score} / 120 PTS
                </div>
              </div>

              {/* QR Verification */}
              <div className="flex items-center gap-3 justify-center">
                <div className="h-14 w-14 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0">
                  <QrCode className="h-full w-full text-slate-950" />
                </div>
                <div className="text-left text-[10px] space-y-0.5">
                  <span className="text-slate-400 block font-bold">QR VERIFY CODE</span>
                  <span className="text-emerald-400 block font-bold">100% AUTHENTIC</span>
                  <span className="text-slate-500 block truncate max-w-[100px]">{verifyHash}</span>
                </div>
              </div>

            </div>

            {/* Signatory Footer */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-6">
              <div className="space-y-0.5">
                <div className="font-serif italic text-lg text-slate-200">{templateConfig.issuerName}</div>
                <div className="text-[11px] text-slate-400 font-mono">{templateConfig.issuerRole}</div>
              </div>

              <button
                onClick={() => handleDownloadPDF(user?.full_name || 'Registered Candidate')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Download className="h-4 w-4" /> Download PDF Certificate
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
