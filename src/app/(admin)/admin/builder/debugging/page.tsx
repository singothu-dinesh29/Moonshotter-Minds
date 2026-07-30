'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sliders, Save, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';

export default function DebuggingBuilderPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [buggyCode, setBuggyCode] = useState('function debugTarget(arr) {\n  // Buggy implementation\n}');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const autoTitle = title.trim() || markdown.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 45) || 'Debugging Question';

    setIsSaving(true);
    const qRecord: Record<string, any> = {
      id: crypto.randomUUID(),
      title: autoTitle,
      description: markdown,
      content_markdown: markdown,
      type: 'Debugging',
      language: 'JavaScript',
      difficulty: 'Medium',
      round: 'Round 2: Algorithmic Debugging',
      points: 40,
      buggy_code: buggyCode,
      reference_solution: buggyCode,
      status: 'PUBLISHED',
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
    alert('Debugging Question saved and persisted to Supabase database successfully!');
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
              <Sliders className="h-5 w-5 text-purple-400" />
              Algorithmic Debugging Builder
            </h1>
            <p className="text-xs text-slate-400">Author buggy code scenarios for Round 2 Debugging Arena</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow transition-all"
        >
          <Save className="h-4 w-4" /> Save Debugging Question
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Debugging Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix Binary Search Infinite Loop"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Bug Scenario Description</label>
          <textarea
            required
            rows={4}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Describe the logic bug or edge case..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Buggy Source Code Snippet</label>
          <textarea
            required
            rows={6}
            value={buggyCode}
            onChange={(e) => setBuggyCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
          />
        </div>
      </form>
    </div>
  );
}
