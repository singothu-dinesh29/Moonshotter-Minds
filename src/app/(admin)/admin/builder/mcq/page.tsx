'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';

export default function McqBuilderPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [points, setPoints] = useState(10);
  const [negativePoints, setNegativePoints] = useState(2);
  const [isSaving, setIsSaving] = useState(false);

  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  const handleOptionChange = (index: number, text: string) => {
    const next = [...options];
    next[index].text = text;
    setOptions(next);
  };

  const handleCorrectToggle = (index: number) => {
    const next = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const autoTitle = title.trim() || markdown.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 45) || 'MCQ Question';

    const hasEmptyOption = options.some((opt) => !opt.text.trim());
    if (hasEmptyOption) {
      alert('All choice option text fields must be filled before saving.');
      return;
    }

    setIsSaving(true);
    const mcqOptions = options.map((opt, idx) => ({
      id: `opt-${Date.now()}-${idx}`,
      text: opt.text,
      isCorrect: opt.isCorrect,
      order: idx + 1
    }));

    const qRecord: Record<string, any> = {
      id: `q-${Date.now()}`,
      title: autoTitle,
      description: markdown,
      content_markdown: markdown,
      type: 'MCQ',
      language: 'JavaScript',
      difficulty: 'Medium',
      round: 'Round 1: Speed MCQ',
      round_id: 'round-1',
      points,
      negative_points: negativePoints,
      status: 'PUBLISHED',
      mcq_options: mcqOptions,
      updated_at: new Date().toISOString()
    };

    let activePayload = { ...qRecord };
    let { error } = await supabase.from('questions').upsert(activePayload).select();

    while (error && error.message && error.message.includes("schema cache")) {
      const match = error.message.match(/Could not find the '([^']+)' column/);
      if (match && match[1] && activePayload[match[1]] !== undefined) {
        delete activePayload[match[1]];
        const retryRes = await supabase.from('questions').upsert(activePayload).select();
        error = retryRes.error;
      } else {
        break;
      }
    }

    if (error) {
      alert(`Database Error: ${error.message}`);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    alert('MCQ Question saved and persisted to Supabase database successfully!');
    router.push('/admin/questions');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/questions" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              MCQ Question Authoring Builder
            </h1>
            <p className="text-xs text-slate-400">Create multiple choice question for Round 1 Speed Logic Blitz</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition-all"
        >
          <Save className="h-4 w-4" /> Save MCQ Question
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Question Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. PostgreSQL Index Time Complexity"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Question Markdown Content</label>
          <textarea
            required
            rows={4}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write markdown description or code snippet context..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Points Awarded (+)</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Negative Marking (-)</label>
            <input
              type="number"
              value={negativePoints}
              onChange={(e) => setNegativePoints(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Options Builder */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Multiple Choice Options</h4>

          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <input
                type="radio"
                name="correctOption"
                checked={opt.isCorrect}
                onChange={() => handleCorrectToggle(idx)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <input
                type="text"
                required
                value={opt.text}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1} text...`}
                className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none"
              />
              {opt.isCorrect && (
                <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                  CORRECT CHOICE
                </span>
              )}
            </div>
          ))}
        </div>

      </form>
    </div>
  );
}
