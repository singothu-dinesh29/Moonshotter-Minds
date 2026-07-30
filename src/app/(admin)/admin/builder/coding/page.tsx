'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';

export default function CodingBuilderPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [initialCode, setInitialCode] = useState('function solution(input) {\n  // Write solution\n}');
  const [testCases, setTestCases] = useState([
    { input: 'solution([1, 2, 3])', expected_output: '[3, 2, 1]' },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expected_output: '' }]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const autoTitle = title.trim() || markdown.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 45) || 'Crash & Fix Question';

    setIsSaving(true);
    const qRecord: Record<string, any> = {
      id: crypto.randomUUID(),
      title: autoTitle,
      description: markdown,
      content_markdown: markdown,
      type: 'Crash & Fix',
      language: 'JavaScript',
      difficulty: 'Hard',
      round: 'Round 3: Crash & Fix',
      points: 50,
      buggy_code: initialCode,
      reference_solution: initialCode,
      test_cases: testCases,
      status: 'PUBLISHED',
      updated_at: new Date().toISOString()
    };

    let activePayload = { ...qRecord };
    let { error } = await supabase.from('questions').upsert(activePayload).select();

    if (error && error.message && error.message.includes("invalid input syntax for type uuid")) {
      activePayload.id = crypto.randomUUID();
      const retryRes = await supabase.from('questions').upsert(activePayload).select();
      error = retryRes.error;
    }

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
    alert('Crash & Fix Question saved and persisted to Supabase database successfully!');
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
              <Terminal className="h-5 w-5 text-cyan-400" />
              Coding Challenge Authoring Builder
            </h1>
            <p className="text-xs text-slate-400">Author coding tasks with automated test case evaluation</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow transition-all"
        >
          <Save className="h-4 w-4" /> Save Coding Question
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Challenge Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Reverse Array In Place"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Problem Description (Markdown)</label>
          <textarea
            required
            rows={4}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Describe input/output constraints..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Initial Candidate Code Template</label>
          <textarea
            required
            rows={5}
            value={initialCode}
            onChange={(e) => setInitialCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Test Cases */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Evaluation Test Matrix</h4>
            <button
              type="button"
              onClick={addTestCase}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Add Test Case
            </button>
          </div>

          {testCases.map((tc, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs">
              <input
                type="text"
                value={tc.input}
                onChange={(e) => {
                  const next = [...testCases];
                  next[idx].input = e.target.value;
                  setTestCases(next);
                }}
                placeholder="Input expression e.g. solution([1, 2])"
                className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
              />
              <input
                type="text"
                value={tc.expected_output}
                onChange={(e) => {
                  const next = [...testCases];
                  next[idx].expected_output = e.target.value;
                  setTestCases(next);
                }}
                placeholder="Expected JSON output e.g. [2, 1]"
                className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-emerald-400"
              />
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
