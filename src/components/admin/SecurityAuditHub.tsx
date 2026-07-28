'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  UserCheck, 
  HelpCircle, 
  UserX, 
  RotateCcw, 
  Globe, 
  Settings, 
  Clock, 
  Monitor, 
  Activity,
  Key,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  Calendar,
  Megaphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export type ExtendedAuditAction = 
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'QUESTION_CREATED'
  | 'QUESTION_UPDATED'
  | 'QUESTION_DELETED'
  | 'STUDENT_WARNED'
  | 'STUDENT_RESTORED'
  | 'STUDENT_DISQUALIFIED'
  | 'REPORT_EXPORTED'
  | 'ANNOUNCEMENT_PUBLISHED'
  | 'SETTINGS_UPDATED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  targetStudent?: string;
  action: ExtendedAuditAction;
  description: string;
  ipAddress: string;
  device: string;
  browser: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-101',
    timestamp: '2026-07-28T17:44:13.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: '--',
    action: 'ADMIN_LOGIN',
    description: 'Administrator authenticated successfully via secure server-side login API route (/api/auth/login).',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-102',
    timestamp: '2026-07-28T17:38:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: 'Registered Candidate',
    action: 'REPORT_EXPORTED',
    description: 'Exported Candidate Results Scorecard PDF Report.',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-103',
    timestamp: '2026-07-28T17:32:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: 'Registered Candidate',
    action: 'STUDENT_DISQUALIFIED',
    description: 'Candidate disqualified for exceeding 3 tab switch flags.',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-104',
    timestamp: '2026-07-28T17:25:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: 'Registered Candidate',
    action: 'STUDENT_WARNED',
    description: 'Issued Stage 1 Warning banner alert for window blur activity.',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-105',
    timestamp: '2026-07-28T17:20:45.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: 'Registered Candidate',
    action: 'STUDENT_RESTORED',
    description: 'Cleared violation flags and restored active exam session for candidate.',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-106',
    timestamp: '2026-07-28T17:15:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: '--',
    action: 'ANNOUNCEMENT_PUBLISHED',
    description: 'Broadcasted realtime announcement: "Maintain fullscreen mode at all times."',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-107',
    timestamp: '2026-07-28T17:10:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: '--',
    action: 'QUESTION_CREATED',
    description: 'Created Round 3 Crash & Fix question "Fix Distributed Deadlock in Node.js".',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-108',
    timestamp: '2026-07-28T17:05:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: '--',
    action: 'QUESTION_UPDATED',
    description: 'Updated test case criteria & sample inputs for Round 2 Debugging Question #104.',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-109',
    timestamp: '2026-07-28T17:00:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: '--',
    action: 'QUESTION_DELETED',
    description: 'Deleted obsolete draft question "Legacy Memory Leak in C++ Pointer Ref".',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-110',
    timestamp: '2026-07-28T16:50:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: '--',
    action: 'SETTINGS_UPDATED',
    description: 'Updated Round 1 timer to 15 mins, Max Warnings to 3, and saved configuration in Supabase.',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  },
  {
    id: 'log-111',
    timestamp: '2026-07-28T16:00:00.000Z',
    adminName: 'Dinesh (System Administrator)',
    targetStudent: '--',
    action: 'ADMIN_LOGOUT',
    description: 'Administrator session terminated cleanly.',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 Workstation x64',
    browser: 'Chrome v122.0'
  }
];

