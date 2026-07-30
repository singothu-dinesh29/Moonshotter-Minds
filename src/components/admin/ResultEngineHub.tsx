'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  FileSpreadsheet, 
  FileCheck, 
  Eye, 
  CheckCircle2, 
  Search, 
  Download, 
  Percent, 
  Trophy,
  Sliders,
  Check,
  Globe,
  EyeOff,
  Sparkles,
  FileText,
  X,
  Zap,
  Code2,
  Terminal,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { getDynamicScorecard } from '@/lib/scoringEngine';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface FullCandidateResult {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  finalScore: number;
  rank: number;
  status: 'Qualified' | 'Completed' | 'Disqualified' | 'In Progress' | 'Waiting';
  isPublished: boolean;
}

export default function ResultEngineHub() {
  const [results, setResults] = useState<FullCandidateResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isPublishedGlobally, setIsPublishedGlobally] = useState<boolean>(true);
  const [viewResult, setViewResult] = useState<FullCandidateResult | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Real-Time Supabase Results Fetcher
  const fetchResultsFromSupabase = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { data: dbUsers, error: dbErr } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'STUDENT')
        .order('created_at', { ascending: false });

      const { data: dbRegs } = await supabase.from('registrations').select('*');
      const { data: dbLeaderboard } = await supabase.from('leaderboard').select('*');

      const activeScorecard = getDynamicScorecard();

      if (dbErr) throw dbErr;

      if (dbUsers) {
        const mapped: FullCandidateResult[] = dbUsers.map((u: any, idx: number) => {
          const reg = dbRegs?.find((r: any) => r.user_id === u.id || r.user_id === u.email || r.id === u.id);
          const lb = dbLeaderboard?.find((l: any) => l.student_id === u.id || l.student_id === u.email || l.registration_id === reg?.id);

          const isCurrentCandidate = u.id === 'candidate-2026-cs-942' || u.email === 'alex.chen@mit.edu' || idx === 0;

          const r1 = lb?.round_1_score ?? (isCurrentCandidate ? activeScorecard.mcqScore : 0);
          const r2 = lb?.round_2_score ?? (isCurrentCandidate ? activeScorecard.debuggingScore : 0);
          const r3 = lb?.round_3_score ?? (isCurrentCandidate ? activeScorecard.crashFixScore : 0);
          const totalSum = lb?.total_score ?? (r1 + r2 + r3);
          const flags = lb?.anti_cheat_flag_count ?? reg?.anti_cheat_flag_count ?? (isCurrentCandidate ? activeScorecard.antiCheatFlags : 0);

          const rawStatus = reg?.status || (totalSum > 0 ? 'SUBMITTED' : 'REGISTERED');

          let status: 'Qualified' | 'Completed' | 'Disqualified' | 'In Progress' | 'Waiting' = 'Waiting';
          if (rawStatus === 'DISQUALIFIED' || flags >= 3) {
            status = 'Disqualified';
          } else if (totalSum >= 70 || rawStatus === 'QUALIFIED') {
            status = 'Qualified';
          } else if (rawStatus === 'SUBMITTED' || totalSum > 0) {
            status = 'Completed';
          } else if (rawStatus === 'IN_PROGRESS') {
            status = 'In Progress';
          } else {
            status = 'Waiting';
          }

          return {
            id: u.id,
            name: u.full_name || 'Candidate',
            email: u.email,
            college: u.college_name || 'Muthayammal Engineering College',
            department: u.department || 'Artificial Intelligence & Machine Learning',
            round1Score: r1,
            round2Score: r2,
            round3Score: r3,
            finalScore: totalSum,
            rank: idx + 1,
            status: status,
            isPublished: isPublishedGlobally,
          };
        });

        // Sort by final score DESC and assign ranks
        mapped.sort((a, b) => b.finalScore - a.finalScore);
        const ranked = mapped.map((item, index) => ({ ...item, rank: index + 1 }));

        setResults(ranked);
      }
    } catch (err: any) {
      console.error('Error loading Supabase results:', err);
      setErrorMsg(err.message || 'Failed to load results from Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsFromSupabase();

    // Supabase Real-Time Channel Subscription
    const channel = supabase
      .channel('realtime_admin_results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchResultsFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchResultsFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => {
        fetchResultsFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 1. CALCULATE SCORES & GENERATE RANKINGS
  const handleCalculateScoresAndRankings = () => {
    const updated = results.map((r) => {
      const sum = r.round1Score + r.round2Score + r.round3Score;
      return {
        ...r,
        finalScore: sum,
        status: (r.status === 'Disqualified' ? 'Disqualified' : sum >= 100 ? 'Qualified' : 'Completed') as any
      };
    });

    // Sort by Final Score DESC
    updated.sort((a, b) => b.finalScore - a.finalScore);

    // Re-assign ranks
    const ranked = updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setResults(ranked);
    alert('Recalculated scores and generated official candidate rankings!');
  };

  // 2. PUBLISH / HIDE RESULTS TOGGLE
  const handleToggleGlobalPublish = () => {
    const nextState = !isPublishedGlobally;
    setIsPublishedGlobally(nextState);
    setResults((prev) => prev.map((r) => ({ ...r, isPublished: nextState })));
    alert(nextState ? 'Results have been PUBLISHED to the student portal and leaderboard!' : 'Results have been HIDDEN from the student portal.');
  };

  // 3. GENERATE CERTIFICATES
  const handleGenerateCertificates = () => {
    alert('Generating SHA-256 PDF Certificates for all qualified candidates...');
    window.open('/admin/certificates', '_blank');
  };

  // 4. EXPORT RESULTS (CSV)
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Rank,Student Name,Email,College,Department,Round 1 Score,Round 2 Score,Round 3 Score,Final Score,Status,Published\n";
    
    results.forEach((r) => {
      csvContent += `${r.rank},"${r.name}",${r.email},"${r.college}","${r.department}",${r.round1Score},${r.round2Score},${r.round3Score},${r.finalScore},${r.status},${r.isPublished}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `symphosium_official_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. EXPORT RESULTS (PDF / Print Summary)
  const handleExportPDF = () => {
    window.print();
  };

  // Filter Logic
  const filteredResults = results.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* 1. HEADER & ACTION CONTROLS BAR */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-2">
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>RESULT CALCULATION & PUBLISHING ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Result Management Hub</h1>
          <p className="text-xs text-slate-400 font-sans">Calculate scores, generate rankings, publish/hide results, issue certificates, and export official scorecards.</p>
        </div>

        {/* ADMIN ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCalculateScoresAndRankings}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Award className="h-4 w-4" /> Calculate Scores & Rankings
          </button>

          <button
            onClick={handleToggleGlobalPublish}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 ${
              isPublishedGlobally
                ? 'bg-amber-500 hover:bg-yellow-400 text-slate-950 shadow-amber-500/25'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
            }`}
          >
            {isPublishedGlobally ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide Results
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" /> Publish Results
              </>
            )}
          </button>

          <button
            onClick={handleGenerateCertificates}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Generate Certificates
          </button>

          <Link
            href="/admin/leaderboard"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-1.5"
          >
            <Trophy className="h-4 w-4" /> Live Leaderboard
          </Link>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4 text-cyan-400" /> PDF
          </button>
        </div>
      </div>

      {/* 2. SEARCH & STATUS FILTERS */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search student, college, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL EXAM STATUSES</option>
            <option value="Qualified">QUALIFIED ONLY</option>
            <option value="Completed">COMPLETED ONLY</option>
            <option value="In Progress">IN PROGRESS ONLY</option>
            <option value="Waiting">WAITING TO START</option>
            <option value="Disqualified">DISQUALIFIED ONLY</option>
          </select>

        </div>
      </div>

      {/* 3. CANDIDATE RESULT SCORECARD MATRIX TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="px-5 py-4">Rank</th>
                <th className="px-5 py-4">Student & Institution</th>
                <th className="px-5 py-4 text-center">Round 1 (MCQ)</th>
                <th className="px-5 py-4 text-center">Round 2 (Debug)</th>
                <th className="px-5 py-4 text-center">Round 3 (Crash-Fix)</th>
                <th className="px-5 py-4 text-center">Final Score</th>
                <th className="px-5 py-4 text-center">Qualification Status</th>
                <th className="px-5 py-4 text-right print:hidden">Action Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-sans">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                      <span>Fetching live candidate results from Supabase database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-sans">
                    No student records available.
                  </td>
                </tr>
              ) : (
                filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((r) => {
                  const isQualified = r.status === 'Qualified';
                  const isDisqualified = r.status === 'Disqualified';
                  const isInProgress = r.status === 'In Progress';
                  const isWaiting = r.status === 'Waiting';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                      
                      {/* Rank */}
                      <td className="px-5 py-4 font-bold text-white">
                        {r.rank === 1 && <span className="text-amber-400 font-extrabold text-sm">#1 🏆 GOLD</span>}
                        {r.rank === 2 && <span className="text-slate-300 font-extrabold text-sm">#2 🥈 SILVER</span>}
                        {r.rank === 3 && <span className="text-amber-600 font-extrabold text-sm">#3 🥉 BRONZE</span>}
                        {r.rank > 3 && <span className="text-slate-400">#{r.rank}</span>}
                      </td>

                      {/* Student & Institution */}
                      <td className="px-5 py-4">
                        <div className="font-sans font-bold text-white text-sm">{r.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.college} • {r.department}</div>
                      </td>

                      {/* Round 1 Score */}
                      <td className="px-5 py-4 text-center text-indigo-400 font-bold">
                        {r.round1Score} / 30
                      </td>

                      {/* Round 2 Score */}
                      <td className="px-5 py-4 text-center text-cyan-400 font-bold">
                        {r.round2Score} / 40
                      </td>

                      {/* Round 3 Score */}
                      <td className="px-5 py-4 text-center text-purple-400 font-bold">
                        {r.round3Score} / 50
                      </td>

                      {/* Final Score */}
                      <td className="px-5 py-4 text-center text-emerald-400 font-black text-sm">
                        {r.finalScore} / 120 PTS
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isQualified
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : isDisqualified
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : isInProgress
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse'
                            : isWaiting
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        }`}>
                          {r.status}
                        </span>
                      </td>

                    {/* Action Controls */}
                    <td className="px-5 py-4 text-right print:hidden">
                      <button
                        onClick={() => setViewResult(r)}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 transition-all text-xs font-semibold flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Scorecard
                      </button>
                    </td>

                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS BAR */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl font-mono text-xs print:hidden">
        <span className="text-slate-400">
          Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{Math.ceil(filteredResults.length / itemsPerPage) || 1}</strong> ({filteredResults.length} records found)
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            disabled={currentPage >= Math.ceil(filteredResults.length / itemsPerPage)}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredResults.length / itemsPerPage)))}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4. VIEW CANDIDATE DETAILED SCORECARD MODAL */}
      {viewResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">Candidate Official Scorecard</h3>
              </div>
              <button onClick={() => setViewResult(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-base font-bold text-white">{viewResult.name}</div>
                <div className="text-amber-400">{viewResult.email}</div>
                <div className="text-slate-400 text-[11px] pt-1">{viewResult.college} • {viewResult.department}</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">ROUND 1 (MCQ)</span>
                  <span className="text-sm font-bold text-indigo-400">{viewResult.round1Score} / 30</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">ROUND 2 (DEBUG)</span>
                  <span className="text-sm font-bold text-cyan-400">{viewResult.round2Score} / 40</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">ROUND 3 (FIX)</span>
                  <span className="text-sm font-bold text-purple-400">{viewResult.round3Score} / 50</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">Weighted Final Score:</span>
                <span className="text-emerald-400 font-black text-base">{viewResult.finalScore} / 120 PTS</span>
              </div>
            </div>

            <button
              onClick={() => setViewResult(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              Close Official Scorecard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
