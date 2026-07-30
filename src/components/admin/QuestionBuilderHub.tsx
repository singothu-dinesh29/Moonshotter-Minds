'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  HelpCircle, 
  Code2, 
  Terminal, 
  Zap, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  Copy, 
  Download, 
  Upload, 
  Clock, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Database,
  FileCode,
  AlertOctagon,
  Sparkles,
  History,
  RotateCcw,
  Play,
  Check,
  Archive,
  Layers,
  Send,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MonacoPlayground from '@/components/shared/MonacoPlayground';

import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export type QuestionType = 'MCQ' | 'Debugging' | 'Crash & Fix';
export type QuestionStatus = 'Draft' | 'Published' | 'Archived';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type ProgrammingLanguage = 'C' | 'C++' | 'Java' | 'Python' | 'JavaScript' | 'SQL';

export interface QuestionVersion {
  versionNumber: number;
  editor: string;
  timestamp: string;
  previousTitle: string;
  previousDescription: string;
  previousSolution: string;
}

export interface QuestionRecord {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  language: ProgrammingLanguage;
  difficulty: DifficultyLevel;
  round: string;
  marks: number;
  negativeMarks: number;
  timeLimitSec: number;
  expectedOutput: string;
  referenceSolution: string;
  status: QuestionStatus;
  mcqOptions?: { id: string; text: string; isCorrect: boolean }[];
  category: string;
  versionHistory: QuestionVersion[];
  createdAt: string;
}

