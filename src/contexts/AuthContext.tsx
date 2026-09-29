import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { academicService } from '../services/academicService';
import { dbStore } from '../services/dbStore';
import { api } from '../services/api';
import { SEED_STUDENTS, SEED_ADMIN } from '../services/seedData';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password?: string, selectedRole?: UserRole) => Promise<void>;
  register: (profileData: Partial<Profile> & { password?: string }) => Promise<void>;
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
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const profile = await academicService.getProfile(session.user.id);
              if (profile) {
                setUser(profile);
              } else {
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
              initLocalSession();
            }
            setLoading(false);
          });

          authListenerCleanup = () => authListener.subscription.unsubscribe();
          await supabase.auth.getSession();
        } catch {
          initLocalSession();
        }
      } else {
        initLocalSession();
      }
    }

    function initLocalSession() {
      const savedUserRaw = localStorage.getItem('scc_current_user_v1');
      if (savedUserRaw) {
        try {
          setUser(JSON.parse(savedUserRaw));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    initAuth();

    return () => {
      if (authListenerCleanup) authListenerCleanup();
    };
  }, []);

  const register = async (profileData: Partial<Profile> & { password?: string }) => {
    setLoading(true);
    try {
      let registeredUser: Profile | null = null;
      try {
        const res = await api.register(profileData);
        if (res && res.user) {
          registeredUser = res.user;
        }
      } catch (err: any) {
        // Fallback to local DB store if remote backend offline
        const localProfiles = dbStore.getProfiles();
        const existingEmail = localProfiles.find(p => p.email.toLowerCase() === profileData.email?.toLowerCase());
        if (existingEmail) {
          throw new Error('An account with this email address already exists.');
        }
        if (profileData.role === 'student' && profileData.register_number) {
          const existingReg = localProfiles.find(p => p.role === 'student' && p.register_number?.toUpperCase() === profileData.register_number?.toUpperCase());
          if (existingReg) {
            throw new Error('A student with this Register Number already exists.');
          }
        }

        const newId = (profileData.role === 'admin' ? 'admin-' : 'student-') + Date.now();
        registeredUser = {
          id: newId,
          email: profileData.email || '',
          full_name: profileData.full_name || '',
          role: profileData.role || 'student',
          register_number: profileData.register_number,
          department: profileData.department || 'Computer Science & Engineering',
          year: profileData.year || '4th Year',
          section: profileData.section || 'A',
          phone: profileData.phone || '',
          dob: profileData.dob || '',
          college_name: profileData.college_name || 'Smart Campus University'
        };
        dbStore.addProfile(registeredUser);
      }

      if (registeredUser) {
        setUser(registeredUser);
        localStorage.setItem('scc_current_user_v1', JSON.stringify(registeredUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password?: string, selectedRole: UserRole = 'student') => {
    setLoading(true);
    try {
      let loggedUser: Profile | null = null;
      try {
        const res = await api.login({ email, password, role: selectedRole });
        if (res && res.user) {
          loggedUser = res.user;
        }
      } catch (err: any) {
        // Local fallback lookup
        const profiles = dbStore.getProfiles();
        const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

        if (found) {
          if (found.role !== selectedRole) {
            throw new Error(`This email belongs to a ${found.role} account, not ${selectedRole}.`);
          }
          loggedUser = found;
        } else {
          throw new Error('No account found with this email. Please register a new account.');
        }
      }

      if (loggedUser) {
        setUser(loggedUser);
        localStorage.setItem('scc_current_user_v1', JSON.stringify(loggedUser));
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
      localStorage.setItem('scc_current_user_v1', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      loading,
      login,
      register,
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
