'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  MOCK_EVENT, 
  MOCK_ROUNDS,
  supabase 
} from '@/lib/supabase';
import { AntiCheatMonitor, AntiCheatIncident } from '@/lib/anticheat';
import { evaluateCodeSubmission, EvaluationResult } from '@/lib/evaluator';
import { formatSeconds } from '@/lib/utils';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Check, 
  Terminal, 
  Code2, 
  Zap, 
  FileText,
  Send,
  Lock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ExamArena() {
  const [activeRoundIndex, setActiveRoundIndex] = useState<number>(0);
  
  // Timer State (45 mins countdown)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [isExamActive, setIsExamActive] = useState<boolean>(true);

  // Live Supabase Questions State
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [debugQuestion, setDebugQuestion] = useState<any>(null);
  const [crashQuestion, setCrashQuestion] = useState<any>(null);

  // MCQ Selection State
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  
  // Code Editor States
  const [debugCode, setDebugCode] = useState<string>('');
  const [debugResult, setDebugResult] = useState<EvaluationResult | null>(null);
  
  const [crashCode, setCrashCode] = useState<string>('');
  const [crashResult, setCrashResult] = useState<EvaluationResult | null>(null);

  // Anti-Cheat Telemetry State
  const [incidents, setIncidents] = useState<AntiCheatIncident[]>([]);
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [latestIncident, setLatestIncident] = useState<AntiCheatIncident | null>(null);

  const fetchPublishedQuestions = async () => {
    try {
      const { data } = await supabase.from('questions').select('*');
      if (data) {
        const published = data.filter((q: any) => q.status === 'PUBLISHED' || q.status === 'Published');
        
        // MCQ Questions
        const mcqs = published.filter((q: any) => q.type === 'MCQ' || q.round_id === 'round-1');
        const mappedMcqs = mcqs.map((q: any) => ({
          id: q.id,
          title: q.title,
          content_markdown: q.content_markdown || q.description || '',
          points: q.points || q.marks || 10,
          negative_points: q.negative_points || q.negativeMarks || 0,
          options: (q.mcq_options || q.mcqOptions || []).map((o: any) => ({
            id: o.id || `opt-${o.text}`,
            option_text: o.text || o.option_text || ''
          }))
        }));
        setMcqQuestions(mappedMcqs);

        // Debugging Question
        const debugs = published.filter((q: any) => q.type === 'Debugging' || q.round_id === 'round-2');
        if (debugs.length > 0) {
          const dq = debugs[0];
          setDebugQuestion({
            id: dq.id,
            title: dq.title,
            content_markdown: dq.content_markdown || dq.description || '',
            points: dq.points || dq.marks || 40,
            coding: {
              initial_code: dq.reference_solution || dq.referenceSolution || '',
              test_cases: [
                { input: 'twoSum([2, 7, 11, 15], 9)', expected_output: '[0,1]' },
                { input: 'twoSum([3, 2, 4], 6)', expected_output: '[1,2]' }
              ]
            }
          });
          setDebugCode(dq.reference_solution || dq.referenceSolution || '');
        } else {
          setDebugQuestion(null);
        }

        // Crash Question
        const crashes = published.filter((q: any) => q.type === 'Crash & Fix' || q.round_id === 'round-3');
        if (crashes.length > 0) {
          const cq = crashes[0];
          setCrashQuestion({
            id: cq.id,
            title: cq.title,
            content_markdown: cq.content_markdown || cq.description || '',
            points: cq.points || cq.marks || 50,
            coding: {
              initial_code: cq.reference_solution || cq.referenceSolution || '',
              test_cases: [
                { input: 'maxDepth(node)', expected_output: '0' }
              ]
            }
          });
          setCrashCode(cq.reference_solution || cq.referenceSolution || '');
        } else {
          setCrashQuestion(null);
        }
      }
    } catch (err) {
      console.error('Error fetching exam arena questions:', err);
    }
  };

  useEffect(() => {
    fetchPublishedQuestions();

    const channel = supabase
      .channel('realtime_exam_arena')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => fetchPublishedQuestions())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize Anti-Cheat Sensors
  useEffect(() => {
    const monitor = new AntiCheatMonitor((incident) => {
      setIncidents((prev) => {
        const next = [incident, ...prev];
        if (next.length >= 4) {
          setIsDisqualified(true);
        }
        return next;
      });
      setLatestIncident(incident);
      setShowWarningModal(true);
    });

    monitor.start();
    return () => monitor.stop();
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isExamActive || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsExamActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, secondsRemaining]);

  // Code Evaluation Handler
  const handleRunDebugCode = () => {
    if (!debugQuestion) return;
    const res = evaluateCodeSubmission(debugCode, debugQuestion.coding.test_cases, debugQuestion.points);
    setDebugResult(res);
  };

  const handleRunCrashCode = () => {
    if (!crashQuestion) return;
    const res = evaluateCodeSubmission(crashCode, crashQuestion.coding.test_cases, crashQuestion.points);
    setCrashResult(res);
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setMcqAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP LIVE TIMER & EXAMINATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Terminal className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              {MOCK_EVENT.title}
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                LIVE ARENA
              </span>
            </h1>
            <p className="text-xs text-slate-400">Candidate: Alex Chen (MIT-2026-942)</p>
          </div>
        </div>

        {/* Sync Timer Display */}
        <div className="flex items-center gap-6">
          
          {/* Anti-Cheat Counter Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <ShieldAlert className={`h-4 w-4 ${incidents.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-xs font-mono">
              Anti-Cheat Flags: <strong className={incidents.length >= 3 ? 'text-red-400' : 'text-white'}>{incidents.length}/3</strong>
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 shadow-inner">
            <Clock className="h-4 w-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-mono font-bold text-lg text-indigo-300">
              {formatSeconds(secondsRemaining)}
            </span>
          </div>

          {/* Finish & Submit Button */}
          <Link
            href="/summary"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            Finish & Submit
          </Link>

        </div>
      </header>

      {/* 2. DISQUALIFICATION OVERLAY LOCK */}
      {isDisqualified && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-8 shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Session Disqualified</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Multiple tab switches and window blur violations were detected by the Anti-Cheat Engine. Your examination session has been terminated and reported to event organizers.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              Return to Platform Home
            </Link>
          </div>
        </div>
      )}

      {/* 3. ROUND NAVIGATION TABS */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 flex items-center gap-2">
        {MOCK_ROUNDS.map((round, idx) => {
          const isActive = activeRoundIndex === idx;
          return (
            <button
              key={round.id}
              onClick={() => setActiveRoundIndex(idx)}
              className={`flex items-center gap-2.5 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx === 0 && <Zap className="h-4 w-4 text-indigo-400" />}
              {idx === 1 && <Code2 className="h-4 w-4 text-cyan-400" />}
              {idx === 2 && <Terminal className="h-4 w-4 text-purple-400" />}
              {round.title}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN EXAMINATION CONTENT ARENA */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 gap-6">
        
        {/* ROUND 1: MCQ VIEW */}
        {activeRoundIndex === 0 && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">Round Instructions</h3>
              <p className="text-xs text-slate-400">{MOCK_ROUNDS[0].instructions}</p>
            </div>

            {mcqQuestions.length === 0 ? (
              <div className="bg-slate-900 border border-dashed border-slate-800 p-12 rounded-2xl text-center space-y-3 font-mono text-sm text-slate-400">
                <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                <div className="font-bold text-slate-200">No published questions are available for this round.</div>
              </div>
            ) : (
              mcqQuestions.map((q, qIdx) => (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-indigo-400 font-semibold">QUESTION {qIdx + 1} OF {mcqQuestions.length}</span>
                    <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/20">
                      +{q.points} PTS / -{q.negative_points} PTS
                    </span>
                  </div>

                  <h4 className="text-base font-medium text-white">{q.title}</h4>
                  <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 border border-slate-800">
                    {q.content_markdown}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt: any) => {
                      const isSelected = mcqAnswers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(q.id, opt.id)}
                          className={`p-4 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{opt.option_text}</span>
                          {isSelected && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ROUND 2: DEBUGGING ARENA */}
        {activeRoundIndex === 1 && (
          !debugQuestion ? (
            <div className="bg-slate-900 border border-dashed border-slate-800 p-12 rounded-2xl text-center space-y-3 font-mono text-sm text-slate-400">
              <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
              <div className="font-bold text-slate-200">No published questions are available for this round.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Problem Statement & Test Matrix */}
              <div className="space-y-4 flex flex-col">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">{debugQuestion.title}</h3>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                      +{debugQuestion.points} POINTS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{debugQuestion.content_markdown}</p>
                </div>

              {/* Test Cases Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Target Test Matrix</h4>
                <div className="space-y-2 flex-1">
                  {debugQuestion.coding.test_cases.map((tc: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                      <div className="text-slate-400">Input: <span className="text-slate-200">{tc.input}</span></div>
                      <div className="text-slate-400">Expected: <span className="text-emerald-400">{tc.expected_output}</span></div>
                    </div>
                  ))}
                </div>

                {/* Execution Results View */}
                {debugResult && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={debugResult.status === 'PASSED' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        STATUS: {debugResult.status}
                      </span>
                      <span className="text-slate-400">Score: {debugResult.score}/{debugQuestion.points} pts ({debugResult.execution_time_ms}ms)</span>
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {debugResult.test_results.map((tr, idx) => (
                        <div key={idx} className={`p-2 rounded text-[11px] font-mono border ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                          {tr.passed ? '✓ Test Passed' : `✗ Failed: Expected ${tr.expected}, Got ${tr.actual}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Code Editor Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
              <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">solution.js (JavaScript)</span>
                <button
                  onClick={handleRunDebugCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run & Validate Code
                </button>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={debugCode}
                  onChange={(val) => setDebugCode(val || '')}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    tabSize: 2
                  }}
                />
              </div>
            </div>

          </div>
        ))}

        {/* ROUND 3: CRASH & FIX ARENA */}
        {activeRoundIndex === 2 && (
          !crashQuestion ? (
            <div className="bg-slate-900 border border-dashed border-slate-800 p-12 rounded-2xl text-center space-y-3 font-mono text-sm text-slate-400">
              <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
              <div className="font-bold text-slate-200">No published questions are available for this round.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Problem & Target Crash Patch */}
              <div className="space-y-4 flex flex-col">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">{crashQuestion.title}</h3>
                    <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
                      +{crashQuestion.points} POINTS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{crashQuestion.content_markdown}</p>
                </div>

                {/* Target Diff View */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required Patch Diff Target</h4>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400">
                    + if (!node) return 0;
                  </div>

                {crashResult && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={crashResult.status === 'PASSED' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        CRASH STATUS: {crashResult.status}
                      </span>
                      <span className="text-slate-400">Score: {crashResult.score}/{crashQuestion.points} pts</span>
                    </div>

                    <div className="space-y-1">
                      {crashResult.test_results.map((tr, idx) => (
                        <div key={idx} className={`p-2 rounded text-[11px] font-mono border ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                          {tr.passed ? '✓ Crash Resolved' : `✗ Crash Occurred: ${tr.actual}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Crash Editor Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
              <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">crash_patch.js (JavaScript)</span>
                <button
                  onClick={handleRunCrashCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Test Crash Patch
                </button>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={crashCode}
                  onChange={(val) => setCrashCode(val || '')}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    tabSize: 2
                  }}
                />
              </div>
            </div>

          </div>
        ))}

      </main>

      {/* 5. ANTI-CHEAT WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-bold text-base text-white">Anti-Cheat Incident Logged</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              An unauthorized event (<strong className="text-amber-300">{latestIncident?.incident_type}</strong>) was detected. Incident details have been logged to the server telemetry engine.
            </p>
            <div className="bg-slate-950 p-3 rounded text-xs font-mono text-slate-400">
              Incident Count: {incidents.length} / 4 Allowed
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all"
            >
              Acknowledge & Resume Exam
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