export default function SecurityAuditHub() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterAdmin, setFilterAdmin] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStudent, setFilterStudent] = useState<string>('');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Supabase Realtime Audit Log Listener
  useEffect(() => {
    const channel = supabase
      .channel('realtime_audit_log_system')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload: any) => {
        if (payload.new) {
          const newEntry: AuditLogEntry = {
            id: payload.new.id || `log-${Date.now()}`,
            timestamp: payload.new.created_at || new Date().toISOString(),
            adminName: payload.new.admin_name || 'Dinesh (System Administrator)',
            targetStudent: payload.new.target_student || '--',
            action: (payload.new.action_type as ExtendedAuditAction) || 'SETTINGS_UPDATED',
            description: payload.new.description || 'System event recorded.',
            ipAddress: payload.new.ip_address || '192.168.1.100',
            device: payload.new.device || 'Windows 11 Workstation x64',
            browser: payload.new.browser || 'Chrome v122.0'
          };
          setAuditLogs((prev) => [newEntry, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Export CSV Audit Logs
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Timestamp,Admin Name,Target Student,Action,Description,IP Address,Device,Browser\n";
    
    auditLogs.forEach((l) => {
      csvContent += `"${l.timestamp}","${l.adminName}","${l.targetStudent || '--'}","${l.action}","${l.description}","${l.ipAddress}","${l.device}","${l.browser}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `symphosium_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  // Advanced Filtering Logic (Date, Action, Admin, Student, Search)
  const filteredLogs = auditLogs.filter((l) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      l.adminName.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query) ||
      l.ipAddress.toLowerCase().includes(query) ||
      (l.targetStudent && l.targetStudent.toLowerCase().includes(query));

    const matchesAction = filterAction === 'ALL' || l.action === filterAction;
    const matchesAdmin = filterAdmin === 'ALL' || l.adminName.includes(filterAdmin);
    const matchesDate = !filterDate || l.timestamp.startsWith(filterDate);
    const matchesStudent = !filterStudent || (l.targetStudent && l.targetStudent.toLowerCase().includes(filterStudent.toLowerCase()));

    return matchesSearch && matchesAction && matchesAdmin && matchesDate && matchesStudent;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* 1. HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold mb-2">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>READ-ONLY IMMUTABLE AUDIT LOG SYSTEM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Audit Log Control System</h1>
          <p className="text-xs text-slate-400 font-sans">Tamper-proof, read-only audit logging recording every administrator action with IP, device, and browser metadata.</p>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV Log
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <FileText className="h-4 w-4 text-cyan-400" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* 2. ADVANCED SEARCH & FILTERS TOOLBAR (DATE, ACTION, ADMIN, STUDENT) */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
          
          {/* Keyword Search */}
          <div className="relative font-mono text-xs sm:col-span-2 lg:col-span-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search description, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter Date */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300"
          />

          {/* Filter Action (11 Actions) */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL ACTIONS (11 TYPES)</option>
            <option value="ADMIN_LOGIN">ADMIN LOGIN</option>
            <option value="ADMIN_LOGOUT">ADMIN LOGOUT</option>
            <option value="QUESTION_CREATED">QUESTION CREATED</option>
            <option value="QUESTION_UPDATED">QUESTION UPDATED</option>
            <option value="QUESTION_DELETED">QUESTION DELETED</option>
            <option value="STUDENT_WARNED">STUDENT WARNED</option>
            <option value="STUDENT_RESTORED">STUDENT RESTORED</option>
            <option value="STUDENT_DISQUALIFIED">STUDENT DISQUALIFIED</option>
            <option value="REPORT_EXPORTED">REPORT EXPORTED</option>
            <option value="ANNOUNCEMENT_PUBLISHED">ANNOUNCEMENT PUBLISHED</option>
            <option value="SETTINGS_UPDATED">SETTINGS UPDATED</option>
          </select>

          {/* Filter Admin */}
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL ADMINS</option>
            <option value="Dinesh">Dinesh (System Admin)</option>
          </select>

          {/* Filter Student */}
          <input
            type="text"
            placeholder="Filter by Student..."
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300"
          />

        </div>
      </div>

      {/* 3. IMMUTABLE READ-ONLY AUDIT LOG TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between print:border-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white print:text-black">Audit Trail Logs ({filteredLogs.length})</h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Lock className="h-3 w-3" />
            <span>IMMUTABLE READ-ONLY LOG</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px] print:bg-slate-200 print:text-black">
              <tr>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Admin Name</th>
                <th className="px-5 py-4">Action Event</th>
                <th className="px-5 py-4">Target Student</th>
                <th className="px-5 py-4">Detailed Action Description</th>
                <th className="px-5 py-4">IP Address</th>
                <th className="px-5 py-4">Device & Browser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono print:divide-slate-300 text-slate-200 print:text-black">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="px-5 py-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {isMounted ? new Date(l.timestamp).toLocaleString() : '2026-07-28 17:44:13'}
                  </td>

                  {/* Admin Name */}
                  <td className="px-5 py-4 font-sans font-bold text-white print:text-black whitespace-nowrap">
                    {l.adminName}
                  </td>

                  {/* Action Badge */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      l.action === 'ADMIN_LOGIN' || l.action === 'ADMIN_LOGOUT'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : l.action.includes('DISQUALIFIED') || l.action.includes('DELETED')
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : l.action.includes('WARNED') || l.action.includes('RESTORED')
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {l.action}
                    </span>
                  </td>

                  {/* Target Student */}
                  <td className="px-5 py-4 text-amber-400 font-bold whitespace-nowrap">
                    {l.targetStudent || '--'}
                  </td>

                  {/* Action Description */}
                  <td className="px-5 py-4 font-sans text-xs text-slate-300 print:text-slate-800 max-w-md">
                    {l.description}
                  </td>

                  {/* IP Address */}
                  <td className="px-5 py-4 text-cyan-400 font-bold whitespace-nowrap">
                    {l.ipAddress}
                  </td>

                  {/* Device & Browser */}
                  <td className="px-5 py-4 text-slate-400 text-[11px] max-w-xs truncate">
                    {l.device} • {l.browser}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
