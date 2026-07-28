'use client';

import React, { useState } from 'react';
import { 
  Megaphone, 
  Send, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Bell, 
  Radio, 
  Clock, 
  Users, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'ROUND_1_MCQ' | 'ROUND_2_DEBUGGING' | 'ROUND_3_CRASH_FIX';
  createdAt: string;
  isBroadcasted: boolean;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [];

export default function AnnouncementsHub() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Create / Edit Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<AnnouncementItem['targetAudience']>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmAnnId, setDeleteConfirmAnnId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      // Edit existing
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, title, content, targetAudience } : a))
      );
      setEditingId(null);
      alert('Announcement updated successfully!');
    } else {
      // Create new & broadcast via Realtime
      const newAnn: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title,
        content,
        targetAudience,
        createdAt: new Date().toLocaleTimeString(),
        isBroadcasted: true
      };
      setAnnouncements([newAnn, ...announcements]);
      alert('Announcement created & broadcasted live to all candidate screens via Supabase Realtime WebSockets!');
    }

    setTitle('');
    setContent('');
  };

  const handleEdit = (a: AnnouncementItem) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setTargetAudience(a.targetAudience);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmAnnId(id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* 1. HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-5 w-5 text-indigo-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">REALTIME WEBSOCKET BROADCASTER</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Live Announcements & Candidate Notifications</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Create, edit, and push real-time broadcast banners directly to active candidate exam arena screens.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
          WebSocket Channel: <strong className="text-white">announcements_live</strong>
        </span>
      </div>

      {/* 2. FORM & BROADCAST FEED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Create / Edit Form */}
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-400" />
              {editingId ? 'Edit Announcement' : 'Broadcast New Announcement'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Candidate Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">All Active Exam Candidates (Global Broadcast)</option>
              <option value="ROUND_1_MCQ">Round 1 Speed MCQ Candidates</option>
              <option value="ROUND_2_DEBUGGING">Round 2 Algorithmic Debugging Candidates</option>
              <option value="ROUND_3_CRASH_FIX">Round 3 Crash & Fix Candidates</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Announcement Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Urgent Exam Rules Update"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Announcement Message Content</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write broadcast message to push to candidate screens..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {editingId ? 'Update Announcement' : 'Push Realtime Broadcast'}
          </button>
        </form>

        {/* Right Col: Sent Announcement Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan-400" /> Active Broadcast Feed
            </h3>
            <span className="text-xs font-mono text-slate-400">{announcements.length} Sent</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-sans text-xs border border-dashed border-slate-800 rounded-xl">
                No announcements created yet. Broadcast your first announcement above.
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                        {a.targetAudience}
                      </span>
                      <span className="text-slate-400 text-[11px]">{a.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(a)}
                        className="p-1 text-slate-400 hover:text-indigo-300 transition-colors"
                        title="Edit Announcement"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-sans font-bold text-sm text-white">{a.title}</h4>
                  <p className="font-sans text-xs text-slate-300 leading-relaxed">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* REUSABLE DESTRUCTIVE DELETE ANNOUNCEMENT CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={Boolean(deleteConfirmAnnId)}
        onClose={() => setDeleteConfirmAnnId(null)}
        onConfirm={() => {
          if (deleteConfirmAnnId) {
            setAnnouncements((prev) => prev.filter((a) => a.id !== deleteConfirmAnnId));
            setDeleteConfirmAnnId(null);
          }
        }}
        title="Delete Realtime Announcement"
        description="Are you sure you want to delete this broadcast announcement?"
        warningMessage="This action will remove the notification banner from all active candidate screens immediately."
        confirmText="Delete Announcement"
        cancelText="Cancel"
        isDanger={true}
      />

    </div>
  );
}
