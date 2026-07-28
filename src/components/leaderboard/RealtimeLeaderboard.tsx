'use client';

import React, { useState } from 'react';
import { MOCK_INITIAL_LEADERBOARD, MOCK_EVENT } from '@/lib/supabase';
import { Award, Trophy, Medal, Search, Clock, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function RealtimeLeaderboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboard, setLeaderboard] = useState(MOCK_INITIAL_LEADERBOARD);

  const filtered = leaderboard.filter((item) =>
    item.registration?.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.registration?.user?.college_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Real-Time Symposium Master Leaderboard</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Automated score aggregation across MCQ, Debugging & Crash-Fix rounds with instant completion speed tie-breaking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-60"
            />
          </div>

          <button
            onClick={() => setLeaderboard([...leaderboard])}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Refresh Leaderboard"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Candidate & College</th>
                <th className="px-6 py-4 text-center">Score Breakdown</th>
                <th className="px-6 py-4 text-center">Completion Speed</th>
                <th className="px-6 py-4 text-center">Anti-Cheat Audit</th>
                <th className="px-6 py-4 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const user = item.registration?.user;
                const flags = item.registration?.anti_cheat_flag_count || 0;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    
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

                    {/* Candidate Info */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">{user?.full_name}</div>
                      <div className="text-slate-400 text-xs">{user?.college_name}</div>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-center font-mono">
                      <span className="text-base font-bold text-indigo-400">{item.total_score}</span>
                      <span className="text-slate-500 text-[11px]"> / 120 pts</span>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 text-center font-mono text-slate-300">
                      <div className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {Math.floor(item.completion_time_seconds / 60)}m {item.completion_time_seconds % 60}s
                      </div>
                    </td>

                    {/* Anti Cheat Status */}
                    <td className="px-6 py-4 text-center font-mono">
                      {flags === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                          <ShieldCheck className="h-3 w-3" /> Clean Audit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                          ⚠️ {flags} Incident Flags
                        </span>
                      )}
                    </td>

                    {/* Certificate Action */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/verify/HASH-${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
                      >
                        Verify PDF
                      </Link>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
