import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { academicService } from '../services/academicService';
import { dbStore } from '../services/dbStore';
import { SEED_STUDENTS, SEED_ADMIN } from '../services/seedData';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  loginAsDemoStudent: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let authListenerCleanup: (() => void) | null = null;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          // First set up the auth state listener BEFORE checking the session
          // This avoids a race condition where the session check fires before
          // the listener is registered
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const profile = await academicService.getProfile(session.user.id);
              if (profile) {
                setUser(profile);
              } else {
                // Fallback profile construction if Supabase profile row missing
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  role: (session.user.user_metadata?.role as UserRole) || 'student',
                  department: 'Computer Science & Engineering',
                  year: '4th Year',
                  register_number: '21CS042'
                });
              }
            } else {
              // No session — check localStorage fallback for demo mode
              const savedUserRaw = localStorage.getItem('scc_current_user_v1');
              if (savedUserRaw) {
                try { setUser(JSON.parse(savedUserRaw)); } catch { setUser(null); }
              } else {
                setUser(null);
              }
            }
            setLoading(false);
          });

          authListenerCleanup = () => authListener.subscription.unsubscribe();

          // Now check current session — this will trigger onAuthStateChange if a session exists
          await supabase.auth.getSession();

          // Safety timeout: if onAuthStateChange hasn't fired after 3s, unblock loading
          const safetyTimer = setTimeout(() => setLoading(false), 3000);
          authListenerCleanup = () => {
            clearTimeout(safetyTimer);
            authListener.subscription.unsubscribe();
          };
        } catch (err) {
          console.error('[Auth] Supabase init error, falling back to local mode:', err);
          // Fall through to local mode on any Supabase error
          initLocalMode();
        }
      } else {
        initLocalMode();
      }
    }

    function initLocalMode() {
      // Standalone / LocalStorage session initialization
      const savedUserRaw = localStorage.getItem('scc_current_user_v1');
      if (savedUserRaw) {
        try {
          setUser(JSON.parse(savedUserRaw));
        } catch {
          // Corrupted data — reset to demo student
          setUser(SEED_STUDENTS[0]);
          localStorage.setItem('scc_current_user_v1', JSON.stringify(SEED_STUDENTS[0]));
        }
      } else {
        // Default to student demo user for instant interactive preview
        setUser(SEED_STUDENTS[0]);
        localStorage.setItem('scc_current_user_v1', JSON.stringify(SEED_STUDENTS[0]));
      }
      setLoading(false);
    }

    initAuth();

    return () => {
      if (authListenerCleanup) authListenerCleanup();
    };
  }, []);

  const login = async (email: string, selectedRole: UserRole = 'student') => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Sign in via Supabase magic link / auth
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      } else {
        // Standalone mock login based on email / role lookup
        const profiles = dbStore.getProfiles();
        let found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (!found) {
          found = {
            id: 'user-' + Date.now(),
            email,
            full_name: email.split('@')[0],
            role: selectedRole,
            department: 'Computer Science & Engineering',
            year: '4th Year',
            register_number: '21CS' + Math.floor(100 + Math.random() * 899)
          };
        }
        setUser(found);
        localStorage.setItem('scc_current_user_v1', JSON.stringify(found));
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoStudent = () => {
    const student = SEED_STUDENTS[0];
    setUser(student);
    localStorage.setItem('scc_current_user_v1', JSON.stringify(student));
  };

  const loginAsDemoAdmin = () => {
    const admin = SEED_ADMIN;
    setUser(admin);
    localStorage.setItem('scc_current_user_v1', JSON.stringify(admin));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('scc_current_user_v1');
  };

  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = await academicService.updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
      if (!isSupabaseConfigured) {
        localStorage.setItem('scc_current_user_v1', JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      loading,
      login,
      loginAsDemoStudent,
      loginAsDemoAdmin,
      logout,
      updateUserProfile,
      isConfigured: isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
