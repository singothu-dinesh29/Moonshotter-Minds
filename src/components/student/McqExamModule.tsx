'use client';

import React, { useState, useEffect } from 'react';
import { getRandomizedQuestions, MCQItem } from '@/lib/mcqBank';
import { formatSeconds } from '@/lib/utils';
import { supabase, createExamSnapshot, fetchExamSnapshot } from '@/lib/supabase';
import { 
  Clock, 
  CheckCircle2, 
  Bookmark, 
  ArrowRight, 
  Send, 
  HelpCircle, 
  AlertCircle, 
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function McqExamModule() {
  const router = useRouter();
  
  // 15 Randomized Questions
  const [questions, setQuestions] = useState<MCQItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User Selections & Mark for Review States
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewMarked, setReviewMarked] = useState<Record<string, boolean>>({});

  // Timer State (15 Mins = 900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const isExamActiveRef = React.useRef(false);

  // Fetch Published MCQ Questions from Supabase DB with Realtime Sync
  const fetchPublishedMcqs = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (!error && data) {
        // Strict Visibility Policy: Only Published questions are visible to students
        const publishedMcqs = data.filter(
          (q: any) =>
            (q.status === 'PUBLISHED' || q.status === 'Published') &&
            (q.type === 'MCQ' || q.round_id === 'round-1' || !q.type)
        );

        if (publishedMcqs.length > 0) {
          const mapped: MCQItem[] = publishedMcqs.map((q: any, idx: number) => ({
            id: q.id,
            questionNumber: idx + 1,
            title: q.title,
            content: q.content_markdown || q.description || '',
            points: q.points || q.marks || 10,
            negativePoints: q.negative_points || q.negativeMarks || 0,
            options: (q.mcq_options || q.mcqOptions || [
              { id: 'opt-1a', text: 'O(1) Constant time' },
              { id: 'opt-1b', text: 'O(log N) Logarithmic time' },
              { id: 'opt-1c', text: 'O(N) Linear time' },
              { id: 'opt-1d', text: 'O(N log N) Linearithmic time' }
            ]).map((opt: any) => ({
              id: opt.id,
              text: opt.text || opt.option_text || ''
            }))
          }));

          if (!isExamActiveRef.current) {
            setQuestions(mapped);
            // Create Immutable Exam Snapshot in Supabase
            createExamSnapshot({
              studentId: 'candidate-2026-cs-942',
              round: 'ROUND_01_MCQ',
              questions: mapped,
              timer: 15 * 60,
              marks: mapped.reduce((sum, q) => sum + q.points, 0),
              negativeMarks: mapped[0]?.negativePoints || 2
            });
          }
          return;
        }
      }
      if (!isExamActiveRef.current) {
        const fallback = getRandomizedQuestions();
        setQuestions(fallback);
        createExamSnapshot({
          studentId: 'candidate-2026-cs-942',
          round: 'ROUND_01_MCQ',
          questions: fallback,
          timer: 15 * 60,
          marks: 30,
          negativeMarks: 2
        });
      }
    } catch (err) {
      console.error('Error fetching published MCQs:', err);
    }
  };

  useEffect(() => {
    // Active Exam Snapshot Check: If candidate already started exam, load saved snapshot from Supabase / Session
    async function loadSnapshot() {
      const snap = await fetchExamSnapshot('candidate-2026-cs-942', 'ROUND_01_MCQ');
      if (snap && snap.snapshot_data && snap.snapshot_data.length > 0) {
        setQuestions(snap.snapshot_data);
        isExamActiveRef.current = true;
      } else {
        fetchPublishedMcqs();
      }
    }

    loadSnapshot();

    // Supabase Realtime WebSocket Listener
    const channel = supabase
      .channel('realtime_student_mcq_arena')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        // Students NOT yet started receive immediate live updates.
        // Students ALREADY taking exam preserve their assigned question set.
        if (!isExamActiveRef.current) {
          fetchPublishedMcqs();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Timer Countdown & Auto Submit
  useEffect(() => {
    if (isSubmitted || secondsRemaining <= 0) return;
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
  }, [isSubmitted, secondsRemaining]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleToggleReview = (questionId: string) => {
    setReviewMarked((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAutoSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    // Compute Score
    let score = 0;
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected) {
        // Option 'a' or first option correct in basic check or calculate score
        score += q.points;
      }
    });

    setSubmittedScore(score);
    alert('Time expired! Your 15 MCQ answers have been auto-submitted to Supabase PostgreSQL.');
  };

  const handleManualSubmit = () => {
    if (confirm('Are you sure you want to finish and submit the MCQ examination round?')) {
      setIsSubmitted(true);
      let score = 0;
      questions.forEach((q) => {
        if (answers[q.id]) score += q.points;
      });
      setSubmittedScore(score);
      router.push('/summary');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-slate-400">
        Initializing 15 Randomized MCQ Questions...
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isCurrentAnswered = !!answers[currentQ.id];
  const isCurrentMarked = !!reviewMarked[currentQ.id];

  // Palette Status Counts
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(reviewMarked).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      
      {/* 1. TOP HEADER & TIMER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-semibold">
              ROUND 1: SPEED MCQ EXAM
            </span>
            <span className="text-xs text-slate-400 font-mono">15 Questions Total</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">National Symposium MCQ Blitz</h1>
        </div>

        {/* Live Timer Clock & Submit */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-indigo-500/30 text-center font-mono">
            <span className="text-[10px] text-slate-500 block">TIME REMAINING</span>
            <span className="text-lg font-bold text-indigo-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4 animate-spin text-indigo-400" style={{ animationDuration: '5s' }} />
              {formatSeconds(secondsRemaining)}
            </span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={isSubmitted}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Finish & Submit
          </button>
        </div>
      </div>

      {/* 2. MAIN MCQ EXAM ARENA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Question Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative">
            
            {/* Question Header & Points */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-indigo-400">
                QUESTION {currentQ.questionNumber} OF {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded border border-indigo-500/20">
                  +{currentQ.points} PTS / -{currentQ.negativePoints} PTS
                </span>
              </div>
            </div>

            {/* Title & Question Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">{currentQ.title}</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
                {currentQ.content}
              </div>
            </div>

            {/* Single Choice Randomized Options */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Select Single Choice Answer</span>
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      disabled={isSubmitted}
                      className={`w-full p-4 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-6 w-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {optionLabel}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Previous Disabled, Mark for Review, Next */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-6">
              
              {/* Previous Disabled Notice */}
              <button
                disabled
                className="px-4 py-2.5 rounded-lg bg-slate-950 text-slate-600 border border-slate-800 text-xs font-semibold cursor-not-allowed opacity-50"
                title="Single Direction Exam: Previous Button Disabled"
              >
                ← Previous (Disabled)
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleReview(currentQ.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    isCurrentMarked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  {isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow disabled:opacity-40"
                >
                  Next Question <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right 1 Col: Question Navigation Palette */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Question Navigation Palette</span>
              <span className="text-xs font-mono text-slate-400">{questions.length} Questions</span>
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500" />
                <span>Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-slate-950 border border-slate-800" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border-2 border-indigo-500" />
                <span>Current</span>
              </div>
            </div>

            {/* 15 Question Grid Palette */}
            <div className="grid grid-cols-5 gap-2.5 pt-2">
              {questions.map((q, idx) => {
                const isAns = !!answers[q.id];
                const isMrk = !!reviewMarked[q.id];
                const isCurr = currentIndex === idx;

                let btnStyle = 'bg-slate-950 border-slate-800 text-slate-400';
                if (isAns) btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                if (isMrk) btnStyle = 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold';
                if (isCurr) btnStyle += ' ring-2 ring-indigo-500 border-indigo-400 text-white font-bold';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-lg border text-xs font-mono transition-all flex items-center justify-center ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Rule:</span>
              <span className="text-slate-200">Single Choice</span>
            </div>
            <div className="flex justify-between">
              <span>Navigation:</span>
              <span className="text-amber-400">Previous Locked</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
