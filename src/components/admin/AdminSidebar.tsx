'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  HelpCircle, 
  PlusCircle, 
  Sliders, 
  Clock, 
  Award, 
  Trophy, 
  Megaphone, 
  FileCheck, 
  Settings,
  ShieldAlert,
  Terminal
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Admin Control Centre', href: '/admin/control', icon: Sliders },
    { label: 'Platform Statistics', href: '/admin/statistics', icon: BarChart3 },
    { label: 'Student Management', href: '/admin/students', icon: Users },
    { label: 'Live Proctoring', href: '/admin/monitor', icon: ShieldAlert },
    { label: 'Question Bank', href: '/admin/questions', icon: HelpCircle },
    { label: 'MCQ Builder', href: '/admin/builder/mcq', icon: PlusCircle },
    { label: 'Coding Builder', href: '/admin/builder/coding', icon: Terminal },
    { label: 'Debugging Builder', href: '/admin/builder/debugging', icon: Sliders },
    { label: 'Round Management', href: '/admin/rounds', icon: Sliders },
    { label: 'Timer Controls', href: '/admin/timer', icon: Clock },
    { label: 'Results & Exports', href: '/admin/results', icon: Award },
    { label: 'Master Leaderboard', href: '/admin/leaderboard', icon: Trophy },
    { label: 'Live Announcements', href: '/admin/announcements', icon: Megaphone },
    { label: 'Certificates Pipeline', href: '/admin/certificates', icon: FileCheck },
    { label: 'Event Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider px-3 block mb-2">
            ADMINISTRATION HUB
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
        <span className="text-[10px] font-mono text-slate-500 block">SYSTEM STATUS</span>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>All 19 DB Tables Online</span>
        </div>
      </div>
    </aside>
  );
}
