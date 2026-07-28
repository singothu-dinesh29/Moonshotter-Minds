'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  HelpCircle,
  Users,
  ShieldAlert,
  AlertOctagon,
  Award,
  BarChart3,
  Megaphone,
  Settings,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Terminal,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Question Bank', href: '/admin/questions', icon: HelpCircle },
  { name: 'Student Management', href: '/admin/students', icon: Users, badge: '1,248' },
  { name: 'Live Exam Monitoring', href: '/admin/monitor', icon: ShieldAlert, badge: 'LIVE' },
  { name: 'Malpractice Monitor', href: '/admin/malpractice', icon: AlertOctagon, badge: '4 Logs' },
  { name: 'Results', href: '/admin/results', icon: Award },
  { name: 'Reports', href: '/admin/statistics', icon: BarChart3 },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Event Settings', href: '/admin/settings', icon: Settings },
  { name: 'System Logs', href: '/admin/logs', icon: FileText },
  { name: 'Profile', href: '/admin/profile', icon: User },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#081120] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. LEFT DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-950/90 border-r border-slate-800/80 shrink-0 sticky top-0 h-screen z-40">
        
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-md">
            <Image
              src="/images/college_logo.png"
              alt="Muthayammal Emblem"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight">SYMPHOSIUM</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Muthayammal AI & ML Dept</p>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          <div className="text-[10px] font-mono text-slate-500 px-3 pb-2 uppercase tracking-wider font-semibold">
            Admin Modules
          </div>

          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        : item.badge.includes('Logs')
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout Button */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-bold text-white truncate">{user?.full_name || 'Dinesh (Admin)'}</p>
              <p className="text-[10px] text-amber-400 font-mono">System Administrator</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* 2. MAIN CONTENT AREA WITH TOP NAVIGATION */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
            >
              {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb Path Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-amber-400 transition-colors">
                Admin
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-white font-bold capitalize">
                {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Top Nav Controls */}
          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SERVER ONLINE • PORT 3000</span>
            </div>

            {/* Notification Bell */}
            <button 
              aria-label="Notifications"
              className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 relative"
            >
              <Bell className="h-4 w-4 text-amber-400" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400" />
            </button>
          </div>

        </header>

        {/* MOBILE DRAWER SIDEBAR */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -250 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -250 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="font-extrabold text-white text-sm">ADMIN MODULES</span>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
                      >
                        <Icon className="h-4 w-4 text-amber-400" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => signOut()}
                className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN PAGE VIEW INJECTION */}
        <main className="flex-1">
          {children}
        </main>

      </div>

    </div>
  );
}
