'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { MOCK_EVENT, MOCK_ROUNDS, MOCK_INITIAL_LEADERBOARD, supabase } from '@/lib/supabase';
import { formatSeconds } from '@/lib/utils';
import { 
  User, 
  School, 
  Mail, 
  Phone, 
  Award, 
  Clock, 
  ShieldCheck, 
  Play, 
  Megaphone, 
  FileCheck, 
  Zap, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  HelpCircle, 
  Trophy, 
  ExternalLink,
  Flame,
  Bell,
  ArrowRight
} from 'lucide-react';

export default function StudentDashboardView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVENTS' | 'ROUNDS' | 'SCORES' | 'INBOX' | 'CERTIFICATES' | 'INSTRUCTIONS'>('OVERVIEW');

  // Pre-exam countdown timer (e.g. 12 minutes countdown to live round start)
  const [lobbyCountdown, setLobbyCountdown] = useState<number>(12 * 60);

  // Live Dynamic Round Specifications State loaded from Supabase
  const [roundsData, setRoundsData] = useState<any[]>([
    {
      id: 'round-1',
      number: 'ROUND 01',
      title: 'Speed MCQ Challenge',
      type: 'MCQ',
      publishedQuestionsCount: 15,
      duration_minutes: 15,
      totalMarks: 30,
      negativeMarking: '-2 PTS',
      difficulty: 'Easy',
      status: 'Available',
      instructions: 'Select the optimal answer for core CS fundamentals, algorithms, and system design questions.',
      href: '/arena/mcq'
    },
    {
      id: 'round-2',
      number: 'ROUND 02',
      title: 'Algorithmic Debugging Challenge',
      type: 'Debugging',
      publishedQuestionsCount: 2,
      duration_minutes: 15,
      totalMarks: 40,
      negativeMarking: '0 PTS',
      difficulty: 'Medium',
      status: 'Available',
      instructions: 'Identify logic flaws, edge-case bugs, and off-by-one errors in the code snippet. Make all test cases pass!',
      href: '/arena/debugging'
    },
    {
      id: 'round-3',
      number: 'ROUND 03',
      title: 'Crash & Fix Engineering',
      type: 'Crash & Fix',
      publishedQuestionsCount: 2,
      duration_minutes: 15,
      totalMarks: 50,
      negativeMarking: '0 PTS',
      difficulty: 'Hard',
      status: 'Available',
      instructions: 'The target module is throwing an unhandled runtime Exception or infinite recursion crash. Patch the code under time pressure!',
      href: '/arena/crash-fix'
    }
  ]);

  const fetchLiveRoundsFromSupabase = async () => {
    try {
      const { data: dbQuestions } = await supabase.from('questions').select('*');
      const { data: dbRounds } = await supabase.from('rounds').select('*');

      const allQuestions = dbQuestions || [];
      const publishedQs = allQuestions.filter((q: any) => q.status === 'PUBLISHED' || q.status === 'Published');

      // Round 01: MCQ
      const r1Questions = publishedQs.filter((q: any) => q.type === 'MCQ' || q.round_id === 'round-1' || !q.type);
      const r1TotalMarks = r1Questions.reduce((sum: number, q: any) => sum + (q.points || q.marks || 10), 0) || 30;
      const r1Neg = r1Questions[0]?.negative_points ?? r1Questions[0]?.negativeMarks ?? 2;
      const r1RoundDb = dbRounds?.find((r: any) => r.round_type === 'MCQ' || r.sequence_order === 1);
      const r1Duration = r1RoundDb?.duration_minutes || 15;
      const r1Status = r1RoundDb?.status || 'Available';
      const r1Diff = r1Questions[0]?.difficulty || 'Easy';

      // Round 02: Debugging
      const r2Questions = publishedQs.filter((q: any) => q.type === 'Debugging' || q.round_id === 'round-2');
      const r2TotalMarks = r2Questions.reduce((sum: number, q: any) => sum + (q.points || q.marks || 40), 0) || 40;
      const r2Neg = r2Questions[0]?.negative_points ?? r2Questions[0]?.negativeMarks ?? 0;
      const r2RoundDb = dbRounds?.find((r: any) => r.round_type === 'DEBUGGING' || r.sequence_order === 2);
      const r2Duration = r2RoundDb?.duration_minutes || 15;
      const r2Status = r2RoundDb?.status || 'Available';
      const r2Diff = r2Questions[0]?.difficulty || 'Medium';

      // Round 03: Crash & Fix
      const r3Questions = publishedQs.filter((q: any) => q.type === 'Crash & Fix' || q.round_id === 'round-3');
      const r3TotalMarks = r3Questions.reduce((sum: number, q: any) => sum + (q.points || q.marks || 50), 0) || 50;
      const r3Neg = r3Questions[0]?.negative_points ?? r3Questions[0]?.negativeMarks ?? 0;
      const r3RoundDb = dbRounds?.find((r: any) => r.round_type === 'CRASH_FIX' || r.sequence_order === 3);
      const r3Duration = r3RoundDb?.duration_minutes || 15;
      const r3Status = r3RoundDb?.status || 'Available';
      const r3Diff = r3Questions[0]?.difficulty || 'Hard';

      setRoundsData([
        {
          id: 'round-1',
          number: 'ROUND 01',
          title: r1RoundDb?.title || 'Speed MCQ Challenge',
          type: 'MCQ',
          publishedQuestionsCount: r1Questions.length || 15,
          duration_minutes: r1Duration,
          totalMarks: r1TotalMarks,
          negativeMarking: r1Neg > 0 ? `-${r1Neg} PTS` : '0 PTS',
          difficulty: r1Diff,
          status: r1Status,
          instructions: r1RoundDb?.instructions || 'Select the optimal answer for core CS fundamentals, algorithms, and system design questions.',
          href: '/arena/mcq'
        },
        {
          id: 'round-2',
          number: 'ROUND 02',
          title: r2RoundDb?.title || 'Algorithmic Debugging Challenge',
          type: 'Debugging',
          publishedQuestionsCount: r2Questions.length || 2,
          duration_minutes: r2Duration,
          totalMarks: r2TotalMarks,
          negativeMarking: r2Neg > 0 ? `-${r2Neg} PTS` : '0 PTS',
          difficulty: r2Diff,
          status: r2Status,
          instructions: r2RoundDb?.instructions || 'Identify logic flaws, edge-case bugs, and off-by-one errors in the code snippet. Make all test cases pass!',
          href: '/arena/debugging'
        },
        {
          id: 'round-3',
          number: 'ROUND 03',
          title: r3RoundDb?.title || 'Crash & Fix Engineering',
          type: 'Crash & Fix',
          publishedQuestionsCount: r3Questions.length || 2,
          duration_minutes: r3Duration,
          totalMarks: r3TotalMarks,
          negativeMarking: r3Neg > 0 ? `-${r3Neg} PTS` : '0 PTS',
          difficulty: r3Diff,
          status: r3Status,
          instructions: r3RoundDb?.instructions || 'The target module is throwing an unhandled runtime Exception or infinite recursion crash. Patch the code under time pressure!',
          href: '/arena/crash-fix'
        }
      ]);
    } catch (err) {
      console.error('Error fetching live rounds:', err);
    }
  };

  useEffect(() => {
    fetchLiveRoundsFromSupabase();

    const qChannel = supabase
      .channel('realtime_student_dashboard_q')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => fetchLiveRoundsFromSupabase())
      .subscribe();

    const rChannel = supabase
      .channel('realtime_student_dashboard_r')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => fetchLiveRoundsFromSupabase())
      .subscribe();

    return () => {
      supabase.removeChannel(qChannel);
      supabase.removeChannel(rChannel);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLobbyCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const candidateRank = MOCK_INITIAL_LEADERBOARD[0]; // #1 Rank for Alex Chen

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* 1. CANDIDATE PROFILE HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
              <User className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user?.full_name || 'Registered Candidate'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                VERIFIED CANDIDATE
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1"><School className="h-3.5 w-3.5 text-indigo-400" /> {user?.college_name || 'Muthayammal Engineering College'}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">ID: 2026-CS-942</span>
            </p>
          </div>
        </div>

        {/* Action Button & Lobby Countdown */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 block">LOBBY COUNTDOWN</span>
            <span className="text-sm font-bold text-indigo-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              {formatSeconds(lobbyCountdown)}
            </span>
          </div>

          <Link
            href="/arena/evt-symposium-2026"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all"
          >
            <Flame className="h-4 w-4 text-amber-300 fill-current" />
            Enter Exam Arena
          </Link>
        </div>
      </div>

      {/* 2. DASHBOARD TABBED NAVIGATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: 'Overview Hub', icon: User },
          { id: 'EVENTS', label: 'Available Events', icon: Flame },
          { id: 'ROUNDS', label: 'Round Specs', icon: Zap },
          { id: 'SCORES', label: 'My Scores', icon: Award },
          { id: 'INBOX', label: 'Announcements (2)', icon: Bell },
          { id: 'CERTIFICATES', label: 'Certificates', icon: FileCheck },
          { id: 'INSTRUCTIONS', label: 'Exam Rules', icon: HelpCircle },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <IconComp className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW HUB */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Event Card (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 inline-block mb-2">
                  LIVE COMPETITION
                </span>
                <h3 className="text-xl font-bold text-white">{MOCK_EVENT.title}</h3>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                45 MINS TOTAL
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{MOCK_EVENT.description}</p>

            <div className="grid grid-cols-3 gap-4 font-mono text-xs text-slate-300 border-t border-b border-slate-800 py-4">
              <div>
                <span className="text-slate-500 block text-[10px]">ROUND 1</span>
                Speed MCQ (30%)
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ROUND 2</span>
                Debugging (40%)
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ROUND 3</span>
                Crash & Fix (50%)
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> System Hardware Check: <strong className="text-white font-mono">100% READY</strong>
              </span>

              <Link
                href="/arena/evt-symposium-2026"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow"
              >
                Launch Arena
              </Link>
            </div>
          </div>

          {/* Current Rank & Score Summary (1 col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" /> Candidate Rank Preview
                </h3>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  RANK #1
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Points:</span>
                  <span className="text-indigo-400 font-bold text-sm">98 / 120</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Completion Speed:</span>
                  <span className="text-slate-200">14m 22s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Anti-Cheat Flags:</span>
                  <span className="text-emerald-400">0 Violations</span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/leaderboard"
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Award className="h-3.5 w-3.5 text-amber-400" /> Full Leaderboard
            </Link>
          </div>

        </div>
      )}

      {/* TAB 2: AVAILABLE EVENTS */}
      {activeTab === 'EVENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-2">Registered Symposium Competitions</h3>
          
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mb-2">
                ACTIVE NOW
              </span>
              <h4 className="font-bold text-base text-white">{MOCK_EVENT.title}</h4>
              <p className="text-xs text-slate-400 mt-1">Status: Registered Candidate | Entry Pass Granted</p>
            </div>

            <Link
              href="/arena/evt-symposium-2026"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow"
            >
              Enter Exam Arena
            </Link>
          </div>
        </div>
      )}

      {/* TAB 3: ROUND SPECS */}
      {activeTab === 'ROUNDS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roundsData.map((r, idx) => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-xl relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    {idx === 0 && <Zap className="h-5 w-5 text-indigo-400" />}
                    {idx === 1 && <Code2 className="h-5 w-5 text-cyan-400" />}
                    {idx === 2 && <Terminal className="h-5 w-5 text-purple-400" />}
                    <div>
                      <h4 className="font-bold text-base text-white">{r.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{r.number} • {r.type}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    r.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    r.status === 'Upcoming' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    r.status === 'Completed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">{r.instructions}</p>

                {/* LIVE DYNAMIC SUPABASE SPECS GRID */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">QUESTIONS</span>
                    <span className="text-white font-bold">{r.publishedQuestionsCount} Published</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TIME LIMIT</span>
                    <span className="text-amber-400 font-bold">{r.duration_minutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TOTAL MARKS</span>
                    <span className="text-emerald-400 font-bold">{r.totalMarks} PTS</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">NEGATIVE MARK</span>
                    <span className="text-rose-400 font-bold">{r.negativeMarking}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DIFFICULTY</span>
                    <span className="text-cyan-400 font-bold">{r.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ROUND STATUS</span>
                    <span className="text-indigo-400 font-bold">{r.status}</span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC LAUNCH ARENA BUTTON */}
              <Link
                href={r.href}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>Launch {r.number} Arena</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MY SCORES */}
      {activeTab === 'SCORES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Candidate Evaluation Scorecard</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">ROUND 1: SPEED MCQ</span>
              <div className="text-xl font-bold text-indigo-400">30 / 30 pts</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">ROUND 2: DEBUGGING</span>
              <div className="text-xl font-bold text-cyan-400">40 / 40 pts</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">ROUND 3: CRASH & FIX</span>
              <div className="text-xl font-bold text-purple-400">28 / 50 pts</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px]">TOTAL AGGREGATE</span>
              <div className="text-xl font-bold text-emerald-400">98 / 120 pts</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS INBOX */}
      {activeTab === 'INBOX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-400" /> Candidate Broadcast Inbox
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-1">
              <div className="flex justify-between text-indigo-400">
                <strong className="font-sans font-bold">Organizer Announcement</strong>
                <span>10:05 AM</span>
              </div>
              <p className="text-slate-300 font-sans">Welcome candidates! Round 1 speed MCQ is active. Make sure your browser remains in full screen mode.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <strong className="font-sans font-bold">System Onboarding</strong>
                <span>09:45 AM</span>
              </div>
              <p className="text-slate-300 font-sans">Monaco Editor language servers initialized successfully. All systems nominal.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-400" /> Verified PDF Certificates
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              1 CERTIFICATE ISSUED
            </span>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <h4 className="font-sans font-bold text-sm text-white">National Tech Symposium 2026 Certificate of Merit</h4>
              <p className="text-slate-400 text-xs mt-1">Hash: SHA256-SYM-948271048-VERIFIED</p>
            </div>

            <Link
              href="/verify/SYM-948271048-VERIFIED"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow"
            >
              Verify & Download PDF <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB 7: EXAM INSTRUCTIONS */}
      {activeTab === 'INSTRUCTIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Examination Rules & Anti-Cheat Requirements</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Fullscreen mode is mandatory during active competition rounds.</li>
            <li>Exceeding 3 window blur or tab switch incidents results in automated candidate session disqualification.</li>
            <li>Clipboard paste functionality is locked inside the code editor to enforce original code authoring.</li>
            <li>Timers are server-anchored; modifying local browser time will not extend exam duration.</li>
          </ul>
        </div>
      )}

    </div>
  );
}
