'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Send, 
  RotateCcw, 
  UserX, 
  History, 
  Clock, 
  Monitor, 
  CheckCircle2, 
  X, 
  Lock, 
  Unlock, 
  Activity, 
  CopyX, 
  Maximize2, 
  Maximize,
  Terminal,
  Database,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export type ViolationType = 
  | 'TAB_SWITCH' 
  | 'WINDOW_BLUR' 
  | 'FULLSCREEN_EXIT' 
  | 'DEVTOOLS_SHORTCUT' 
  | 'PASTE_ATTEMPT';

export interface MalpracticeViolation {
  id: string;
  studentName: string;
  studentEmail: string;
  timestamp: string;
  violationType: ViolationType;
  round: string;
  questionNumber: number;
  browserInfo: string;
  warningLevel: number;
}

export interface AuditActionLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: 'SEND_WARNING' | 'RESTORE_STUDENT' | 'DISQUALIFY_STUDENT';
  studentName: string;
  details: string;
}

export default function MalpracticeMonitorHub() {
  const [violations, setViolations] = useState<MalpracticeViolation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditActionLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Filters
  const [searchStudent, setSearchStudent] = useState('');
  const [filterViolationType, setFilterViolationType] = useState<string>('ALL');
  const [filterRound, setFilterRound] = useState<string>('ALL');

  // Modals
  const [selectedStudentView, setSelectedStudentView] = useState<MalpracticeViolation | null>(null);

  // Ensure hydration safety on client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Realtime WebSocket Subscription Listener
  useEffect(() => {
    const channel = supabase
      .channel('realtime_malpractice_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cheating_logs' }, (payload: any) => {
        if (payload.new) {
          const newViolation: MalpracticeViolation = {
            id: payload.new.id || `v-${Date.now()}`,
            studentName: payload.new.user_name || 'Candidate',
            studentEmail: payload.new.registration_id || 'candidate@mec.edu.in',
            timestamp: payload.new.created_at || new Date().toISOString(),
            violationType: (payload.new.incident_type as ViolationType) || 'TAB_SWITCH',
            round: payload.new.round_name || 'Round 2: Algorithmic Debugging',
            questionNumber: payload.new.question_number || 1,
            browserInfo: payload.new.browser_info || 'Chrome v122 (Windows 11)',
            warningLevel: (payload.new.warning_level as 1 | 2 | 3) || 1
          };
          setViolations((prev) => [newViolation, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
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

  const handleSendWarning = (v: MalpracticeViolation) => {
    const nextWarning = (Math.min(v.warningLevel + 1, 3)) as 1 | 2 | 3;
    setViolations((prev) =>
      prev.map((item) => (item.id === v.id ? { ...item, warningLevel: nextWarning } : item))
    );

    // Append to Audit Log
    const newAudit: AuditActionLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUser: 'Dinesh (Admin)',
      action: 'SEND_WARNING',
      studentName: v.studentName,
      details: `Issued Warning Level ${nextWarning} alert banner.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
    alert(`Warning Level ${nextWarning} sent to candidate ${v.studentName}!`);
  };

  const handleRestoreStudent = (v: MalpracticeViolation) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Restore Candidate: ${v.studentName}`,
      description: `Are you sure you want to clear violation flags and restore candidate active exam session?`,
      warningMessage: 'This will reset warning flags and unlock candidate examination entry.',
      isDanger: false,
      onConfirm: () => {
        setViolations((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, warningLevel: 1 } : item))
        );

        const newAudit: AuditActionLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          adminUser: 'Dinesh (Admin)',
          action: 'RESTORE_STUDENT',
          studentName: v.studentName,
          details: 'Cleared violation flags and restored active exam session.'
        };
        setAuditLogs((prev) => [newAudit, ...prev]);
      }
    });
  };

  const handleDisqualifyStudent = (v: MalpracticeViolation) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Disqualify Candidate: ${v.studentName}`,
      description: `Are you sure you want to disqualify ${v.studentName} (${v.studentEmail})?`,
      warningMessage: 'This action will immediately lock the student exam paper and mark the student as disqualified.',
      isDanger: true,
      onConfirm: () => {
        setViolations((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, warningLevel: 3 } : item))
        );

        const newAudit: AuditActionLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          adminUser: 'Dinesh (Admin)',
          action: 'DISQUALIFY_STUDENT',
          studentName: v.studentName,
          details: 'Manually disqualified candidate and locked exam paper.'
        };
        setAuditLogs((prev) => [newAudit, ...prev]);
      }
    });
  };

  // Filter Logic
  const filteredViolations = violations.filter((v) => {
    const matchesStudent = 
      v.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      v.studentEmail.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesType = filterViolationType === 'ALL' || v.violationType === filterViolationType;
    const matchesRound = filterRound === 'ALL' || v.round.includes(filterRound);

    return matchesStudent && matchesType && matchesRound;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-red-950/60 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400 animate-pulse" />
            <span>REAL-TIME MALPRACTICE & AUDIT STREAM ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Malpractice Monitoring Module
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-sans max-w-2xl">
            Detect tab switches, window blur, fullscreen exits, copy/paste attempts, right clicks, and devtools shortcuts with automated 3-stage warning enforcement and admin overrides.
          </p>
        </div>

        {/* 3-Stage Warning Legend */}
        <div className="flex items-center gap-2 relative z-10 font-mono text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">3-STAGE WARNING RULES</span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-amber-400">W1: Notice</span> • 
              <span className="text-amber-300">W2: Final Warning</span> • 
              <span className="text-red-400 font-bold">W3: Auto-Disqualify</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & ADVANCED FILTERS */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by student name or email..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={filterViolationType}
            onChange={(e) => setFilterViolationType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL VIOLATION TYPES</option>
            <option value="TAB_SWITCH">TAB SWITCHING</option>
            <option value="WINDOW_BLUR">WINDOW BLUR / FOCUS LOSS</option>
            <option value="FULLSCREEN_EXIT">EXIT FULLSCREEN MODE</option>
            <option value="COPY_ATTEMPT">COPY ATTEMPT</option>
            <option value="PASTE_ATTEMPT">PASTE ATTEMPT</option>
            <option value="CONTEXT_MENU_ATTEMPT">RIGHT-CLICK ATTEMPT</option>
            <option value="DEVTOOLS_SHORTCUT">DEVTOOLS SHORTCUT (F12)</option>
          </select>

          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL ROUNDS</option>
            <option value="Round 1">ROUND 1 (SPEED MCQ)</option>
            <option value="Round 2">ROUND 2 (DEBUGGING)</option>
            <option value="Round 3">ROUND 3 (CRASH & FIX)</option>
          </select>

        </div>
      </div>

      {/* 3. REAL-TIME VIOLATION STREAM TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-400 animate-pulse" />
            <h3 className="font-bold text-base text-white">Live Violation Telemetry Feed ({filteredViolations.length})</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">WebSocket Realtime Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Student Candidate</th>
                <th className="px-5 py-4">Violation Event Type</th>
                <th className="px-5 py-4">Round & Question</th>
                <th className="px-5 py-4">Browser Environment</th>
                <th className="px-5 py-4 text-center">Warning Stage</th>
                <th className="px-5 py-4 text-right">Admin Override Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-sans">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                      <span>Fetching proctoring violation logs from Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-sans">
                    No student records available.
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => {
                const isWarning3 = v.warningLevel === 3;
                const isWarning2 = v.warningLevel === 2;

                return (
                  <tr key={v.id} className={`hover:bg-slate-800/50 transition-colors ${isWarning3 ? 'bg-red-950/20' : ''}`}>
                    
                    {/* Hydration Safe Timestamp */}
                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                      {isMounted ? new Date(v.timestamp).toLocaleTimeString() : '17:44:13'}
                    </td>

                    {/* Student Candidate */}
                    <td className="px-5 py-4">
                      <div className="font-sans font-bold text-white text-sm">{v.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{v.studentEmail}</div>
                    </td>

                    {/* Violation Type */}
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border font-mono ${
                        v.violationType === 'TAB_SWITCH' || v.violationType === 'DEVTOOLS_SHORTCUT'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : v.violationType === 'FULLSCREEN_EXIT'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-200 border-slate-700'
                      }`}>
                        {v.violationType}
                      </span>
                    </td>

                    {/* Round & Question */}
                    <td className="px-5 py-4 font-sans text-xs">
                      <div className="text-slate-200 font-semibold">{v.round}</div>
                      <div className="text-[11px] text-amber-400 font-mono">Q #{v.questionNumber}</div>
                    </td>

                    {/* Browser Info */}
                    <td className="px-5 py-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {v.browserInfo}
                    </td>

                    {/* Warning Stage */}
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isWarning3
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : isWarning2
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        STAGE {v.warningLevel} / 3 {isWarning3 && '(DISQUALIFIED)'}
                      </span>
                    </td>

                    {/* Admin Override Action Buttons */}
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedStudentView(v)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 transition-all text-[11px] font-semibold"
                        title="View Student Telemetry"
                      >
                        View Student
                      </button>

                      <button
                        onClick={() => handleSendWarning(v)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all text-[11px] font-semibold"
                        title="Send Manual Warning"
                      >
                        Send Warning
                      </button>

                      <button
                        onClick={() => handleRestoreStudent(v)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all text-[11px] font-semibold"
                        title="Restore Student Session"
                      >
                        Restore
                      </button>

                      <button
                        onClick={() => handleDisqualifyStudent(v)}
                        className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-all text-[11px] font-semibold"
                        title="Disqualify Student"
                      >
                        Disqualify
                      </button>
                    </td>

                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AUDIT HISTORY LOG TRAIL */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Proctor Admin Override Audit Log Trail</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{auditLogs.length} Actions Logged</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-white font-bold flex items-center gap-2">
                  <span className="text-amber-400">[{log.action}]</span>
                  <span>Target: {log.studentName}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{log.details}</p>
              </div>
              <div className="text-right text-slate-500 text-[10px]">
                <div>{isMounted ? new Date(log.timestamp).toLocaleTimeString() : '17:44:13'}</div>
                <div className="text-indigo-400">{log.adminUser}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. VIEW STUDENT TELEMETRY MODAL */}
      {selectedStudentView && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <h3 className="font-bold text-lg text-white">Candidate Malpractice Telemetry</h3>
              </div>
              <button onClick={() => setSelectedStudentView(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">{selectedStudentView.studentName}</div>
                <div className="text-amber-400">{selectedStudentView.studentEmail}</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Violation Event:</span>
                  <span className="text-red-400 font-bold">{selectedStudentView.violationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Round:</span>
                  <span className="text-indigo-400 font-bold">{selectedStudentView.round}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warning Stage:</span>
                  <span className="text-amber-400 font-bold">Stage {selectedStudentView.warningLevel} / 3</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">Browser Environment</span>
                <p className="text-slate-300 text-[11px]">{selectedStudentView.browserInfo}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudentView(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              Close Telemetry Dossier
            </button>
          </div>
        </div>
      )}

      {/* REUSABLE DESTRUCTIVE CONFIRMATION DIALOG SYSTEM */}
      <ConfirmationDialog
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        warningMessage={confirmModalConfig.warningMessage}
        confirmText={confirmModalConfig.isDanger ? 'Disqualify Candidate' : 'Restore Candidate'}
        cancelText="Cancel"
        isDanger={confirmModalConfig.isDanger}
      />

    </div>
  );
}
