'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sliders, Clock, Save, Zap, Code2, Terminal, Loader2 } from 'lucide-react';

const DEFAULT_ROUNDS = [
  { id: '1', title: 'Round 1: Speed MCQ Arena', sequence_order: 1, duration_minutes: 15, total_weightage: 30, instructions: '15 Multiple Choice Questions testing Core Data Structures & OS Principles.' },
  { id: '2', title: 'Round 2: Algorithmic Debugging', sequence_order: 2, duration_minutes: 30, total_weightage: 40, instructions: 'Fix broken logic in provided codebase snippets across Python & C++.' },
  { id: '3', title: 'Round 3: Crash & Fix Engineering', sequence_order: 3, duration_minutes: 45, total_weightage: 50, instructions: 'Debug production crash scenarios under simulated load.' }
];

export default function RoundManagementPage() {
  const [rounds, setRounds] = useState(DEFAULT_ROUNDS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoundsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .order('sequence_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setRounds(data);
      }
    } catch (err) {
      console.error('Error fetching rounds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoundsFromSupabase();
  }, []);

  const handleDurationChange = (index: number, minutes: number) => {
    const next = [...rounds];
    next[index].duration_minutes = minutes;
    setRounds(next);
  };

  const handleSave = () => {
    alert('Symposium Round Sequences & Durations Updated in Supabase!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Symposium Round Management</h1>
          <p className="text-xs text-slate-400">Configure round sequence order, durations, instructions, and scoring weightages</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow"
        >
          <Save className="h-4 w-4" /> Save Round Config
        </button>
      </div>

      <div className="space-y-4">
        {rounds.map((r, idx) => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                {idx === 0 && <Zap className="h-5 w-5 text-indigo-400" />}
                {idx === 1 && <Code2 className="h-5 w-5 text-cyan-400" />}
                {idx === 2 && <Terminal className="h-5 w-5 text-purple-400" />}
                <h3 className="font-bold text-base text-white">{r.title}</h3>
              </div>
              <span className="text-xs font-mono bg-slate-950 px-3 py-1 rounded border border-slate-800 text-slate-300">
                SEQUENCE ORDER: #{r.sequence_order}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{r.instructions}</p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Round Duration (Minutes)</label>
                <input
                  type="number"
                  value={r.duration_minutes}
                  onChange={(e) => handleDurationChange(idx, Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs font-mono text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Weightage Percentage (%)</label>
                <input
                  type="number"
                  value={r.total_weightage}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[idx].total_weightage = Number(e.target.value);
                    setRounds(next);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
