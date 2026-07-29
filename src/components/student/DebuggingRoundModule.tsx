'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { MOCK_DEBUG_QUESTION } from '@/lib/supabase';
import { evaluateCodeSubmission, EvaluationResult } from '@/lib/evaluator';
import { formatSeconds } from '@/lib/utils';
import { 
  Play, 
  Send, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Code2, 
  Terminal, 
  Lock, 
  Save,
  RotateCcw,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DebuggingRoundModule() {
  const router = useRouter();

  // Admin-Defined Question Specifications
  const questionSpec = MOCK_DEBUG_QUESTION;
  const [code, setCode] = useState<string>(questionSpec.coding.initial_code);
  const [language, setLanguage] = useState<string>(questionSpec.coding.language || 'javascript');

  // Evaluation & Execution State
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Saved');

  // Timer State (15 Mins = 900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isExamActive, setIsExamActive] = useState<boolean>(true);

  // Anti-Cheat Security Violation Alerts
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // 1. Auto-Save Effect (Saves code to localStorage draft every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`debug_draft_${questionSpec.id}`, code);
        setAutoSaveStatus(`Auto-saved at ${new Date().toLocaleTimeString()}`);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [code, questionSpec.id]);

  // 2. Anti-Cheat Event Listeners (Copy, Paste, Right Click Lock)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarningMessage('Right-click context menu is locked during Debugging Round.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setWarningMessage('Pasting external code into Monaco Editor is locked for anti-cheat integrity.');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setWarningMessage('Copying question text or code snippets is locked.');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  // 3. Timer Countdown & Auto Submit
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

  const handleRunValidation = () => {
    const result = evaluateCodeSubmission(code, questionSpec.coding.test_cases, questionSpec.points);
    setEvaluationResult(result);
  };

  const handleResetCode = () => {
    if (confirm('Reset code to initial buggy starter template?')) {
      setCode(questionSpec.coding.initial_code);
      setEvaluationResult(null);
    }
  };

  const handleAutoSubmit = () => {
    setIsExamActive(false);
    const result = evaluateCodeSubmission(code, questionSpec.coding.test_cases, questionSpec.points);
    setEvaluationResult(result);
    alert('Time expired! Your debugged code has been auto-submitted to Supabase PostgreSQL.');
  };

  const handleManualSubmit = () => {
    if (confirm('Are you ready to submit your debugged code solution?')) {
      setIsSubmitting(true);
      const result = evaluateCodeSubmission(code, questionSpec.coding.test_cases, questionSpec.points);
      setEvaluationResult(result);
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/summary');
      }, 800);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      
      {/* 1. TOP HEADER & TIMER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-semibold">
                ROUND 2: ALGORITHMIC DEBUGGING
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Save className="h-3 w-3 text-emerald-400" /> {autoSaveStatus}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">{questionSpec.title}</h1>
          </div>
        </div>

        {/* Live Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-cyan-500/30 text-center font-mono">
            <span className="text-[10px] text-slate-500 block">TIME REMAINING</span>
            <span className="text-lg font-bold text-cyan-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4 animate-spin text-cyan-400" style={{ animationDuration: '5s' }} />
              {formatSeconds(secondsRemaining)}
            </span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Send className="h-4 w-4" /> Submit Code Solution
          </button>
        </div>
      </div>

      {/* 2. ANTI-CHEAT SECURITY LOCK ALERT BANNER */}
      {warningMessage && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between text-xs text-amber-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>SECURITY WARNING: {warningMessage}</span>
          </div>
          <button onClick={() => setWarningMessage(null)} className="text-amber-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 3. MAIN ARENA: ADMIN SPECS & MONACO EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Admin Defined Problem Statement & Test Matrix */}
        <div className="space-y-4 flex flex-col">
          
          {/* Question Markdown Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Problem Statement & Bug Details</h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded border border-cyan-500/20">
                +{questionSpec.points} POINTS
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{questionSpec.content_markdown}</p>
          </div>

          {/* Admin Defined Expected Output Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col shadow-xl">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" /> Expected Test Output Matrix
            </h4>

            <div className="space-y-2.5 flex-1">
              {questionSpec.coding.test_cases.map((tc: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-slate-400">Test Input #{idx + 1}: <span className="text-slate-200">{tc.input}</span></div>
                  <div className="text-slate-400">Expected Output: <span className="text-emerald-400 font-bold">{tc.expected_output}</span></div>
                </div>
              ))}
            </div>

            {/* Test Execution Output Results */}
            {evaluationResult && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={evaluationResult.status === 'PASSED' ? 'text-emerald-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
                    STATUS: {evaluationResult.status}
                  </span>
                  <span className="text-slate-400">Score: {evaluationResult.score}/{questionSpec.points} pts ({evaluationResult.execution_time_ms}ms)</span>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {evaluationResult.test_results.map((tr, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg text-[11px] font-mono border ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                      {tr.passed ? '✓ Test Passed' : `✗ Failed: Expected ${tr.expected}, Got ${tr.actual}`}
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
              <FileCode className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono text-slate-300">solution.js (JavaScript)</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Copy/Paste Disabled
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                title="Reset Code to Template"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleRunValidation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Validate Test Matrix
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 2,
                contextmenu: false, // Disables right-click menu inside Monaco
                wordWrap: 'on'
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
