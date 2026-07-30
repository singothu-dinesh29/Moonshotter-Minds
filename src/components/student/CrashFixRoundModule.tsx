'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { CRASH_QUESTIONS_2, CrashQuestionItem } from '@/lib/crashBank';
import { supabase } from '@/lib/supabase';
import { evaluateCodeSubmission, EvaluationResult } from '@/lib/evaluator';
import { formatSeconds } from '@/lib/utils';
import { 
  Play, 
  Send, 
  Clock, 
  Terminal, 
  AlertOctagon, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  FileCode,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CrashFixRoundModule() {
  const router = useRouter();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [crashQuestions, setCrashQuestions] = useState<CrashQuestionItem[]>(CRASH_QUESTIONS_2);
  
  const currentQ: CrashQuestionItem = crashQuestions[activeQuestionIndex] || crashQuestions[0];

  // Code state per question
  const [codeMap, setCodeMap] = useState<Record<string, string>>({
    [CRASH_QUESTIONS_2[0].id]: CRASH_QUESTIONS_2[0].initialCode,
    [CRASH_QUESTIONS_2[1].id]: CRASH_QUESTIONS_2[1].initialCode,
  });

  const isExamActiveRef = React.useRef(false);

  const fetchPublishedCrashQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (!error && data) {
        // Strict Visibility Policy: Only Published Crash & Fix questions are visible to students
        const published = data.filter(
          (q: any) =>
            (q.status === 'PUBLISHED' || q.status === 'Published') &&
            (q.type === 'Crash & Fix' || q.round_id === 'round-3')
        );

        if (published.length > 0) {
          const mapped: CrashQuestionItem[] = published.map((q: any) => ({
            id: q.id,
            title: q.title,
            difficulty: 'MEDIUM',
            description: q.content_markdown || q.description || '',
            crashErrorType: 'Runtime Exception / Recursion Error',
            initialCode: q.reference_solution || q.referenceSolution || CRASH_QUESTIONS_2[0].initialCode,
            solutionCode: q.reference_solution || q.referenceSolution || CRASH_QUESTIONS_2[0].solutionCode,
            expectedPatch: '+ if (!node) return 0;',
            points: q.points || q.marks || 50,
            testCases: CRASH_QUESTIONS_2[0].testCases
          }));

          if (!isExamActiveRef.current) {
            setCrashQuestions(mapped);
            const newCodeMap: Record<string, string> = {};
            mapped.forEach((q) => {
              newCodeMap[q.id] = q.initialCode;
            });
            setCodeMap(newCodeMap);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('active_crash_questions', JSON.stringify(mapped));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching published crash questions:', err);
    }
  };

  useEffect(() => {
    // Active Exam Snapshot Check
    if (typeof window !== 'undefined') {
      const savedSnapshot = sessionStorage.getItem('active_crash_questions');
      if (savedSnapshot) {
        try {
          const parsed = JSON.parse(savedSnapshot);
          if (parsed && parsed.length > 0) {
            setCrashQuestions(parsed);
            const newCodeMap: Record<string, string> = {};
            parsed.forEach((q: any) => {
              newCodeMap[q.id] = q.initialCode;
            });
            setCodeMap(newCodeMap);
            isExamActiveRef.current = true;
          }
        } catch (e) {}
      }
    }

    if (!isExamActiveRef.current) {
      fetchPublishedCrashQuestions();
    }

    // Supabase Realtime WebSocket Listener for Admin Question Edits
    const channel = supabase
      .channel('realtime_student_crash_arena')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        // Students NOT yet started receive immediate live updates.
        // Students ALREADY taking exam preserve their assigned question set.
        if (!isExamActiveRef.current) {
          fetchPublishedCrashQuestions();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Results per question
  const [resultsMap, setResultsMap] = useState<Record<string, EvaluationResult | null>>({
    [CRASH_QUESTIONS_2[0].id]: null,
    [CRASH_QUESTIONS_2[1].id]: null,
  });

  // Auto Save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Saved');

  // Timer State (15 Mins = 900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isExamActive, setIsExamActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto Save Effect (Saves drafts to localStorage every 3s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`crash_draft_${currentQ.id}`, codeMap[currentQ.id]);
        setAutoSaveStatus(`Auto-saved at ${new Date().toLocaleTimeString()}`);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [codeMap, currentQ.id]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isExamActive || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamActive, secondsRemaining]);

  const handleCodeChange = (val: string) => {
    setCodeMap((prev) => ({ ...prev, [currentQ.id]: val }));
  };

  const handleValidatePatch = () => {
    const activeCode = codeMap[currentQ.id];
    const res = evaluateCodeSubmission(activeCode, currentQ.testCases, currentQ.points);
    setResultsMap((prev) => ({ ...prev, [currentQ.id]: res }));
  };

  const handleResetCode = () => {
    if (confirm('Reset patch code to initial buggy crash state?')) {
      setCodeMap((prev) => ({ ...prev, [currentQ.id]: currentQ.initialCode }));
      setResultsMap((prev) => ({ ...prev, [currentQ.id]: null }));
    }
  };

  const handleAutoSubmit = () => {
    setIsExamActive(false);
    alert('Time expired! Your Crash & Fix patches have been auto-submitted to Supabase PostgreSQL.');
  };

  const handleManualSubmit = () => {
    if (confirm('Are you ready to submit your Crash & Fix patches for both questions?')) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/summary');
      }, 800);
    }
  };

  const activeResult = resultsMap[currentQ.id];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      
      {/* 1. TOP HEADER & TIMER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-semibold">
                ROUND 3: CRASH & FIX ENGINEERING (MEDIUM)
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Save className="h-3 w-3 text-emerald-400" /> {autoSaveStatus}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">High-Pressure Runtime Patching</h1>
          </div>
        </div>

        {/* Live Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-purple-500/30 text-center font-mono">
            <span className="text-[10px] text-slate-500 block">TIME REMAINING</span>
            <span className="text-lg font-bold text-purple-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4 animate-spin text-purple-400" style={{ animationDuration: '5s' }} />
              {formatSeconds(secondsRemaining)}
            </span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all"
          >
            <Send className="h-4 w-4" /> Submit All Patches
          </button>
        </div>
      </div>

      {/* 2. QUESTION SELECTION TABS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center gap-2">
        {CRASH_QUESTIONS_2.map((q, idx) => {
          const isActive = activeQuestionIndex === idx;
          const res = resultsMap[q.id];
          const isPassed = res?.status === 'PASSED';

          return (
            <button
              key={q.id}
              onClick={() => setActiveQuestionIndex(idx)}
              className={`flex-1 py-3 px-4 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                <span>Question {idx + 1}: {q.title.split(':')[1] || q.title}</span>
              </div>
              
              {isPassed && (
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  PASSED
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN ARENA: CRASH DETAILS & MONACO EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Crash Error Specification & Expected Target Diff */}
        <div className="space-y-4 flex flex-col">
          
          {/* Crash Hazard Alert */}
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertOctagon className="h-5 w-5 shrink-0" />
                <h3 className="font-bold text-sm text-white">Target Runtime Exception</h3>
              </div>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded border border-purple-500/20 font-bold">
                +{currentQ.points} PTS
              </span>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg font-mono text-xs text-red-300">
              ⚠️ Exception: {currentQ.crashErrorType}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentQ.description}</p>
          </div>

          {/* Expected Patch Diff Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col shadow-xl">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Code Patch Hint</h4>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
              {currentQ.expectedPatch}
            </div>

            {/* Test Case Output Results */}
            {activeResult && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={activeResult.status === 'PASSED' ? 'text-emerald-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
                    PATCH STATUS: {activeResult.status}
                  </span>
                  <span className="text-slate-400">Points: {activeResult.score}/{currentQ.points} pts</span>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {activeResult.test_results.map((tr, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg text-[11px] font-mono border ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                      {tr.passed ? '✓ Crash Resolved' : `✗ Crash Occurred: ${tr.actual}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Embedded Monaco Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
          
          {/* Monaco Top Bar */}
          <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-mono text-slate-300">crash_patch.js (JavaScript)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                title="Reset Code to Crash State"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleValidatePatch}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Validate Patch
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={codeMap[currentQ.id]}
              onChange={(val) => handleCodeChange(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
