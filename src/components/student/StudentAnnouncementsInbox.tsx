'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Bell, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';

export interface StudentNotice {
  id: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
}

export default function StudentAnnouncementsInbox() {
  const [notices, setNotices] = useState<StudentNotice[]>([
    {
      id: 'sn-1',
      title: 'Welcome Candidates & Exam Rules Reminder',
      content: 'Welcome candidates! Round 1 speed MCQ is active. Make sure your browser remains in full screen mode.',
      time: '10:00 AM',
      isRead: false
    },
    {
      id: 'sn-2',
      title: 'Round 2 Algorithmic Debugging Active',
      content: 'Round 2 code debugging is now live. Open Monaco Editor and fix the logic flaw in solution.js.',
      time: '10:15 AM',
      isRead: false
    }
  ]);

  const [toastNotice, setToastNotice] = useState<StudentNotice | null>(null);

  // Simulate incoming real-time broadcast notification toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const liveToast: StudentNotice = {
        id: `sn-toast-${Date.now()}`,
        title: '📣 Realtime Alert: 10 Minutes Remaining in Exam',
        content: 'System Notice: Only 10 minutes remaining in current examination round. Save and validate code.',
        time: new Date().toLocaleTimeString(),
        isRead: false
      };
      setNotices((prev) => [liveToast, ...prev]);
      setToastNotice(liveToast);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const markAllRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notices.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      
      {/* Realtime Toast Alert Modal */}
      {toastNotice && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-slate-900 border border-indigo-500/50 p-4 rounded-xl shadow-2xl space-y-2 animate-bounce">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>REALTIME BROADCAST ALERT</span>
            </div>
            <button onClick={() => setToastNotice(null)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">{toastNotice.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{toastNotice.content}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-400" />
            Candidate Broadcast Inbox
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
                {unreadCount} UNREAD
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">Real-time announcement feeds pushed from symposium organizers</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Notice List */}
      <div className="space-y-3 font-mono text-xs">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-2xl border transition-all ${
              !n.isRead
                ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 opacity-80'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold font-sans">{n.title}</span>
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
              </div>
              <span className="text-slate-500 text-[11px]">{n.time}</span>
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
