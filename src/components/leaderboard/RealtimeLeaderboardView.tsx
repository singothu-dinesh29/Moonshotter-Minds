'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardRecord, supabase } from '@/lib/supabase';
import { getDynamicScorecard, sortLeaderboardRecords } from '@/lib/scoringEngine';
import { Trophy, Medal, Award, Clock, ShieldCheck, Search, RefreshCw, Zap, Sparkles, Activity } from 'lucide-react';
import Link from 'next/link';

export default function RealtimeLeaderboardView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  const fetchLiveLeaderboard = async () => {
    try {
      const { data: lbData } = await supabase
        .from('leaderboard')
        .select('*');

      const { data: dbUsers } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'STUDENT');

      const { data: dbRegs } = await supabase
        .from('registrations')
        .select('*');

      const activeScorecard = getDynamicScorecard();

      if (dbUsers && dbUsers.length > 0) {
        const mapped: any[] = dbUsers.map((u: any, idx: number) => {
          const reg = dbRegs?.find((r: any) => r.user_id === u.id || r.user_id === u.email || r.id === u.id);
          const lb = lbData?.find((l: any) => l.student_id === u.id || l.student_id === u.email || l.registration_id === reg?.id);

          const isCurrentCandidate = u.id === 'candidate-2026-cs-942' || u.email === 'alex.chen@mit.edu' || idx === 0;

          const r1 = lb?.round_1_score ?? (isCurrentCandidate ? activeScorecard.mcqScore : 0);
          const r2 = lb?.round_2_score ?? (isCurrentCandidate ? activeScorecard.debuggingScore : 0);
          const r3 = lb?.round_3_score ?? (isCurrentCandidate ? activeScorecard.crashFixScore : 0);
          const total = lb?.total_score ?? (r1 + r2 + r3);
          const compTime = lb?.completion_time_seconds ?? (isCurrentCandidate ? activeScorecard.completionTimeSeconds : 0);
          const flags = lb?.anti_cheat_flag_count ?? reg?.anti_cheat_flag_count ?? (isCurrentCandidate ? activeScorecard.antiCheatFlags : 0);

          return {
            id: lb?.id || `lb-${u.id}`,
            event_id: 'evt-symposium-2026',
            student_id: u.id,
            registration_id: reg?.id || u.id,
            registration: {
              id: reg?.id || u.id,
              user_id: u.id,
              event_id: 'evt-symposium-2026',
              status: reg?.status || 'SUBMITTED',
              total_score: total,
              created_at: reg?.created_at || new Date().toISOString(),
              user: {
                full_name: u.full_name || 'Candidate',
                college_name: u.college_name || 'Muthayammal Engineering College'
              },
              anti_cheat_flag_count: flags
            },
            name: u.full_name || 'Candidate',
            college: u.college_name || 'Muthayammal Engineering College',
            round_1_score: r1,
            round_2_score: r2,
            round_3_score: r3,
            total_score: total,
            completion_time_seconds: compTime,
            anti_cheat_flag_count: flags,
            rank: idx + 1,
            disqualified: flags >= 3 || reg?.status === 'DISQUALIFIED',
            created_at: lb?.created_at || new Date().toISOString(),
            updated_at: lb?.updated_at || new Date().toISOString()
          };
        });

        const sorted = sortLeaderboardRecords(mapped);
        setLeaderboard(sorted);
      }
    } catch (err) {
      console.error('Error fetching live leaderboard view:', err);
    }
  };

  useEffect(() => {
    fetchLiveLeaderboard();

    if (!isRealtimeActive) return;

    const channel = supabase
      .channel('realtime_leaderboard_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => fetchLiveLeaderboard())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isRealtimeActive]);

  const filtered = leaderboard.filter((item) => {
    const user = item.registration?.user;
    return (
      user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.college_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const top1 = leaderboard.find((item) => item.rank === 1);
  const top2 = leaderboard.find((item) => item.rank === 2);
  const top3 = leaderboard.find((item) => item.rank === 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* 1. HEADER & REALTIME TOGGLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">SUPABASE REALTIME WEBSOCKET ACTIVE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Master Symposium Real-Time Leaderboard</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Live score accumulation across Speed MCQ, Algorithmic Debugging & Crash-Fix Patching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRealtimeActive(!isRealtimeActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              isRealtimeActive
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Activity className={`h-4 w-4 ${isRealtimeActive ? 'animate-pulse text-emerald-400' : ''}`} />
            Realtime WS: {isRealtimeActive ? 'STREAMING' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* 2. TOP 3 PERFORMERS PODIUM SPOTLIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* 2nd Place Silver Podium */}
        {top2 && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 rounded-2xl border border-slate-700/80 text-center space-y-3 relative md:mt-6 shadow-lg"
          >
            <div className="h-14 w-14 rounded-full bg-slate-400/10 border border-slate-400/30 flex items-center justify-center text-slate-300 mx-auto">
              <Medal className="h-7 w-7" />
            </div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold block">RUNNER-UP (#2)</span>
            <h3 className="text-xl font-bold text-white">{top2.registration?.user?.full_name}</h3>
            <p className="text-xs text-slate-400">{top2.registration?.user?.college_name}</p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center font-mono text-xs text-slate-300">
              <span>Score: <strong className="text-indigo-400">{top2.total_score} pts</strong></span>
              <span>Time: <strong className="text-slate-200">{Math.floor(top2.completion_time_seconds / 60)}m {top2.completion_time_seconds % 60}s</strong></span>
            </div>
          </motion.div>
        )}

        {/* 1st Place Gold Champion Podium */}
        {top1 && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel-glow p-8 rounded-2xl border border-amber-500/50 text-center space-y-4 relative shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold font-mono uppercase tracking-wider rounded-bl-lg">
              CURRENT #1 CHAMPION
            </div>
            <div className="h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest block">GRAND CHAMPION (#1)</span>
            <h3 className="text-2xl font-black text-white">{top1.registration?.user?.full_name}</h3>
            <p className="text-xs text-slate-300">{top1.registration?.user?.college_name}</p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex justify-between items-center font-mono text-xs text-slate-200">
              <span>Total Score: <strong className="text-amber-400 text-sm">{top1.total_score} pts</strong></span>
              <span>Completion: <strong className="text-white">{Math.floor(top1.completion_time_seconds / 60)}m {top1.completion_time_seconds % 60}s</strong></span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place Bronze Podium */}
        {top3 && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-3 relative md:mt-6 shadow-lg"
          >
            <div className="h-14 w-14 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-amber-600 mx-auto">
              <Medal className="h-7 w-7" />
            </div>
            <span className="text-[11px] font-mono text-amber-600 uppercase tracking-widest font-bold block">SECOND RUNNER-UP (#3)</span>
            <h3 className="text-xl font-bold text-white">{top3.registration?.user?.full_name}</h3>
            <p className="text-xs text-slate-400">{top3.registration?.user?.college_name}</p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center font-mono text-xs text-slate-300">
              <span>Score: <strong className="text-indigo-400">{top3.total_score} pts</strong></span>
              <span>Time: <strong className="text-slate-200">{Math.floor(top3.completion_time_seconds / 60)}m {top3.completion_time_seconds % 60}s</strong></span>
            </div>
          </motion.div>
        )}

      </div>

      {/* 3. SEARCH & FULL LEADERBOARD TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate name or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing <strong className="text-white">{filtered.length}</strong> Ranked Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Candidate & College</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Completion Speed</th>
                <th className="px-6 py-4 text-center">Anti-Cheat Audit</th>
                <th className="px-6 py-4 text-right">Certificate Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <AnimatePresence>
                {filtered.map((item) => {
                  const user = item.registration?.user;
                  const flags = item.registration?.anti_cheat_flag_count || 0;

                  return (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Rank Badge */}
                      <td className="px-6 py-4 font-mono font-bold">
                        {item.rank === 1 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Trophy className="h-3.5 w-3.5" /> #1 Champion
                          </span>
                        )}
                        {item.rank === 2 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-400/10 text-slate-300 border border-slate-400/30">
                            <Medal className="h-3.5 w-3.5" /> #2 Runner-Up
                          </span>
                        )}
                        {item.rank === 3 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/10 text-amber-500 border border-amber-700/30">
                            <Medal className="h-3.5 w-3.5" /> #3 Second Runner
                          </span>
                        )}
                        {item.rank > 3 && <span className="text-slate-400 pl-3">#{item.rank}</span>}
                      </td>

                      {/* Candidate */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{user?.full_name}</div>
                        <div className="text-slate-400 text-xs">{user?.college_name}</div>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 text-center font-mono">
                        <span className="text-base font-bold text-indigo-400">{item.total_score}</span>
                        <span className="text-slate-500 text-[11px]"> / 120 pts</span>
                      </td>

                      {/* Timer */}
                      <td className="px-6 py-4 text-center font-mono text-slate-300">
                        <div className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {Math.floor(item.completion_time_seconds / 60)}m {item.completion_time_seconds % 60}s
                        </div>
                      </td>

                      {/* Anti Cheat Audit */}
                      <td className="px-6 py-4 text-center font-mono">
                        {flags === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                            <ShieldCheck className="h-3 w-3" /> Clean Audit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                            ⚠️ {flags} Flags
                          </span>
                        )}
                      </td>

                      {/* Certificate */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/verify/SYM-${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
                        >
                          Verify PDF
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
