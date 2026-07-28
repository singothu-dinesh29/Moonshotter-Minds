import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, Pause, Play, Clock, Megaphone, UserX, CheckCircle, Search, Filter, Loader2 } from 'lucide-react';

export interface ProctoringIncident {
  id: string;
  candidateName: string;
  candidateEmail: string;
  incidentType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  loggedAt: string;
}

export default function ProctoringDashboard() {
  const [examStatus, setExamStatus] = useState<'LIVE' | 'PAUSED' | 'COMPLETED'>('LIVE');
  const [announcementText, setAnnouncementText] = useState<string>('');
  const [announcements, setAnnouncements] = useState<string[]>([
    'Welcome candidates! Round 1 speed MCQ is active.',
    'System Reminder: Do not exit full screen mode.'
  ]);
  const [logs, setLogs] = useState<ProctoringIncident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchIncidentsFromSupabase = async () => {
    try {
      setIsLoading(true);
      const { data: dbUsers, error } = await supabase
        .from('users')
        .select('id, full_name, email, registrations(anti_cheat_flag_count, status, created_at)')
        .eq('role', 'STUDENT');

      if (!error && dbUsers) {
        const incidents: ProctoringIncident[] = [];
        dbUsers.forEach((u: any, idx: number) => {
          const reg = u.registrations?.[0];
          const flags = reg?.anti_cheat_flag_count || 0;
          if (flags > 0) {
            incidents.push({
              id: `inc-${idx + 1}`,
              candidateName: u.full_name || 'Candidate',
              candidateEmail: u.email,
              incidentType: flags >= 3 ? 'TAB_SWITCH_LIMIT_EXCEEDED' : 'WINDOW_BLUR_DETECTED',
              severity: flags >= 3 ? 'HIGH' : flags === 2 ? 'MEDIUM' : 'LOW',
              loggedAt: reg?.created_at || new Date().toISOString()
            });
          }
        });
        setLogs(incidents);
      }
    } catch (err) {
      console.error('Error fetching proctoring incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsFromSupabase();

    const channel = supabase
      .channel('realtime_proctoring_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => fetchIncidentsFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchIncidentsFromSupabase())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setAnnouncements([announcementText, ...announcements]);
    setAnnouncementText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Global Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Live Proctoring Command Center</h2>
          </div>
          <p className="text-xs text-slate-400">Real-time candidate telemetry, incident surveillance & exam broadcast controls</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExamStatus(examStatus === 'LIVE' ? 'PAUSED' : 'LIVE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg transition-all ${
              examStatus === 'LIVE'
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {examStatus === 'LIVE' ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                Pause Live Exam
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Resume Exam
              </>
            )}
          </button>

          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            Status: <strong className={examStatus === 'LIVE' ? 'text-emerald-400' : 'text-amber-400'}>{examStatus}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Active Incidents Feed & Live Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Logs Feed (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <h3 className="font-bold text-sm text-white">Live Anti-Cheat Anomaly Logs</h3>
            </div>
            <span className="text-xs font-mono bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded border border-red-500/20">
              {logs.length} INCIDENTS LOGGED
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 font-sans text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                <span>Checking live proctoring telemetry...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-sans text-xs border border-dashed border-slate-800 rounded-xl">
                No anti-cheat anomaly incidents logged.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{log.candidateName}</span>
                      <span className="text-slate-400">({log.candidateEmail})</span>
                    </div>
                    <div className="text-slate-400">
                      Incident: <strong className="text-amber-300">{log.incidentType}</strong> | Severity: <strong className="text-red-400">{log.severity}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Logged at: {new Date(log.loggedAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-semibold transition-all">
                    Flag / Disqualify
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Broadcast Announcer (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Megaphone className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Broadcast Announcement</h3>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3 mb-4">
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Type message to broadcast to all candidate screens..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-indigo-600/20"
              >
                Send Realtime Broadcast
              </button>
            </form>

            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sent Broadcasts</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {announcements.map((msg, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs text-slate-300">
                  📣 {msg}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
