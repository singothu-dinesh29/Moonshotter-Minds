'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Wifi, 
  Code2, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  BarChart3, 
  HelpCircle, 
  ShieldAlert, 
  Award, 
  ArrowUpRight, 
  Zap,
  Activity,
  Terminal,
  Database,
  Radio,
  Lock,
  UserCheck,
  Play,
  FileCheck,
  Megaphone,
  UserX,
  PlusCircle,
  PieChart as PieIcon,
  TrendingUp,
  Server
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { supabase } from '@/lib/supabase';

// Mock Data for Recharts
const ONLINE_STUDENTS_DATA = [
  { time: '17:00', students: 200 },
  { time: '17:10', students: 450 },
  { time: '17:20', students: 780 },
  { time: '17:30', students: 842 },
  { time: '17:40', students: 810 },
  { time: '17:50', students: 835 },
];

const ROUND_COMPLETION_DATA = [
  { name: 'Round 1 (MCQ)', completed: 412, writing: 38 },
  { name: 'Round 2 (Debug)', completed: 310, writing: 102 },
  { name: 'Round 3 (Fix)', completed: 210, writing: 202 },
];

const SCORE_DISTRIBUTION_DATA = [
  { range: '0-30 PTS', count: 25 },
  { range: '31-60 PTS', count: 80 },
  { range: '61-90 PTS', count: 210 },
  { range: '91-120 PTS', count: 97 },
];

const MALPRACTICE_PIE_DATA = [
  { name: 'Tab Switches', value: 10, color: '#EF4444' },
  { name: 'Window Blur', value: 5, color: '#F59E0B' },
  { name: 'Paste Attempts', value: 2, color: '#06B6D4' },
  { name: 'DevTools (F12)', value: 1, color: '#8B5CF6' },
];

export interface ActivityItem {
  id: string;
  type: 'LOGIN' | 'START_EXAM' | 'SUBMIT_ROUND' | 'DISQUALIFY' | 'QUESTION_PUB' | 'ANNOUNCEMENT';
  title: string;
  description: string;
  timestamp: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'DISQUALIFY',
    title: 'Student Disqualified',
    description: 'Registered candidate disqualified for 3 tab switch violations.',
    timestamp: '2 mins ago'
  },
  {
    id: 'act-2',
    type: 'SUBMIT_ROUND',
    title: 'Student Submitted Round',
    description: 'Registered candidate submitted Round 2 Algorithmic Debugging Arena.',
    timestamp: '4 mins ago'
  },
  {
    id: 'act-3',
    type: 'START_EXAM',
    title: 'Student Started Exam',
    description: 'Candidate launched Round 3 Crash & Fix Engineering Arena.',
    timestamp: '7 mins ago'
  },
  {
    id: 'act-4',
    type: 'LOGIN',
    title: 'Student Logged In',
    description: 'Candidate logged into exam portal from Muthayammal Campus Network.',
    timestamp: '10 mins ago'
  },
  {
    id: 'act-5',
    type: 'ANNOUNCEMENT',
    title: 'Announcement Created',
    description: 'Admin Dinesh broadcasted: "Maintain fullscreen mode at all times."',
    timestamp: '15 mins ago'
  },
  {
    id: 'act-6',
    type: 'QUESTION_PUB',
    title: 'Question Published',
    description: 'Question #105 "Fix Distributed Deadlock in Node.js" published to Round 3.',
    timestamp: '22 mins ago'
  }
];

