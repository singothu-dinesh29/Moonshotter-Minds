'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRecord, UserRole } from '@/types/database';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: UserRecord | null;
  role: UserRole;
  session: any | null;
  isLoading: boolean;
  hasPlayedIntro: boolean;
  markIntroAsPlayed: () => void;
  resetIntroState: () => void;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>({
    id: 'u-demo-1',
    email: 'alex.chen@mit.edu',
    full_name: 'Alex Chen',
    college_name: 'MIT Institute of Technology',
    role_id: 'r-student',
    role: 'STUDENT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [session, setSession] = useState<any | null>({ user: { email: 'alex.chen@mit.edu' } });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState<boolean>(false);
  const router = useRouter();

  // Initialize intro state from sessionStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('symphosium_intro_played');
      if (stored === 'true') {
        setHasPlayedIntro(true);
      }
    }
  }, []);

  const markIntroAsPlayed = () => {
    setHasPlayedIntro(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('symphosium_intro_played', 'true');
    }
  };

  const resetIntroState = () => {
    setHasPlayedIntro(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('symphosium_intro_played');
    }
  };

  useEffect(() => {
    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (event === 'SIGNED_OUT' || !currentSession) {
        resetIntroState();
      }
      if (currentSession?.user) {
        const userEmail = currentSession.user.email || '';
        const userRole = (currentSession.user.user_metadata?.role as UserRole) || 'STUDENT';
        setRole(userRole);
        setUser({
          id: currentSession.user.id,
          email: userEmail,
          full_name: currentSession.user.user_metadata?.full_name || 'Candidate',
          college_name: currentSession.user.user_metadata?.college_name || 'College Candidate',
          role_id: userRole,
          role: userRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Call secure server authentication endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid username or password.');
      }

      const targetRole: UserRole = data.role;
      setRole(targetRole);

      const authenticatedUser: UserRecord = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        college_name: targetRole === 'ADMIN' ? 'Muthayammal Executive Committee' : 'Muthayammal Engineering College',
        role_id: targetRole,
        role: targetRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(authenticatedUser);
      setSession({ user: { email: data.user.email } });
      
      // Set client role cookie for middleware security
      document.cookie = `symphosium_role=${targetRole}; path=/; max-age=604800`;

      // Reset intro played flag so the new post-login session plays the intro animation ONCE
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('symphosium_intro_played');
      }

      // CASE 1: Admin redirect to /admin/dashboard
      // CASE 2: Student redirect to /student/dashboard
      router.push(data.redirectTo || (targetRole === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'));
    } catch (err: any) {
      throw new Error('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    document.cookie = 'symphosium_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('symphosium_intro_played');
    }
    setUser(null);
    setSession(null);
    setRole('STUDENT');
    router.push('/login');
  };

  const sendPasswordReset = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        session,
        isLoading,
        hasPlayedIntro,
        markIntroAsPlayed,
        resetIntroState,
        signIn,
        signOut,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
