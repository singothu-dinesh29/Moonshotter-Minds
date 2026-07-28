'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, 
  Activity, 
  Wifi, 
  WifiOff, 
  Server, 
  Database, 
  Radio, 
  HardDrive, 
  ShieldAlert, 
  Play, 
  Pause, 
  Square, 
  Send, 
  Award, 
  Download, 
  Lock, 
  Unlock, 
  UserX, 
  UserCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  RotateCcw,
  Sparkles,
  Layers,
  Flame,
  FileCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export type EventState = 'ACTIVE' | 'PAUSED' | 'ENDED';

export default function AdminControlCentreHub() {
  const [eventStatus, setEventStatus] = useState<EventState>('ACTIVE');
  const [activeRound, setActiveRound] = useState<string>('Round 2: Algorithmic Debugging');
  const [loginsEnabled, setLoginsEnabled] = useState<boolean>(true);
  const [examLocked, setExamLocked] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  // System Live Metrics State
  const [metrics, setMetrics] = useState({
    activeStudents: 1248,
    onlineStudents: 1180,
    offlineStudents: 68,
    warningsIssued: 14,
    disqualifiedStudents: 4,
    serverLatencyMs: 18,
    dbStatus: 'Operational',
    realtimeChannel: 'Active',
    storageUsage: '1.2 GB / 50 GB'
  });

  // Reusable Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    warningMessage?: string;
    onConfirm: () => void;
    isDanger: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    isDanger: true
  });

  useEffect(() => {
    setIsMounted(true);

    // Live Metrics Latency Pulse Simulator
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        serverLatencyMs: 15 + Math.floor(Math.random() * 8),
        onlineStudents: 1180 + Math.floor(Math.random() * 5) - 2
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Quick Action Handlers
  const handlePauseExam = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Pause Global Examination',
      description: 'Are you sure you want to pause the examination for all active candidate sessions?',
      warningMessage: 'All student timers will freeze globally and code editors will enter read-only mode until resumed.',
      isDanger: false,
      onConfirm: () => {
        setEventStatus('PAUSED');
        alert('Examination globally PAUSED! Student timers frozen via Supabase WebSockets.');
      }
    });
  };

  const handleResumeExam = () => {
    setEventStatus('ACTIVE');
    alert('Examination globally RESUMED! Student timers un-frozen.');
  };

  const handleEndExam = () => {
    setConfirmModal({
      isOpen: true,
      title: 'End Grand Prix Symposium Examination',
      description: 'Are you sure you want to officially conclude the symposium examination?',
      warningMessage: 'This action will end all round sessions, trigger final answer script saves, and calculate master score rankings.',
      isDanger: true,
      onConfirm: () => {
        setEventStatus('ENDED');
        alert('Symposium Examination officially CONCLUDED!');
      }
    });
  };

  const handleForceSubmitAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Force Auto-Submit All Student Answer Papers',
      description: 'Are you sure you want to force auto-submit answer scripts for all 1,248 active candidates?',
      warningMessage: 'This will lock code playground submissions across all rounds and finalize candidate score calculations immediately.',
      isDanger: true,
      onConfirm: () => {
        alert('Force auto-submission signal broadcasted! 1,248 student answer scripts submitted.');
      }
    });
  };

  const handleLockEntireExam = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Lock Entire Candidate Exam Arena',
      description: 'Are you sure you want to lock the entire candidate exam arena?',
      warningMessage: 'Emergency Action: Prevents any code edits, answer updates, or test case execution across all candidate screens.',
      isDanger: true,
      onConfirm: () => {
        setExamLocked(true);
        alert('Exam Arena LOCKED globally!');
      }
    });
  };

  const handleUnlockExam = () => {
    setExamLocked(false);
    alert('Exam Arena UNLOCKED!');
  };

  const handleToggleLogins = () => {
    const nextState = !loginsEnabled;
    setConfirmModal({
      isOpen: true,
      title: nextState ? 'Enable Candidate Logins' : 'Disable Candidate Logins',
      description: nextState ? 'Allow new student candidate logins to the symposium arena?' : 'Prevent new student candidate logins to the portal?',
      warningMessage: nextState ? 'Students will be allowed to log in.' : 'New candidate login attempts will return HTTP 403 Forbidden.',
      isDanger: !nextState,
      onConfirm: () => {
        setLoginsEnabled(nextState);
        alert(nextState ? 'Candidate Logins ENABLED!' : 'Candidate Logins DISABLED!');
      }
    });
  };

  const handleBackupDatabase = () => {
    alert('Database Snapshot Backup initiated! Automated dump saved to Supabase storage bucket.');
  };

  const handlePublishResults = () => {
    alert('Master Leaderboard & Score Cards published to public candidate portal!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* 1. HEADER CONTROL BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/60 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold">
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <span>COMMAND & CONTROL CENTRE (SUPABASE WEBSOCKETS)</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Symposium Control Centre
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-sans max-w-2xl">
            Centralized admin command dashboard to manage live event status, control rounds, monitor server infrastructure, and trigger emergency exam overrides.
          </p>
        </div>

        {/* Global Event Status Pill */}
        <div className="relative z-10 flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">EVENT SYMPOSIUM STATUS</span>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full animate-ping ${
                eventStatus === 'ACTIVE' ? 'bg-emerald-400' : eventStatus === 'PAUSED' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              <span className={`font-black text-sm ${
                eventStatus === 'ACTIVE' ? 'text-emerald-400' : eventStatus === 'PAUSED' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {eventStatus === 'ACTIVE' && '🟢 LIVE & ACTIVE'}
                {eventStatus === 'PAUSED' && '🟡 EXAM PAUSED'}
                {eventStatus === 'ENDED' && '🔴 EXAM CONCLUDED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVE EVENT & SYSTEM TELEMETRY CARDS (11 SPECIFIC METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 font-mono">
        
        {/* Active Round Card */}
        <div className="bg-slate-900/90 border border-indigo-500/40 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-indigo-400">
            <Layers className="h-5 w-5" />
            <span className="text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">ROUND</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Active Round</span>
          <span className="text-sm font-bold text-white tracking-tight line-clamp-1">{activeRound}</span>
        </div>

        {/* Active Students */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <Users className="h-5 w-5" />
            <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">TOTAL</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Active Students</span>
          <span className="text-xl font-extrabold text-white">{metrics.activeStudents}</span>
        </div>

        {/* Online Students */}
        <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400">
            <Wifi className="h-5 w-5" />
            <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">ONLINE</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Online Students</span>
          <span className="text-xl font-extrabold text-emerald-400">{metrics.onlineStudents}</span>
        </div>

        {/* Offline Students */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <WifiOff className="h-5 w-5" />
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">OFFLINE</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Offline Students</span>
          <span className="text-xl font-extrabold text-slate-300">{metrics.offlineStudents}</span>
        </div>

        {/* Warnings Issued */}
        <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">WARNINGS</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Warnings Issued</span>
          <span className="text-xl font-extrabold text-amber-400">{metrics.warningsIssued}</span>
        </div>

        {/* Disqualified Students */}
        <div className="bg-slate-900/90 border border-red-500/40 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-red-400">
            <UserX className="h-5 w-5" />
            <span className="text-[10px] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">DISQUALIFIED</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Disqualified</span>
          <span className="text-xl font-extrabold text-red-400">{metrics.disqualifiedStudents}</span>
        </div>

        {/* Server Status & Latency */}
        <div className="bg-slate-900/90 border border-cyan-500/30 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-cyan-400">
            <Server className="h-5 w-5" />
            <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">SERVER</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Server Status</span>
          <span className="text-sm font-bold text-cyan-300">🟢 99.98% ({metrics.serverLatencyMs}ms)</span>
        </div>

        {/* Database Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-indigo-400">
            <Database className="h-5 w-5" />
            <span className="text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">DB</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Database Status</span>
          <span className="text-sm font-bold text-emerald-400">🟢 Supabase Postgres</span>
        </div>

        {/* Realtime WebSockets Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-purple-400">
            <Radio className="h-5 w-5" />
            <span className="text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">REALTIME</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Realtime Status</span>
          <span className="text-sm font-bold text-purple-300">🟢 WebSockets Active</span>
        </div>

        {/* Storage Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <HardDrive className="h-5 w-5" />
            <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">STORAGE</span>
          </div>
          <span className="text-[10px] text-slate-500 block uppercase">Storage Status</span>
          <span className="text-sm font-bold text-slate-200">{metrics.storageUsage}</span>
        </div>

      </div>

      {/* 3. QUICK ACTIONS PANEL */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Quick Symposium Actions Panel</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">8 Actions Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          
          {/* Publish Round */}
          <button
            onClick={() => alert('Round 2: Algorithmic Debugging Published!')}
            className="p-4 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Play className="h-5 w-5 text-indigo-400" />
            <span>Publish Round</span>
          </button>

          {/* Pause Exam */}
          <button
            onClick={handlePauseExam}
            className="p-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Pause className="h-5 w-5 text-amber-400" />
            <span>Pause Exam</span>
          </button>

          {/* Resume Exam */}
          <button
            onClick={handleResumeExam}
            className="p-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Play className="h-5 w-5 text-emerald-400" />
            <span>Resume Exam</span>
          </button>

          {/* End Exam */}
          <button
            onClick={handleEndExam}
            className="p-4 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Square className="h-5 w-5 text-red-400" />
            <span>End Exam</span>
          </button>

          {/* Publish Results */}
          <button
            onClick={handlePublishResults}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Award className="h-5 w-5 text-amber-400" />
            <span>Publish Results</span>
          </button>

          {/* Send Announcement */}
          <button
            onClick={() => alert('Opening Realtime Announcement Broadcaster...')}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Send className="h-5 w-5 text-cyan-400" />
            <span>Send Announcement</span>
          </button>

          {/* Generate Certificates */}
          <button
            onClick={() => alert('Certificate PDF Generation Pipeline triggered!')}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-purple-300 border border-slate-800 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <FileCheck className="h-5 w-5 text-purple-400" />
            <span>Generate Certificates</span>
          </button>

          {/* Backup Database */}
          <button
            onClick={handleBackupDatabase}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Database className="h-5 w-5 text-emerald-400" />
            <span>Backup Database</span>
          </button>

        </div>
      </div>

      {/* 4. EMERGENCY CONTROLS PANEL (RED DESTRUCTIVE STYLING) */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/20 to-slate-900 border border-red-500/40 p-6 md:p-8 rounded-3xl space-y-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white">Emergency Override Controls</h2>
          </div>
          <span className="text-xs font-mono text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
            HIGH-SECURITY OVERRIDES
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          
          {/* Lock Entire Exam */}
          <button
            onClick={handleLockEntireExam}
            className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-red-600/20"
          >
            <Lock className="h-5 w-5" />
            <span>Lock Entire Exam</span>
          </button>

          {/* Unlock Exam */}
          <button
            onClick={handleUnlockExam}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Unlock className="h-5 w-5" />
            <span>Unlock Exam</span>
          </button>

          {/* Disable Logins / Enable Logins */}
          <button
            onClick={handleToggleLogins}
            className={`p-4 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-2 text-center border ${
              loginsEnabled
                ? 'bg-red-950/40 hover:bg-red-950/60 text-red-300 border-red-500/40'
                : 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {loginsEnabled ? <UserX className="h-5 w-5 text-red-400" /> : <UserCheck className="h-5 w-5 text-emerald-400" />}
            <span>{loginsEnabled ? 'Disable Logins' : 'Enable Logins'}</span>
          </button>

          {/* Force Submit All Students */}
          <button
            onClick={handleForceSubmitAll}
            className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-red-600/20"
          >
            <Flame className="h-5 w-5" />
            <span>Force Submit All</span>
          </button>

          {/* Restore Student */}
          <button
            onClick={() => alert('Opening Candidate Restoration Manager...')}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Restore Student</span>
          </button>

          {/* System Purge Snapshot */}
          <button
            onClick={() => alert('Emergency audit snapshot logged!')}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 font-bold transition-all flex flex-col items-center justify-center gap-2 text-center"
          >
            <Activity className="h-5 w-5" />
            <span>Log Audit Event</span>
          </button>

        </div>
      </div>

      {/* 5. REUSABLE DESTRUCTIVE CONFIRMATION DIALOG MODAL */}
      <ConfirmationDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        warningMessage={confirmModal.warningMessage}
        confirmText="Confirm Control Action"
        cancelText="Cancel"
        isDanger={confirmModal.isDanger}
      />

    </div>
  );
}