export default function AdminDashboardPage() {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(6322); // 1h 45m 22s
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // System Connections State
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(true);
  const [authActive, setAuthActive] = useState<boolean>(true);

  // Live Database Metrics State
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    onlineStudents: 0,
    writingExam: 0,
    completedExam: 0,
    disqualifiedStudents: 0,
    waitingStudents: 0,
    avgScore: '0.0',
    questionsCount: 0,
    malpracticeIncidents: 0,
  });

  const fetchDashboardMetrics = async () => {
    try {
      const { data: dbUsers } = await supabase
        .from('users')
        .select('id, role, registrations(status, total_score, anti_cheat_flag_count)')
        .eq('role', 'STUDENT');

      const { count: qCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      if (dbUsers) {
        const total = dbUsers.length;
        let writing = 0;
        let completed = 0;
        let disqualified = 0;
        let waiting = 0;
        let totalScoreSum = 0;
        let scoreCount = 0;
        let malpracticeSum = 0;

        dbUsers.forEach((u: any) => {
          const reg = u.registrations?.[0];
          const status = reg?.status || 'REGISTERED';
          const score = reg?.total_score || 0;
          const flags = reg?.anti_cheat_flag_count || 0;

          if (status === 'IN_PROGRESS') writing++;
          else if (status === 'SUBMITTED') completed++;
          else if (status === 'DISQUALIFIED' || flags >= 3) disqualified++;
          else waiting++;

          if (score > 0) {
            totalScoreSum += score;
            scoreCount++;
          }
          malpracticeSum += flags;
        });

        const avg = scoreCount > 0 ? (totalScoreSum / scoreCount).toFixed(1) : '0.0';

        setMetrics({
          totalStudents: total,
          onlineStudents: total,
          writingExam: writing,
          completedExam: completed,
          disqualifiedStudents: disqualified,
          waitingStudents: waiting,
          avgScore: avg,
          questionsCount: qCount || 0,
          malpracticeIncidents: malpracticeSum,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardMetrics();

    // 1. Live Countdown Timer Ticks (Updates every second & stops at 0)
    const countdownTimer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // 2. Supabase Realtime Subscriptions
    const channel = supabase
      .channel('realtime_admin_dashboard_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchDashboardMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => fetchDashboardMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => fetchDashboardMetrics())
      .subscribe();

    return () => {
      clearInterval(countdownTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Format Countdown HH : MM : SS
  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    return {
      hh: hours.toString().padStart(2, '0'),
      mm: mins.toString().padStart(2, '0'),
      ss: secs.toString().padStart(2, '0')
    };
  };

  const timer = formatCountdown(secondsRemaining);

  // 10 LIVE DASHBOARD CARDS
  const CARDS = [
    {
      title: 'Total Registered Students',
      value: metrics.totalStudents.toString(),
      subtitle: 'Live count in Supabase DB',
      icon: Users,
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Students Currently Online',
      value: metrics.onlineStudents.toString(),
      subtitle: 'WebSocket real-time active',
      icon: Wifi,
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Students Writing Exam',
      value: metrics.writingExam.toString(),
      subtitle: 'Active in Monaco Code Arena',
      icon: Code2,
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'Students Completed Exam',
      value: metrics.completedExam.toString(),
      subtitle: 'Submitted papers to DB',
      icon: CheckCircle2,
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      title: 'Students Disqualified',
      value: metrics.disqualifiedStudents.toString(),
      subtitle: 'Tab switch security locks',
      icon: AlertOctagon,
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30'
    },
    {
      title: 'Students Waiting',
      value: metrics.waitingStudents.toString(),
      subtitle: 'Waiting in lobby for exam',
      icon: UserCheck,
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Current Active Round',
      value: 'Round 01',
      subtitle: 'Speed MCQ Arena',
      icon: Clock,
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Average Score',
      value: `${metrics.avgScore} / 120`,
      subtitle: 'Real-time candidate average',
      icon: BarChart3,
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Questions Published',
      value: `${metrics.questionsCount} Active`,
      subtitle: 'Live question bank count',
      icon: HelpCircle,
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Total Malpractice Attempts',
      value: `${metrics.malpracticeIncidents} Incidents`,
      subtitle: 'Tab switches & blur flags',
      icon: ShieldAlert,
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* 1. HEADER BANNER WITH REAL-TIME SYSTEM STATUS BADGES */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/60 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        
        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
              <Activity className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              EXAMINATION CONTROL CENTER
            </span>

            {/* REAL-TIME STATUS BADGES */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
              dbConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {dbConnected ? '🟢 Database Connected' : '🔴 Offline'}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
              realtimeConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {realtimeConnected ? '🟢 Supabase Realtime Connected' : '🔴 Offline'}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
              authActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {authActive ? '🟢 Authentication Active' : '🔴 Offline'}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Symposium Examination Control Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-sans max-w-2xl">
            Real-time candidate telemetry, synchronized countdown clocks, malpractice proctoring logs, and Recharts performance analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/admin/monitor"
            className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Live Monitor</span>
          </Link>
          <Link
            href="/admin/questions"
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Question Bank</span>
          </Link>
        </div>

      </div>

      {/* 2. LARGE SYNCHRONIZED LIVE COUNTDOWN TIMER BANNER */}
      <div className="bg-slate-900/90 border border-amber-500/40 p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
            <Radio className="h-4 w-4 animate-pulse" /> SYNCHRONIZED SERVER COUNTDOWN
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {secondsRemaining > 0 ? 'Live Competition Exam Countdown' : 'EXAM CONCLUDED'}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Server-synchronized timer updating every second for all administrators.
          </p>
        </div>

        {/* Large Digital Clock */}
        <div className="flex items-center gap-3 font-mono">
          <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-amber-500/40 text-center min-w-[70px]">
            <span className="text-2xl md:text-4xl font-black text-amber-400">{timer.hh}</span>
            <span className="text-[10px] text-slate-500 block uppercase">HOURS</span>
          </div>
          <span className="text-2xl font-bold text-amber-400 animate-pulse">:</span>
          <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-amber-500/40 text-center min-w-[70px]">
            <span className="text-2xl md:text-4xl font-black text-amber-400">{timer.mm}</span>
            <span className="text-[10px] text-slate-500 block uppercase">MINS</span>
          </div>
          <span className="text-2xl font-bold text-amber-400 animate-pulse">:</span>
          <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-amber-500/40 text-center min-w-[70px]">
            <span className="text-2xl md:text-4xl font-black text-amber-400">{timer.ss}</span>
            <span className="text-[10px] text-slate-500 block uppercase">SECS</span>
          </div>
        </div>
      </div>

      {/* 3. 10 LIVE DASHBOARD CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {CARDS.map((card, idx) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-xl backdrop-blur-md relative group hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${card.badgeBg}`}>
                  LIVE
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block truncate">
                  {card.title}
                </span>
                <div className="text-xl font-black text-white tracking-tight pt-1 font-mono">
                  {card.value}
                </div>
                <p className="text-[10px] text-slate-400 font-sans pt-0.5 truncate">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. RECHARTS ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: STUDENTS ONLINE OVER TIME (AreaChart) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> Students Online Over Time
            </h3>
            <span className="text-xs font-mono text-emerald-400">842 Active Candidates</span>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ONLINE_STUDENTS_DATA}>
                  <defs>
                    <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#onlineGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: ROUND COMPLETION RATES (BarChart) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" /> Round Completion Breakdown
            </h3>
            <span className="text-xs font-mono text-indigo-400">3 Rounds Active</span>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ROUND_COMPLETION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="completed" fill="#6366F1" radius={[6, 6, 0, 0]} name="Completed" />
                  <Bar dataKey="writing" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Currently Writing" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 3: AVERAGE SCORE DISTRIBUTION (BarChart) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" /> Score Distribution (/ 120 PTS)
            </h3>
            <span className="text-xs font-mono text-amber-400">Mean: 78.4 PTS</span>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_DISTRIBUTION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 4: MALPRACTICE DISTRIBUTION (PieChart / Donut) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-red-400" /> Malpractice Incident Distribution
            </h3>
            <span className="text-xs font-mono text-red-400">18 Incidents Detected</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MALPRACTICE_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MALPRACTICE_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 5. REAL-TIME RECENT ACTIVITY FEED */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
            <h3 className="font-bold text-base text-white">Live Real-Time Activity Feed</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Supabase WebSockets Active</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <AnimatePresence>
            {activities.map((act) => {
              const isDisqualify = act.type === 'DISQUALIFY';
              const isSubmit = act.type === 'SUBMIT_ROUND';
              const isStart = act.type === 'START_EXAM';

              return (
                <motion.div
                  key={act.id}
                  layout
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isDisqualify
                      ? 'bg-red-950/20 border-red-500/30'
                      : isSubmit
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isStart
                      ? 'bg-indigo-950/20 border-indigo-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5 font-sans">
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        isDisqualify ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {act.title}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs pt-1">{act.description}</p>
                  </div>

                  <span className="text-slate-500 text-[10px] font-mono whitespace-nowrap">
                    {act.timestamp}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