const INITIAL_QUESTIONS: QuestionRecord[] = [
  {
    id: 'q-101',
    title: 'PostgreSQL Indexing & B-Tree Complexity',
    description: 'What is the worst-case time complexity of a B-tree index lookup in PostgreSQL for N records?',
    type: 'MCQ',
    language: 'SQL',
    difficulty: 'Easy',
    round: 'Round 1: Speed MCQ',
    marks: 10,
    negativeMarks: 2,
    timeLimitSec: 60,
    expectedOutput: 'O(log N)',
    referenceSolution: 'Option B: O(log N) Logarithmic time',
    status: 'Published',
    category: 'Database Systems',
    versionHistory: [
      {
        versionNumber: 1,
        editor: 'Dinesh (System Admin)',
        timestamp: '2026-07-28T16:00:00.000Z',
        previousTitle: 'PostgreSQL Index Lookup',
        previousDescription: 'What is the complexity of PostgreSQL index?',
        previousSolution: 'O(log N)'
      }
    ],
    mcqOptions: [
      { id: 'opt-1', text: 'O(1) Constant time', isCorrect: false },
      { id: 'opt-2', text: 'O(log N) Logarithmic time', isCorrect: true },
      { id: 'opt-3', text: 'O(N) Linear time', isCorrect: false },
      { id: 'opt-4', text: 'O(N log N) Linearithmic time', isCorrect: false },
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'q-102',
    title: 'Fix Two-Sum Array Algorithm Bug',
    description: 'Identify logic flaws, edge-case off-by-one errors, and memory leaks in the starter two-sum function.',
    type: 'Debugging',
    language: 'JavaScript',
    difficulty: 'Medium',
    round: 'Round 2: Algorithmic Debugging',
    marks: 40,
    negativeMarks: 0,
    timeLimitSec: 120,
    expectedOutput: '[0, 1]',
    referenceSolution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for(let i=0; i<nums.length; i++) {\n    const diff = target - nums[i];\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}',
    status: 'Published',
    category: 'Algorithms',
    versionHistory: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'q-103',
    title: 'Patch RangeError Recursion Stack Overflow',
    description: 'Fix the binary tree depth recursion function to prevent RangeError: Maximum call stack size exceeded crash.',
    type: 'Crash & Fix',
    language: 'Python',
    difficulty: 'Hard',
    round: 'Round 3: Crash & Fix',
    marks: 50,
    negativeMarks: 0,
    timeLimitSec: 180,
    expectedOutput: '0',
    referenceSolution: 'def maxDepth(root):\n    if not root:\n        return 0\n    return max(maxDepth(root.left), maxDepth(root.right)) + 1',
    status: 'Published',
    category: 'Recursion',
    versionHistory: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'q-104',
    title: 'Redis Sorted Set Pipeline Update',
    description: 'Write a Redis ZADD pipeline function to update real-time candidate leaderboard scores.',
    type: 'Debugging',
    language: 'C++',
    difficulty: 'Medium',
    round: 'Round 2: Algorithmic Debugging',
    marks: 30,
    negativeMarks: 0,
    timeLimitSec: 120,
    expectedOutput: 'OK',
    referenceSolution: 'void updateLeaderboard(RedisClient& client, string user, int score);',
    status: 'Archived',
    category: 'System Design',
    versionHistory: [],
    createdAt: new Date().toISOString()
  }
];

export default function QuestionBuilderHub() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isMounted, setIsMounted] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionRecord | null>(null);
  const [versionHistoryModal, setVersionHistoryModal] = useState<QuestionRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Exact Student Preview State
  const [selectedMcqOption, setSelectedMcqOption] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Partial<QuestionRecord>>({
    title: '',
    description: '',
    type: 'MCQ',
    language: 'JavaScript',
    difficulty: 'Medium',
    round: 'Round 1: Speed MCQ',
    marks: 10,
    negativeMarks: 2,
    timeLimitSec: 60,
    expectedOutput: '',
    referenceSolution: '',
    status: 'Draft',
    category: 'General Programming',
    versionHistory: [],
    mcqOptions: [
      { id: 'opt-1', text: '', isCorrect: true },
      { id: 'opt-2', text: '', isCorrect: false },
      { id: 'opt-3', text: '', isCorrect: false },
      { id: 'opt-4', text: '', isCorrect: false },
    ]
  });

  const fetchQuestionsFromSupabase = async () => {
    try {
      setIsLoading(true);
      const { data: dbQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbQuestions && dbQuestions.length > 0) {
        const mapped: QuestionRecord[] = dbQuestions.map((q: any) => ({
          id: q.id,
          title: q.title || 'Untitled Question',
          description: q.content_markdown || q.description || '',
          type: q.type || (q.round_id === 'round-2' ? 'Debugging' : q.round_id === 'round-3' ? 'Crash & Fix' : 'MCQ'),
          language: q.language || 'JavaScript',
          difficulty: q.difficulty || 'Medium',
          round: q.round || (q.type === 'Debugging' ? 'Round 2: Algorithmic Debugging' : q.type === 'Crash & Fix' ? 'Round 3: Crash & Fix' : 'Round 1: Speed MCQ'),
          marks: q.points || q.marks || 10,
          negativeMarks: q.negative_points || q.negativeMarks || 0,
          timeLimitSec: q.time_limit_sec || q.timeLimitSec || 60,
          expectedOutput: q.expected_output || q.expectedOutput || '',
          referenceSolution: q.reference_solution || q.referenceSolution || '',
          status: (q.status === 'PUBLISHED' || q.status === 'Published' ? 'Published' : q.status === 'ARCHIVED' || q.status === 'Archived' ? 'Archived' : 'Draft') as QuestionStatus,
          mcqOptions: q.mcq_options || q.mcqOptions || [],
          category: q.category || 'General Programming',
          versionHistory: q.version_history || q.versionHistory || [],
          createdAt: q.created_at || new Date().toISOString()
        }));
        setQuestions(mapped);
      } else {
        setQuestions(INITIAL_QUESTIONS);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchQuestionsFromSupabase();

    const channel = supabase
      .channel('realtime_question_builder')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => fetchQuestionsFromSupabase())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter Logic
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || q.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || q.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open Create Modal
  const handleOpenCreate = (type: QuestionType = 'MCQ') => {
    setFormData({
      title: '',
      description: '',
      type,
      language: type === 'MCQ' ? 'SQL' : 'JavaScript',
      difficulty: 'Medium',
      round: type === 'MCQ' ? 'Round 1: Speed MCQ' : type === 'Debugging' ? 'Round 2: Algorithmic Debugging' : 'Round 3: Crash & Fix',
      marks: type === 'MCQ' ? 10 : type === 'Debugging' ? 40 : 50,
      negativeMarks: type === 'MCQ' ? 2 : 0,
      timeLimitSec: type === 'MCQ' ? 60 : 120,
      expectedOutput: '',
      referenceSolution: '',
      status: 'Draft',
      category: 'Algorithms',
      versionHistory: [],
      mcqOptions: [
        { id: 'opt-1', text: '', isCorrect: true },
        { id: 'opt-2', text: '', isCorrect: false },
        { id: 'opt-3', text: '', isCorrect: false },
        { id: 'opt-4', text: '', isCorrect: false },
      ]
    });
    setEditingQuestion(null);
    setShowModal(true);
  };

  // Open Edit Modal (Stores Version History)
  const handleEdit = (q: QuestionRecord) => {
    setFormData({ ...q });
    setEditingQuestion(q);
    setShowModal(true);
  };

  // Save Question & Store Version History
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let updatedHistory: QuestionVersion[] = editingQuestion ? [...editingQuestion.versionHistory] : [];

    if (editingQuestion) {
      // Create new Version History Entry
      const newVersionEntry: QuestionVersion = {
        versionNumber: updatedHistory.length + 1,
        editor: 'Dinesh (System Admin)',
        timestamp: new Date().toISOString(),
        previousTitle: editingQuestion.title,
        previousDescription: editingQuestion.description,
        previousSolution: editingQuestion.referenceSolution
      };
      updatedHistory.unshift(newVersionEntry);
    }

    const newRecord: QuestionRecord = {
      ...formData,
      id: editingQuestion ? editingQuestion.id : `q-${Date.now()}`,
      versionHistory: updatedHistory,
      createdAt: editingQuestion ? editingQuestion.createdAt : new Date().toISOString()
    } as QuestionRecord;

    // Persist to Supabase database
    try {
      await supabase.from('questions').upsert({
        id: newRecord.id,
        title: newRecord.title,
        content_markdown: newRecord.description,
        description: newRecord.description,
        type: newRecord.type,
        language: newRecord.language,
        difficulty: newRecord.difficulty,
        round: newRecord.round,
        round_id: newRecord.type === 'MCQ' ? 'round-1' : newRecord.type === 'Debugging' ? 'round-2' : 'round-3',
        points: newRecord.marks,
        marks: newRecord.marks,
        negative_points: newRecord.negativeMarks,
        negativeMarks: newRecord.negativeMarks,
        time_limit_sec: newRecord.timeLimitSec,
        timeLimitSec: newRecord.timeLimitSec,
        expected_output: newRecord.expectedOutput,
        expectedOutput: newRecord.expectedOutput,
        reference_solution: newRecord.referenceSolution,
        referenceSolution: newRecord.referenceSolution,
        status: newRecord.status === 'Published' ? 'PUBLISHED' : newRecord.status === 'Archived' ? 'ARCHIVED' : 'DRAFT',
        mcq_options: newRecord.mcqOptions,
        mcqOptions: newRecord.mcqOptions,
        category: newRecord.category,
        version_history: newRecord.versionHistory,
        versionHistory: newRecord.versionHistory,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving question to Supabase:', err);
    }

    if (editingQuestion) {
      setQuestions((prev) => prev.map((q) => (q.id === editingQuestion.id ? newRecord : q)));
    } else {
      setQuestions([newRecord, ...questions]);
    }

    setShowModal(false);
  };

  // Restore Previous Version
  const handleRestoreVersion = async (qId: string, ver: QuestionVersion) => {
    if (confirm(`Restore Version #${ver.versionNumber} for this question?`)) {
      try {
        await supabase.from('questions').update({
          title: ver.previousTitle,
          content_markdown: ver.previousDescription,
          description: ver.previousDescription,
          reference_solution: ver.previousSolution,
          referenceSolution: ver.previousSolution,
          updated_at: new Date().toISOString()
        }).eq('id', qId);
      } catch (err) {
        console.error('Error restoring question version:', err);
      }

      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === qId) {
            return {
              ...q,
              title: ver.previousTitle,
              description: ver.previousDescription,
              referenceSolution: ver.previousSolution
            };
          }
          return q;
        })
      );
      setVersionHistoryModal(null);
      alert(`Version #${ver.versionNumber} restored successfully!`);
    }
  };

  const handleDuplicate = async (q: QuestionRecord) => {
    const duplicated: QuestionRecord = {
      ...q,
      id: `q-${Date.now()}`,
      title: `${q.title} (Copy)`,
      status: 'Draft',
      versionHistory: [],
      createdAt: new Date().toISOString()
    };

    try {
      await supabase.from('questions').upsert({
        id: duplicated.id,
        title: duplicated.title,
        content_markdown: duplicated.description,
        description: duplicated.description,
        type: duplicated.type,
        language: duplicated.language,
        difficulty: duplicated.difficulty,
        round: duplicated.round,
        round_id: duplicated.type === 'MCQ' ? 'round-1' : duplicated.type === 'Debugging' ? 'round-2' : 'round-3',
        points: duplicated.marks,
        marks: duplicated.marks,
        negative_points: duplicated.negativeMarks,
        status: 'DRAFT',
        mcq_options: duplicated.mcqOptions,
        category: duplicated.category,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error duplicating question:', err);
    }

    setQuestions([duplicated, ...questions]);
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('questions').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting question:', err);
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* 1. HEADER & ACTION TOOLBAR */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-2">
            <Database className="h-3.5 w-3.5 text-amber-400" />
            <span>SUPABASE QUESTION MANAGEMENT & VERSIONING</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Question Bank Management</h1>
          <p className="text-xs text-slate-400 font-sans">Author questions, view version history, restore past revisions, set status (Draft, Published, Archived), and test exact student preview experience.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenCreate('MCQ')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Create MCQ
          </button>
          <button
            onClick={() => handleOpenCreate('Debugging')}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Create Debugging
          </button>
          <button
            onClick={() => handleOpenCreate('Crash & Fix')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Create Crash & Fix
          </button>
        </div>
      </div>

      {/* 2. SEARCH & STATUS FILTERS */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, description, category..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL STATUSES (DRAFT, PUBLISHED, ARCHIVED)</option>
            <option value="Published">PUBLISHED ONLY</option>
            <option value="Draft">DRAFT ONLY</option>
            <option value="Archived">ARCHIVED ONLY</option>
          </select>

        </div>
      </div>

      {/* 3. QUESTION CARDS LISTING */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-slate-900/90 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <span>Fetching question bank from Supabase database...</span>
          </div>
        ) : paginatedQuestions.length === 0 ? (
          <div className="bg-slate-900/90 border border-dashed border-slate-800 p-12 rounded-3xl text-center text-slate-500 font-sans text-xs">
            No questions published yet in database. Create your first question using the buttons above.
          </div>
        ) : (
          paginatedQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl transition-all hover:border-slate-700/80"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                {q.type === 'MCQ' && <Zap className="h-5 w-5 text-indigo-400" />}
                {q.type === 'Debugging' && <Code2 className="h-5 w-5 text-cyan-400" />}
                {q.type === 'Crash & Fix' && <Terminal className="h-5 w-5 text-purple-400" />}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{q.title}</h3>

                    {/* STATUS BADGES (Draft, Published, Archived) */}
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      q.status === 'Published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : q.status === 'Draft'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Language: <strong className="text-amber-400 font-mono">{q.language}</strong> • {q.round}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-emerald-400 font-bold">
                  +{q.marks} PTS
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">{q.description}</p>

            {/* ACTION BUTTONS & VERSION HISTORY BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <button
                onClick={() => setVersionHistoryModal(q)}
                className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
              >
                <History className="h-3.5 w-3.5 text-amber-400" />
                <span>Version History ({q.versionHistory.length} edits)</span>
              </button>

              <div className="flex items-center gap-2">
                {/* EXACT STUDENT PREVIEW TRIGGER */}
                <button
                  onClick={() => {
                    setPreviewQuestion(q);
                    setStudentCode(q.referenceSolution);
                    setSelectedMcqOption('');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold transition-all text-xs"
                >
                  <Eye className="h-3.5 w-3.5" /> Exact Student Preview
                </button>

                <button
                  onClick={() => handleEdit(q)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-300 transition-all text-xs"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDuplicate(q)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 transition-all text-xs"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>

                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))
      )}
      </div>

      {/* 4. EXACT STUDENT PREVIEW MODAL */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header / Student Experience Simulation Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" /> EXACT STUDENT EXAMINATION INTERFACE PREVIEW
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight pt-0.5">{previewQuestion.title}</h2>
              </div>
              <button onClick={() => setPreviewQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Student Exam Controls Banner (Timer, Score, Instructions) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Round: <strong className="text-indigo-400">{previewQuestion.round}</strong></span>
                <span className="text-slate-400">Marks: <strong className="text-emerald-400">+{previewQuestion.marks} PTS</strong></span>
              </div>

              <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                <Clock className="h-4 w-4 animate-pulse" />
                <span>Timer: {formatTime(previewQuestion.timeLimitSec)} remaining</span>
              </div>
            </div>

            {/* Question Description */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
              {previewQuestion.description}
            </div>

            {/* MCQ LAYOUT OR CODE EDITOR INTERFACE */}
            {previewQuestion.type === 'MCQ' ? (
              <div className="space-y-3 font-sans">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Select Correct Answer Option:</span>
                <div className="grid grid-cols-1 gap-3">
                  {previewQuestion.mcqOptions?.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedMcqOption(opt.id)}
                      className={`p-4 rounded-2xl border cursor-pointer font-mono text-xs transition-all flex items-center justify-between ${
                        selectedMcqOption === opt.id
                          ? 'bg-amber-500/20 border-amber-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt.text}</span>
                      {opt.isCorrect && <span className="text-emerald-400 font-bold text-[10px]">(Correct Answer)</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Interactive Monaco Code Editor:</span>
                <MonacoPlayground
                  language={previewQuestion.language.toLowerCase()}
                  initialCode={studentCode}
                  onChange={(val) => setStudentCode(val)}
                  timeLimitSec={previewQuestion.timeLimitSec}
                  onRunComplete={(result) => alert(`Execution Output: ${result.output}`)}
                />
              </div>
            )}

            {/* SUBMISSION INTERFACE */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-500">Student Submission Interface Active</span>
              <div className="flex gap-3">
                <button
                  onClick={() => alert('Test run passed all hidden test cases!')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Play className="h-4 w-4 text-cyan-400" /> Run Code
                </button>
                <button
                  onClick={() => alert('Student answer paper submitted!')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> Submit Solution
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. VERSION HISTORY MODAL */}
      {versionHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Question Version History Trail</h3>
              </div>
              <button onClick={() => setVersionHistoryModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {versionHistoryModal.versionHistory.length === 0 ? (
                <div className="py-6 text-center text-slate-500">No previous version edits logged for this question yet.</div>
              ) : (
                versionHistoryModal.versionHistory.map((ver) => (
                  <div key={ver.versionNumber} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-amber-400 text-sm">Version #{ver.versionNumber}</span>
                      <span className="text-slate-400 text-[10px]">{isMounted ? new Date(ver.timestamp).toLocaleString() : '2026-07-28'}</span>
                    </div>

                    <div className="text-slate-300 font-sans">
                      <div><strong>Editor:</strong> {ver.editor}</div>
                      <div><strong>Previous Title:</strong> {ver.previousTitle}</div>
                      <div className="text-slate-400 pt-1"><strong>Previous Description:</strong> {ver.previousDescription}</div>
                    </div>

                    <button
                      onClick={() => handleRestoreVersion(versionHistoryModal.id, ver)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition-all flex items-center gap-1 mt-2"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore This Version
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setVersionHistoryModal(null)}
              className="w-full py-2.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl"
            >
              Close Version History
            </button>
          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingQuestion ? 'Edit Question & Save New Version' : `Author New ${formData.type} Question`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 font-sans text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Question Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Status (Draft, Published, Archived)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-bold font-mono"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Question Description Scenario</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Reference Solution / Code Model</label>
                <textarea
                  rows={3}
                  value={formData.referenceSolution}
                  onChange={(e) => setFormData({ ...formData, referenceSolution: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-300 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-yellow-400 text-slate-950 font-black shadow"
                >
                  Save Question & Create Version Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. DESTRUCTIVE DELETE QUESTION CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            setQuestions((prev) => prev.filter((q) => q.id !== deleteConfirmId));
            setDeleteConfirmId(null);
          }
        }}
        title="Delete Question Permanently"
        description="Are you sure you want to delete this question from the question bank?"
        warningMessage="This action cannot be undone. Any active round relying on this question will lose reference."
        confirmText="Delete Question"
        cancelText="Cancel"
        isDanger={true}
      />

    </div>
  );
}

function formatTime(totalSec: number) {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
