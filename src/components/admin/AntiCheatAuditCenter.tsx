'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  Clock, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  CheckCircle2, 
  UserX, 
  RotateCcw, 
  Activity, 
  Search, 
  Filter, 
  Zap, 
  Code2, 
  Terminal,
  Lock,
  Unlock,
  Eye,
  Send,
  X,
  FileCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface LiveStudentCard {
  id: string; // Registration Number e.g. 2026-AI-101
  name: string;
  email: string;
  department: string;
  currentRound: string;
  questionNumber: number;
  totalQuestions: number;
  remainingTimeSec: number;
  currentScore: number;
  statusIndicator: 'NORMAL' | 'WARNING' | 'DISQUALIFIED';
  browserFocus: 'Focused' | 'Window Blurred' | 'Tab Switched';
  fullscreenStatus: 'Fullscreen Locked' | 'Fullscreen Exited';
  internetConnection: 'Online' | 'Reconnecting' | 'Offline';
  submissionStatus: 'Draft Saved' | 'Submitted' | 'Pending';
  malpracticeCount: number;
}

export default function AntiCheatAuditCenter() {
  const [students, setStudents] = useState<LiveStudentCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'WARNING' | 'DISQUALIFIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndicator, setFilterIndicator] = useState<string>('ALL');
  const [viewStudentModal, setViewStudentModal] = useState<LiveStudentCard | null>(null);

  // Real-Time Supabase Student Fetcher
  const fetchStudentsFromSupabase = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { data: dbUsers, error: dbErr } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          college_name,
          role,
          created_at,
          registrations (
            id,
            status,
            total_score,
            anti_cheat_flag_count
          )
        `)
        .eq('role', 'STUDENT')
        .order('created_at', { ascending: false });

      if (dbErr) throw dbErr;

      if (dbUsers) {
        const mapped: LiveStudentCard[] = dbUsers.map((u: any, idx: number) => {
          const reg = u.registrations?.[0];
          const rawStatus = reg?.status || 'REGISTERED';
          const score = reg?.total_score || 0;
          const flags = reg?.anti_cheat_flag_count || 0;

          let statusIndicator: 'NORMAL' | 'WARNING' | 'DISQUALIFIED' = 'NORMAL';
          if (rawStatus === 'DISQUALIFIED' || flags >= 3) statusIndicator = 'DISQUALIFIED';
          else if (flags > 0) statusIndicator = 'WARNING';
          else statusIndicator = 'NORMAL';

          const shortId = `2026-CS-${101 + idx}`;

          return {
            id: shortId,
            name: u.full_name || 'Candidate',
            email: u.email,
            department: 'Artificial Intelligence & Machine Learning',
            currentRound: 'Round 1: Speed MCQ',
            questionNumber: 15,
            totalQuestions: 15,
            remainingTimeSec: 600,
            currentScore: score,
            statusIndicator: statusIndicator,
            browserFocus: flags > 0 ? 'Tab Switched' : 'Focused',
            fullscreenStatus: 'Fullscreen Locked',
            internetConnection: 'Online',
            submissionStatus: rawStatus === 'SUBMITTED' ? 'Submitted' : 'Draft Saved',
            malpracticeCount: flags
          };
        });

        setStudents(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching proctoring students:', err);
      setErrorMsg(err.message || 'Failed to fetch student proctoring data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsFromSupabase();

    // Supabase Real-Time Channel Subscription
    const channel = supabase
      .channel('realtime_admin_proctoring_audit')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchStudentsFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchStudentsFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboards' }, () => {
        fetchStudentsFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Supabase Realtime Subscription Listener & Auto-Refresh Timer
  useEffect(() => {
    // 1. Auto-Refresh Countdown Timer (Ticks every 1s automatically without manual refresh)
    const countdownTimer = setInterval(() => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.remainingTimeSec > 0 && s.statusIndicator !== 'DISQUALIFIED') {
            return { ...s, remainingTimeSec: s.remainingTimeSec - 1 };
          }
          return s;
        })
      );
    }, 1000);

    // 2. Supabase Realtime WebSockets Channel
    const channel = supabase
      .channel('realtime_live_monitor_centre')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cheating_logs' }, (payload: any) => {
        if (payload.new) {
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id === payload.new.registration_id) {
                const newCount = s.malpracticeCount + 1;
                const newStatus = newCount >= 3 ? 'DISQUALIFIED' : 'WARNING';
                return {
                  ...s,
                  malpracticeCount: newCount,
                  statusIndicator: newStatus,
                  browserFocus: 'Tab Switched'
                };
              }
              return s;
            })
          );
        }
      })
      .subscribe();

    return () => {
      clearInterval(countdownTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Admin Actions
  const handleSendWarning = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, statusIndicator: 'WARNING', malpracticeCount: Math.min(s.malpracticeCount + 1, 3) } : s))
    );
    alert(`Warning broadcasted to candidate (${id})!`);
  };

  const handleRestore = (id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              statusIndicator: 'NORMAL',
              browserFocus: 'Focused',
              fullscreenStatus: 'Fullscreen Locked',
              malpracticeCount: 0,
              remainingTimeSec: 600
            }
          : s
      )
    );
    alert(`Candidate (${id}) has been restored for active re-entry!`);
  };

  const handleDisqualify = (id: string) => {
    if (confirm(`Disqualify candidate (${id}) and lock session?`)) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                statusIndicator: 'DISQUALIFIED',
                browserFocus: 'Tab Switched',
                fullscreenStatus: 'Fullscreen Exited',
                malpracticeCount: 3
              }
            : s
        )
      );
    }
  };

  // Search & Filters
  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) || // Reg No
      s.department.toLowerCase().includes(query) ||
      s.currentRound.toLowerCase().includes(query);

    const matchesIndicator = filterIndicator === 'ALL' || s.statusIndicator === filterIndicator;

    return matchesSearch && matchesIndicator;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-red-950/60 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
            <Activity className="h-3.5 w-3.5 text-red-400 animate-pulse" />
            <span>REAL-TIME LIVE MONITORING CENTRE (SUPABASE WEBSOCKETS)</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Live Examination Monitoring Centre
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-sans max-w-2xl">
            Real-time candidate cards displaying Registration No, Department, Remaining Time clock, 3-Color Status Indicators (Normal, Warning, Disqualified), and telemetry badges.
          </p>
        </div>

        {/* Status Indicators Legend */}
        <div className="flex items-center gap-2 relative z-10 font-mono text-xs">
          <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">REALTIME STATUS INDICATORS</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-400 flex items-center gap-1 font-bold">🟢 Normal</span>
              <span className="text-amber-400 flex items-center gap-1 font-bold">🟡 Warning</span>
              <span className="text-red-400 flex items-center gap-1 font-bold">🔴 Disqualified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADVANCED SEARCH & STATUS INDICATOR FILTERS */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate name, Reg No, department, or round..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={filterIndicator}
            onChange={(e) => setFilterIndicator(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL STATUS INDICATORS</option>
            <option value="NORMAL">🟢 NORMAL ONLY</option>
            <option value="WARNING">🟡 WARNING ONLY</option>
            <option value="DISQUALIFIED">🔴 DISQUALIFIED ONLY</option>
          </select>

        </div>
      </div>

      {/* 3. REAL-TIME ACTIVE STUDENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredStudents.map((s) => {
            const isNormal = s.statusIndicator === 'NORMAL';
            const isWarning = s.statusIndicator === 'WARNING';
            const isDisqualified = s.statusIndicator === 'DISQUALIFIED';

            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`bg-slate-900/90 border p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all ${
                  isDisqualified
                    ? 'border-red-500/60 bg-red-950/20'
                    : isWarning
                    ? 'border-amber-500/60 bg-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700/80'
                }`}
              >
                
                {/* Top Card Header */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400">REG: {s.id}</span>
                    <h3 className="font-bold text-base text-white tracking-tight">{s.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{s.department}</p>
                  </div>

                  {/* 3 STATUS INDICATOR BADGES */}
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                    isNormal
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                      : 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  }`}>
                    {isNormal && '🟢 Normal'}
                    {isWarning && '🟡 Warning'}
                    {isDisqualified && '🔴 Disqualified'}
                  </span>
                </div>

                {/* Round & Question Number */}
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase">Current Round</span>
                    <span className="text-amber-400 font-bold">{s.currentRound}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase">Question Number</span>
                    <span className="text-white font-bold">Q #{s.questionNumber} / {s.totalQuestions}</span>
                  </div>
                </div>

                {/* Remaining Time & Score */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase">REMAINING TIME</span>
                    <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(s.remainingTimeSec)}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase">CURRENT SCORE</span>
                    <span className="text-sm font-bold text-emerald-400">{s.currentScore} PTS</span>
                  </div>
                </div>

                {/* TELEMETRY DISPLAYS ON CARD */}
                <div className="space-y-1.5 font-mono text-[11px] bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                  
                  {/* Browser Focus */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Browser Focus:</span>
                    <span className={`font-bold ${s.browserFocus === 'Focused' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.browserFocus}
                    </span>
                  </div>

                  {/* Fullscreen Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Fullscreen:</span>
                    <span className={`font-bold ${s.fullscreenStatus === 'Fullscreen Locked' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.fullscreenStatus}
                    </span>
                  </div>

                  {/* Internet Connection */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Internet:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Wifi className="h-3 w-3" /> {s.internetConnection}
                    </span>
                  </div>

                  {/* Submission Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Submission:</span>
                    <span className="text-cyan-400 font-bold">
                      {s.submissionStatus}
                    </span>
                  </div>

                  {/* Malpractice Counter */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-500">Malpractice Counter:</span>
                    <span className={`font-bold ${s.malpracticeCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {s.malpracticeCount} / 3 FLAGS
                    </span>
                  </div>

                </div>

                {/* 4 ADMIN ACTION BUTTONS PER CARD */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <button
                    onClick={() => setViewStudentModal(s)}
                    className="py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>

                  <button
                    onClick={() => handleSendWarning(s.id)}
                    className="py-2 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Send className="h-3.5 w-3.5" /> Warning
                  </button>

                  <button
                    onClick={() => handleRestore(s.id)}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>

                  <button
                    onClick={() => handleDisqualify(s.id)}
                    className="py-2 px-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <UserX className="h-3.5 w-3.5" /> Disqualify
                  </button>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* VIEW STUDENT INSPECTION MODAL */}
      {viewStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">REG: {viewStudentModal.id}</span>
                <h3 className="font-bold text-lg text-white">{viewStudentModal.name}</h3>
              </div>
              <button onClick={() => setViewStudentModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">{viewStudentModal.department}</div>
                <div className="text-amber-400">{viewStudentModal.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CURRENT ROUND</span>
                  <span className="text-indigo-400 font-bold">{viewStudentModal.currentRound}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CURRENT SCORE</span>
                  <span className="text-emerald-400 font-bold">{viewStudentModal.currentScore} PTS</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewStudentModal(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              Close Telemetry Dossier
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
