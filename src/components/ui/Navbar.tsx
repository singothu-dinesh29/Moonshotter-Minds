'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Menu, 
  X, 
  UserPlus, 
  LogIn,
  User,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface NavLinkItem {
  name: string;
  href: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { name: 'Home', href: '/#home' },
  { name: 'About', href: '/#about' },
  { name: 'Symposium', href: '/#symposium' },
  { name: 'Rounds', href: '/#rounds' },
  { name: 'Schedule', href: '/#schedule' },
  { name: 'Rules', href: '/#rules' },
  { name: 'Gallery', href: '/#gallery' },
  { name: 'FAQ', href: '/#faq' },
  { name: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Smooth section navigation handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, name: string) => {
    setActiveLink(name);
    setIsMobileMenuOpen(false);

    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
  };

  // Scroll Listener for Glassmorphism Transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0A111E]/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-2xl py-3' 
          : 'bg-[#0A111E]/80 backdrop-blur-sm border-b border-[#D4AF37]/10 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#15803D] p-0.5 shadow-lg shadow-[#D4AF37]/15 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-[#0A111E] rounded-[10px] flex items-center justify-center">
              <Terminal className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-extrabold text-xl tracking-tight text-white">SYMPHOSIUM</span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hidden sm:inline">
                2026
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans hidden sm:block">Muthayammal Engineering College</p>
          </div>
        </Link>

        {/* CENTER DESKTOP NAVIGATION LINKS WITH ANIMATED UNDERLINE */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.name;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.name)}
                className={`relative text-xs font-medium tracking-wide transition-colors py-1 ${
                  isActive ? 'text-amber-300 font-semibold' : 'text-slate-300 hover:text-amber-200'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#15803D] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT ACTIONS: LOGGED-IN ACCOUNT DISPLAY OR LOGIN & REGISTER CTAS */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-[#D4AF37]/40 hover:border-[#D4AF37]/80 text-white transition-all shadow-md group"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#B8860B] to-emerald-600 flex items-center justify-center text-[11px] font-bold font-mono text-white">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold font-sans text-amber-300 group-hover:text-amber-200 transition-colors">
                    {user.full_name || user.email}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                    {role === 'ADMIN' ? 'Administrator' : 'Candidate Account'}
                  </span>
                </div>
              </Link>

              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-full bg-slate-950 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                title="Logout Account"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F192C] hover:bg-[#182640] text-slate-200 text-xs font-medium border border-[#D4AF37]/30 transition-all hover:border-[#D4AF37]/60"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-400" />
                <span>Login</span>
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-900/30 border border-emerald-500/30 hover:scale-105"
              >
                <UserPlus className="h-3.5 w-3.5 text-amber-300" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
          className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

      </div>

      {/* MOBILE DRAWER MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md px-6 py-6 space-y-4 overflow-hidden"
          >
            <nav className="flex flex-col space-y-3 font-semibold text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.name)}
                  className="text-slate-300 hover:text-white py-1 transition-colors border-b border-slate-900"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="pt-2 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{user.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-center text-white font-bold text-xs"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                    className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-center font-semibold text-xs border border-red-500/30"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-lg bg-slate-900 text-center text-slate-200 font-semibold text-xs border border-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-lg bg-amber-500 text-center text-slate-950 font-bold text-xs shadow-md"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
