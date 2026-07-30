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
  Loader2,
  Save,
  ChevronUp,
  ChevronDown,
  Image,
  AlertCircle
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
  memoryLimitMb?: number;
  expectedOutput: string;
  referenceSolution: string;
  buggyCode?: string;
  testCases?: { id: string; input: string; expectedOutput: string; isHidden: boolean }[];
  status: QuestionStatus;
  imageUrl?: string;
  mcqOptions?: { id: string; text: string; isCorrect: boolean; imageUrl?: string }[];
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
  const [fetchError, setFetchError] = useState<string | null>(null);
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

  // Form State Validation & Loading
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
      setFetchError(null);
      const { data: dbQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Questions fetch error:', error);
        setFetchError(error.message || 'Failed to fetch questions from database.');
        setQuestions([]);
        return;
      }

      if (dbQuestions) {
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
          memoryLimitMb: q.memory_limit_mb || q.memoryLimitMb || 256,
          expectedOutput: q.expected_output || q.expectedOutput || '',
          referenceSolution: q.reference_solution || q.referenceSolution || '',
          buggyCode: q.buggy_code || q.buggyCode || '',
          testCases: q.test_cases || q.testCases || [],
          status: (q.status === 'PUBLISHED' || q.status === 'Published' ? 'Published' : q.status === 'ARCHIVED' || q.status === 'Archived' ? 'Archived' : 'Draft') as QuestionStatus,
          mcqOptions: q.mcq_options || q.mcqOptions || [],
          category: q.category || 'General Programming',
          versionHistory: q.version_history || q.versionHistory || [],
          createdAt: q.created_at || new Date().toISOString()
        }));
        setQuestions(mapped);
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching questions:', err);
      setFetchError(err?.message || 'Database connection error.');
      setQuestions([]);
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

  // Dynamic Type Switching Handler
  const handleTypeChange = (newType: QuestionType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      round: newType === 'MCQ' ? 'Round 1: Speed MCQ' : newType === 'Debugging' ? 'Round 2: Algorithmic Debugging' : 'Round 3: Crash & Fix',
      language: newType === 'MCQ' ? 'SQL' : prev.language || 'JavaScript',
      marks: newType === 'MCQ' ? (prev.marks || 10) : newType === 'Debugging' ? (prev.marks || 40) : (prev.marks || 50),
      negativeMarks: newType === 'MCQ' ? (prev.negativeMarks ?? 2) : 0,
      timeLimitSec: newType === 'MCQ' ? 60 : newType === 'Debugging' ? 120 : 180,
      mcqOptions: prev.mcqOptions && prev.mcqOptions.length === 4 ? prev.mcqOptions : [
        { id: 'opt-1', text: '', isCorrect: true },
        { id: 'opt-2', text: '', isCorrect: false },
        { id: 'opt-3', text: '', isCorrect: false },
        { id: 'opt-4', text: '', isCorrect: false },
      ]
    }));
  };

  // MCQ Options Management Handlers (Dynamic 2-8 options with Reorder & Image Support)
  const getMcqOptions = () => {
    if (formData.mcqOptions && formData.mcqOptions.length >= 2) {
      return formData.mcqOptions;
    }
    return [
      { id: 'opt-1', text: '', isCorrect: true },
      { id: 'opt-2', text: '', isCorrect: false },
      { id: 'opt-3', text: '', isCorrect: false },
      { id: 'opt-4', text: '', isCorrect: false },
    ];
  };

  const handleAddMcqOption = () => {
    const options = getMcqOptions();
    if (options.length >= 8) {
      setFormValidationError('Maximum 8 options allowed per MCQ question.');
      return;
    }
    const newOpt = { id: `opt-${Date.now()}`, text: '', isCorrect: false };
    setFormData({ ...formData, mcqOptions: [...options, newOpt] });
    setFormValidationError(null);
  };

  const handleDeleteMcqOption = (idx: number) => {
    const options = getMcqOptions();
    if (options.length <= 2) {
      setFormValidationError('Minimum 2 options required per MCQ question.');
      return;
    }
    const wasCorrect = options[idx]?.isCorrect;
    const nextOptions = options.filter((_, i) => i !== idx);
    if (wasCorrect && nextOptions.length > 0) {
      nextOptions[0] = { ...nextOptions[0], isCorrect: true };
    }
    setFormData({ ...formData, mcqOptions: nextOptions });
    setFormValidationError(null);
  };

  const handleMoveMcqOptionUp = (idx: number) => {
    if (idx <= 0) return;
    const options = [...getMcqOptions()];
    const temp = options[idx];
    options[idx] = options[idx - 1];
    options[idx - 1] = temp;
    setFormData({ ...formData, mcqOptions: options });
  };

  const handleMoveMcqOptionDown = (idx: number) => {
    const options = [...getMcqOptions()];
    if (idx >= options.length - 1) return;
    const temp = options[idx];
    options[idx] = options[idx + 1];
    options[idx + 1] = temp;
    setFormData({ ...formData, mcqOptions: options });
  };

  const handleMcqOptionChange = (idx: number, text: string) => {
    const options = [...getMcqOptions()];
    options[idx] = { ...options[idx], text };
    setFormData({ ...formData, mcqOptions: options });
    setFormValidationError(null);
  };

  const handleMcqOptionImageChange = (idx: number, imageUrl: string) => {
    const options = [...getMcqOptions()];
    options[idx] = { ...options[idx], imageUrl };
    setFormData({ ...formData, mcqOptions: options });
  };

  const handleMcqCorrectSelect = (idx: number) => {
    const options = getMcqOptions().map((opt, i) => ({
      ...opt,
      isCorrect: i === idx
    }));
    setFormData({ ...formData, mcqOptions: options });
    setFormValidationError(null);
  };

  // Debugging Test Cases Management Handlers
  const getTestCases = () => {
    if (formData.testCases && formData.testCases.length > 0) {
      return formData.testCases;
    }
    return [
      { id: 'tc-1', input: 'arr = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]', isHidden: false },
      { id: 'tc-2', input: 'arr = [3, 2, 4], target = 6', expectedOutput: '[1, 2]', isHidden: true }
    ];
  };

  const handleAddTestCase = () => {
    const cases = getTestCases();
    const newTc = { id: `tc-${Date.now()}`, input: '', expectedOutput: '', isHidden: false };
    setFormData({ ...formData, testCases: [...cases, newTc] });
  };

  const handleDeleteTestCase = (idx: number) => {
    const cases = getTestCases();
    if (cases.length <= 1) return;
    const nextCases = cases.filter((_, i) => i !== idx);
    setFormData({ ...formData, testCases: nextCases });
  };

  const handleTestCaseChange = (idx: number, field: 'input' | 'expectedOutput' | 'isHidden', value: any) => {
    const cases = [...getTestCases()];
    cases[idx] = { ...cases[idx], [field]: value };
    setFormData({ ...formData, testCases: cases });
  };

  // Save Question & Store Version History
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // MCQ Validation Check
    if (formData.type === 'MCQ') {
      const options = getMcqOptions();
      if (options.length < 2) {
        setFormValidationError('Minimum 2 options required for an MCQ question.');
        return;
      }
      if (options.length > 8) {
        setFormValidationError('Maximum 8 options allowed for an MCQ question.');
        return;
      }
      const hasCorrect = options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        setFormValidationError('Exactly one correct answer must be selected for MCQ question.');
        return;
      }
      if (formData.status === 'Published') {
        const hasEmptyText = options.some((opt) => !opt.text.trim());
        if (hasEmptyText) {
          setFormValidationError('All MCQ option text fields must be filled before publishing.');
          return;
        }
      }
    }
    setFormValidationError(null);

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

    const autoDerivedTitle = formData.title?.trim() 
      || (formData.description ? formData.description.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 45) : '')
      || `${formData.type || 'MCQ'} Question`;

    const newRecord: QuestionRecord = {
      ...formData,
      title: autoDerivedTitle,
      id: editingQuestion ? editingQuestion.id : `q-${Date.now()}`,
      versionHistory: updatedHistory,
      createdAt: editingQuestion ? editingQuestion.createdAt : new Date().toISOString()
    } as QuestionRecord;

    // Persist strictly to Supabase database & check response
    const payload = {
      id: newRecord.id,
      title: newRecord.title,
      content_markdown: newRecord.description || '',
      description: newRecord.description || '',
      type: newRecord.type || 'MCQ',
      language: newRecord.language || 'JavaScript',
      difficulty: newRecord.difficulty || 'Medium',
      round: newRecord.round || 'Round 1: Speed MCQ',
      round_id: newRecord.type === 'MCQ' ? 'round-1' : newRecord.type === 'Debugging' ? 'round-2' : 'round-3',
      points: newRecord.marks || 10,
      marks: newRecord.marks || 10,
      negative_points: newRecord.negativeMarks || 0,
      negativeMarks: newRecord.negativeMarks || 0,
      time_limit_sec: newRecord.timeLimitSec || 60,
      timeLimitSec: newRecord.timeLimitSec || 60,
      memory_limit_mb: newRecord.memoryLimitMb || 256,
      memoryLimitMb: newRecord.memoryLimitMb || 256,
      expected_output: newRecord.expectedOutput || '',
      expectedOutput: newRecord.expectedOutput || '',
      reference_solution: newRecord.referenceSolution || '',
      referenceSolution: newRecord.referenceSolution || '',
      buggy_code: newRecord.buggyCode || newRecord.referenceSolution || '',
      buggyCode: newRecord.buggyCode || newRecord.referenceSolution || '',
      test_cases: newRecord.testCases || [],
      testCases: newRecord.testCases || [],
      status: newRecord.status === 'Published' ? 'PUBLISHED' : newRecord.status === 'Archived' ? 'ARCHIVED' : 'DRAFT',
      mcq_options: newRecord.mcqOptions || [],
      mcqOptions: newRecord.mcqOptions || [],
      category: newRecord.category || 'General',
      version_history: newRecord.versionHistory || [],
      versionHistory: newRecord.versionHistory || [],
      updated_at: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .upsert(payload)
        .select();

      if (error) {
        console.error('Database Error saving question to Supabase:', error);
        setFormValidationError(`Database Save Error: ${error.message || 'Failed to persist question to Supabase.'}`);
        setIsSaving(false);
        return;
      }

      // Re-fetch question list directly from Supabase database (Single Source of Truth)
      await fetchQuestionsFromSupabase();
      setIsSaving(false);
      setShowModal(false);
    } catch (err: any) {
      console.error('Unexpected error saving question to Supabase:', err);
      setFormValidationError(`Database Error: ${err?.message || 'Connection error to Supabase'}`);
      setIsSaving(false);
    }
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
        {fetchError ? (
          <div className="bg-rose-500/10 border border-rose-500/30 p-8 rounded-3xl text-center text-rose-300 font-mono text-xs space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
            <span className="font-bold block">Failed to load questions from database: {fetchError}</span>
            <button
              onClick={() => fetchQuestionsFromSupabase()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all"
            >
              Retry Fetching from Supabase
            </button>
          </div>
        ) : isLoading ? (
          <div className="bg-slate-900/90 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <span>Fetching live question bank directly from Supabase PostgreSQL database...</span>
          </div>
        ) : paginatedQuestions.length === 0 ? (
          <div className="bg-slate-900/90 border border-dashed border-slate-800 p-12 rounded-3xl text-center text-slate-400 font-sans text-xs space-y-2">
            <p className="font-bold text-slate-300">No questions found in Supabase database.</p>
            <p className="text-slate-500">Author your first question using the "Author New Question" button above.</p>
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

      {/* 6. DYNAMIC QUESTION AUTHORING FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">
                  {editingQuestion ? 'Edit Question & Save New Version' : `Author New ${formData.type || 'MCQ'} Question`}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select Question Type to dynamically customize the authoring fields.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 font-sans text-xs">
              
              {/* TOP CONTROL ROW: QUESTION TYPE & STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Question Type Dropdown */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold flex items-center justify-between">
                    <span>Question Type</span>
                    <span className="text-amber-400 font-mono text-[10px]">* Required</span>
                  </label>
                  <select
                    value={formData.type || 'MCQ'}
                    onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-3 text-amber-400 font-bold font-mono focus:border-amber-400 focus:outline-none shadow-sm"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Debugging">Debugging</option>
                    <option value="Crash & Fix">Crash & Fix</option>
                  </select>
                </div>



                {/* 3. Status Dropdown */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Status (Draft, Published, Archived)</label>
                  <select
                    value={formData.status || 'Draft'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-bold font-mono focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* SECOND ROW: METADATA & PARAMS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[11px]">Language</label>
                  <select
                    value={formData.language || 'JavaScript'}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="SQL">SQL</option>
                    <option value="TypeScript">TypeScript</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[11px]">Difficulty</label>
                  <select
                    value={formData.difficulty || (formData.type === 'Crash & Fix' ? 'Hard' : 'Medium')}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  >
                    {formData.type !== 'Crash & Fix' && <option value="Easy">Easy</option>}
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[11px]">Marks / Points</label>
                  <input
                    type="number"
                    value={formData.marks || (formData.type === 'Crash & Fix' ? 50 : 10)}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[11px]">
                    {formData.type === 'MCQ' ? 'Negative Marking' : 'Time Limit (Sec)'}
                  </label>
                  <input
                    type="number"
                    value={formData.type === 'MCQ' ? (formData.negativeMarks ?? 2) : (formData.timeLimitSec ?? 120)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (formData.type === 'MCQ') {
                        setFormData({ ...formData, negativeMarks: val });
                      } else {
                        setFormData({ ...formData, timeLimitSec: val });
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-amber-300 font-mono"
                  />
                </div>

                {formData.type === 'Crash & Fix' && (
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold text-[11px]">Memory Limit (MB)</label>
                    <input
                      type="number"
                      value={formData.memoryLimitMb || 256}
                      onChange={(e) => setFormData({ ...formData, memoryLimitMb: parseInt(e.target.value) || 256 })}
                      className="w-full bg-slate-900 border border-purple-500/30 rounded-lg p-2 text-purple-300 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* VALIDATION ERROR BANNER */}
              {formValidationError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{formValidationError}</span>
                </div>
              )}

              {/* DYNAMIC FORM SECTION: BASED ON QUESTION TYPE */}

              {/* 1. MCQ SPECIFIC FIELDS */}
              {formData.type === 'MCQ' && (
                <div className="space-y-4 pt-1">
                  
                  {/* QUESTION STATEMENT & OPTIONAL IMAGE UPLOAD */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold flex items-center justify-between">
                        <span>Question Statement</span>
                        <span className="text-[10px] text-slate-500 font-mono">* Required (Markdown Supported)</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Enter MCQ question statement or scenario..."
                        value={formData.description || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          setFormValidationError(null);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* OPTIONAL QUESTION IMAGE UPLOAD / URL */}
                    <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <label className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                        <Image className="h-3.5 w-3.5 text-indigo-400" /> Optional Question Diagram / Image URL
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="url"
                          placeholder="https://example.com/diagram.png"
                          value={formData.imageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                        />
                        {formData.imageUrl && (
                          <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                            <img src={formData.imageUrl} alt="Question Preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DYNAMIC MCQ CHOICE OPTIONS MANAGEMENT */}
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-indigo-400 text-xs uppercase tracking-wider block">MCQ Options (2 to 8 Choices)</span>
                        <span className="text-[10px] text-slate-400 font-mono">Select radio button for Correct Answer</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMcqOption}
                        disabled={getMcqOptions().length >= 8}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Option
                      </button>
                    </div>

                    {/* RENDER DYNAMIC OPTIONS */}
                    <div className="space-y-2.5">
                      {getMcqOptions().map((opt, idx) => {
                        const letter = String.fromCharCode(65 + idx); // A, B, C, D, E, F, G, H
                        const optionsList = getMcqOptions();

                        return (
                          <div key={opt.id || idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center gap-2">
                              {/* Option Letter Badge */}
                              <span className={`h-7 w-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${opt.isCorrect ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 text-slate-300'}`}>
                                {letter}
                              </span>

                              {/* Option Text Input */}
                              <input
                                type="text"
                                required
                                placeholder={`Option ${letter} Choice Text...`}
                                value={opt.text}
                                onChange={(e) => handleMcqOptionChange(idx, e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                              />

                              {/* Radio Select for Correct Answer */}
                              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer font-mono px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all">
                                <input
                                  type="radio"
                                  name="mcqCorrectOption"
                                  checked={opt.isCorrect}
                                  onChange={() => handleMcqCorrectSelect(idx)}
                                  className="accent-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                />
                                <span className={opt.isCorrect ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                                  {opt.isCorrect ? 'Correct' : 'Mark Correct'}
                                </span>
                              </label>

                              {/* Option Reordering Buttons */}
                              <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveMcqOptionUp(idx)}
                                  disabled={idx === 0}
                                  title="Move Option Up"
                                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveMcqOptionDown(idx)}
                                  disabled={idx === optionsList.length - 1}
                                  title="Move Option Down"
                                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Option Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteMcqOption(idx)}
                                disabled={optionsList.length <= 2}
                                title="Delete Option"
                                className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Optional Option Image Input */}
                            <div className="flex items-center gap-2 pl-9">
                              <input
                                type="url"
                                placeholder={`Optional Option ${letter} Image URL...`}
                                value={opt.imageUrl || ''}
                                onChange={(e) => handleMcqOptionImageChange(idx, e.target.value)}
                                className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-md p-1.5 text-[11px] text-slate-300 font-mono focus:border-indigo-500 focus:outline-none"
                              />
                              {opt.imageUrl && (
                                <div className="h-6 w-6 rounded overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                                  <img src={opt.imageUrl} alt={`Option ${letter}`} className="h-full w-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* REFERENCE SOLUTION / MODEL */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Reference Solution / Answer Model</label>
                    <textarea
                      rows={2}
                      placeholder="Provide answer explanation or reference model..."
                      value={formData.referenceSolution || ''}
                      onChange={(e) => setFormData({ ...formData, referenceSolution: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-300 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 2. ENHANCED DEBUGGING AUTHORING FIELDS */}
              {formData.type === 'Debugging' && (
                <div className="space-y-4 pt-1">
                  
                  {/* PROBLEM STATEMENT */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold flex items-center justify-between">
                      <span>Problem Statement & Bug Scenario</span>
                      <span className="text-[10px] text-slate-500 font-mono">* Required</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the logic flaw, off-by-one loop bug, wrong operator, missing semicolon, or incorrect condition..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* BUGGY CODE SECTION WITH MONACO PLAYGROUND / EDITOR */}
                  <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-cyan-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="h-4 w-4" /> Buggy Code (Monaco Editor for 1-2 Intentional Bugs)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Monaco Code Editor Active</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Paste code containing minor intentional bugs (e.g. wrong operator, missing semicolon, off-by-one condition, wrong variable). Students will edit this code in Monaco Editor during the exam.
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-800">
                      <MonacoPlayground
                        language={(formData.language || 'javascript').toLowerCase() === 'c++' ? 'cpp' : (formData.language || 'javascript').toLowerCase()}
                        initialCode={formData.buggyCode || formData.referenceSolution || '// Write or paste buggy code starter here...\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for(let i=0; i<=nums.length; i++) { // Off-by-one bug!\n    const diff = target + nums[i]; // Wrong operator bug!\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}'}
                        onChange={(val) => setFormData({ ...formData, buggyCode: val })}
                        timeLimitSec={formData.timeLimitSec || 120}
                        onRunComplete={(result) => console.log('Admin Debug Test:', result)}
                      />
                    </div>
                  </div>

                  {/* REFERENCE SOLUTION (CORRECT FIXED CODE) */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold text-emerald-400 flex items-center justify-between">
                      <span>Reference Solution (Correct Fixed Code Model)</span>
                      <span className="text-[10px] text-slate-500 font-mono">Expected Fix Model</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Paste correct reference code solution here..."
                      value={formData.referenceSolution || ''}
                      onChange={(e) => setFormData({ ...formData, referenceSolution: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* EXPECTED OUTPUT */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Expected Output</label>
                    <input
                      type="text"
                      placeholder="e.g. [0, 1] or OK"
                      value={formData.expectedOutput || ''}
                      onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* MULTIPLE TEST CASES SECTION */}
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-amber-400 text-xs uppercase tracking-wider block">Test Cases (Public & Hidden)</span>
                        <span className="text-[10px] text-slate-400 font-mono">Define test input parameters and expected output</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Test Case
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {getTestCases().map((tc, idx) => {
                        const tcList = getTestCases();
                        return (
                          <div key={tc.id || idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                Test Case #{idx + 1}
                                {tc.isHidden ? (
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                                    Hidden Test Case
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
                                    Public Test Case
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer font-mono">
                                  <input
                                    type="checkbox"
                                    checked={tc.isHidden}
                                    onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                                    className="accent-purple-500 h-3.5 w-3.5 cursor-pointer rounded"
                                  />
                                  <span className="text-[11px]">Hidden Test Case</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTestCase(idx)}
                                  disabled={tcList.length <= 1}
                                  title="Delete Test Case"
                                  className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-rose-500/10 transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Input / STDIN</label>
                                <textarea
                                  rows={2}
                                  placeholder="e.g. arr = [2, 7, 11, 15], target = 9"
                                  value={tc.input}
                                  onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Expected Output / STDOUT</label>
                                <textarea
                                  rows={2}
                                  placeholder="e.g. [0, 1]"
                                  value={tc.expectedOutput}
                                  onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-emerald-400 text-xs focus:border-emerald-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* 3. ENHANCED CRASH & FIX AUTHORING FIELDS */}
              {formData.type === 'Crash & Fix' && (
                <div className="space-y-4 pt-1">
                  
                  {/* PROBLEM STATEMENT & CRASH EXCEPTION TYPE */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold flex items-center justify-between">
                        <span>Problem Statement & Crash Scenario</span>
                        <span className="text-[10px] text-slate-500 font-mono">* Required</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe the condition triggering the runtime crash, infinite recursion, memory leak, or broken algorithm..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-purple-500/30">
                      <label className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                        <AlertOctagon className="h-3.5 w-3.5 text-purple-400" /> Crash Exception Type / Error Target
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. RangeError: Maximum call stack size exceeded, NullPointerException, Segmentation Fault"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-purple-300 focus:border-purple-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* CRASHING CODE SECTION WITH MONACO PLAYGROUND */}
                  <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="h-4 w-4" /> Crashing Code (Monaco Editor for Major Logical Flaw)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Monaco Code Editor Active</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Paste code containing larger logical bugs (incorrect recursion, broken algorithm, wrong data structure, memory issue, infinite loop, or incorrect return). Students will solve by editing this code.
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-800">
                      <MonacoPlayground
                        language={(formData.language || 'python').toLowerCase() === 'c++' ? 'cpp' : (formData.language || 'python').toLowerCase()}
                        initialCode={formData.buggyCode || '// Write or paste crashing code starter here...\ndef maxDepth(root):\n    # Crashing missing base case causes infinite recursion stack overflow!\n    return max(maxDepth(root.left), maxDepth(root.right)) + 1'}
                        onChange={(val) => setFormData({ ...formData, buggyCode: val })}
                        timeLimitSec={formData.timeLimitSec || 180}
                        onRunComplete={(result) => console.log('Admin Crash Test:', result)}
                      />
                    </div>
                  </div>

                  {/* REFERENCE SOLUTION (EDITABLE REFERENCE CODE MODEL) */}
                  <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="h-4 w-4" /> Reference Solution (Correct Fixed Code Model)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">+ if not root: return 0</span>
                    </div>

                    <textarea
                      rows={6}
                      required
                      placeholder="Paste correct reference fixed code solution model..."
                      value={formData.referenceSolution || ''}
                      onChange={(e) => setFormData({ ...formData, referenceSolution: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* VISIBLE & HIDDEN TEST CASES SECTION */}
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-purple-400 text-xs uppercase tracking-wider block">Test Cases (Visible & Hidden)</span>
                        <span className="text-[10px] text-slate-400 font-mono">Define test inputs and expected outputs</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Test Case
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {getTestCases().map((tc, idx) => {
                        const tcList = getTestCases();
                        return (
                          <div key={tc.id || idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                Test Case #{idx + 1}
                                {tc.isHidden ? (
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                                    Hidden Test Case
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                                    Visible Test Case
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer font-mono">
                                  <input
                                    type="checkbox"
                                    checked={tc.isHidden}
                                    onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                                    className="accent-purple-500 h-3.5 w-3.5 cursor-pointer rounded"
                                  />
                                  <span className="text-[11px]">{tc.isHidden ? 'Hidden' : 'Visible'}</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTestCase(idx)}
                                  disabled={tcList.length <= 1}
                                  title="Delete Test Case"
                                  className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-rose-500/10 transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Input / STDIN</label>
                                <textarea
                                  rows={2}
                                  placeholder="e.g. root = [3, 9, 20, null, null, 15, 7]"
                                  value={tc.input}
                                  onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Expected Output / STDOUT</label>
                                <textarea
                                  rows={2}
                                  placeholder="e.g. 3"
                                  value={tc.expectedOutput}
                                  onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-emerald-400 text-xs focus:border-emerald-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* MODAL ACTION BUTTONS */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Inserting into Supabase Database...' : 'Save Question & Persist to Database'}
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
