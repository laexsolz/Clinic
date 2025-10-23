// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Demo accounts baked in for local demo mode.
 * These exist purely for local/demo usage and will not call Supabase.
 */
const DEMO_USERS: Array<{ email: string; password: string; role: string; fullName: string }> = [
  { email: 'admin@demo.test', password: 'admin123', role: 'admin', fullName: 'Admin Demo' },
  { email: 'doctor@demo.test', password: 'doctor123', role: 'doctor', fullName: 'Dr. Demo' },
  { email: 'patient@demo.test', password: 'patient123', role: 'patient', fullName: 'Patient Demo' },
];

function readLocalSignups() {
  try {
    const raw = localStorage.getItem('demo_users');
    if (!raw) return [];
    return JSON.parse(raw) as Array<{ email: string; password: string; role: string; fullName: string }>;
  } catch {
    return [];
  }
}

function saveLocalSignup(user: { email: string; password: string; role: string; fullName: string }) {
  const arr = readLocalSignups();
  arr.push(user);
  localStorage.setItem('demo_users', JSON.stringify(arr));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // helper to create a "fake" supabase User object from demo info
  const makeFakeUser = (email: string, role: string) => {
    // Minimal fields used by the app — cast to User
    const fake: Partial<User> = {
      id: `demo-${role}-${email}-${Date.now()}`,
      email,
    };
    return fake as User;
  };

  // helper to set demo session (persist demo_user and set state)
  const setDemoSession = (email: string, role: string, fullName?: string) => {
    const demo = { email, role, fullName: fullName ?? email.split('@')[0] };
    localStorage.setItem('demo_user', JSON.stringify(demo));

    const fakeUser = makeFakeUser(email, role);
    setUser(fakeUser);

    const demoProfile = {
      id: fakeUser.id,
      email,
      role,
      full_name: fullName ?? email.split('@')[0],
    } as unknown as UserProfile;

    setProfile(demoProfile);
    setLoading(false);
  };

  // On mount: if demo_user exists, use it and skip supabase subscription.
  // Otherwise do the original Supabase initialization.
  useEffect(() => {
    try {
      const rawDemo = localStorage.getItem('demo_user');
      if (rawDemo) {
        const demo = JSON.parse(rawDemo) as { email: string; role: string; fullName?: string };
        setDemoSession(demo.email, demo.role, demo.fullName);
        // skip supabase subscription in demo mode
        return;
      }
    } catch (err) {
      console.warn('Invalid demo_user found in localStorage, falling back to Supabase init', err);
      // fallthrough to supabase init
    }

    // Supabase initialization (original behavior)
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error getting session:', err);
        setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    // unsubscribe on unmount
    return () => {
      try {
        data.subscription.unsubscribe();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetchProfile: if demo_user exists, use it; otherwise fetch from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const rawDemo = localStorage.getItem('demo_user');
      if (rawDemo) {
        try {
          const demo = JSON.parse(rawDemo) as { email: string; role: string; fullName?: string };
          const demoProfile = {
            id: userId,
            email: demo.email,
            role: demo.role,
            full_name: demo.fullName ?? demo.email.split('@')[0],
          } as unknown as UserProfile;
          setProfile(demoProfile);
          setLoading(false);
          return;
        } catch {
          // fall through and fetch from supabase
        }
      }

      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * signIn:
   *  - first attempt to match demo accounts (built-in or local signups) and sign in locally
   *  - otherwise call Supabase signInWithPassword
   */
  const signIn = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();

    // check built-in demo accounts
    const builtIn = DEMO_USERS.find((u) => u.email.toLowerCase() === normalized && u.password === password);
    if (builtIn) {
      setDemoSession(builtIn.email, builtIn.role, builtIn.fullName);
      return Promise.resolve();
    }

    // check local demo signups saved in localStorage.demo_users
    const local = readLocalSignups().find((u) => u.email.toLowerCase() === normalized && u.password === password);
    if (local) {
      setDemoSession(local.email, local.role, local.fullName);
      return Promise.resolve();
    }

    // fallback to Supabase auth
    const { error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });
    if (error) throw error;
  };

  /**
   * signUp:
   *  - for demo usage we persist the new demo account to localStorage.demo_users and sign in as demo
   *  - otherwise call Supabase.signUp
   */
  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    const normalized = email.trim().toLowerCase();

    // if email collides with a built-in demo or a local demo, throw
    const conflictInBuiltIn = DEMO_USERS.some((u) => u.email.toLowerCase() === normalized);
    const conflictInLocal = readLocalSignups().some((u) => u.email.toLowerCase() === normalized);

    if (conflictInBuiltIn || conflictInLocal) {
      throw new Error('An account with this email already exists (demo).');
    }

    // Save local demo signup and sign in automatically (demo mode)
    saveLocalSignup({ email: normalized, password, role, fullName });
    setDemoSession(normalized, role, fullName);
    return Promise.resolve();

    // If you prefer to use Supabase for real signups, comment out the local-demo block above and
    // uncomment the code below to call supabase.auth.signUp instead:
    /*
    const { error } = await supabase.auth.signUp({
      email: normalized,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });
    if (error) throw error;
    */
  };

  /**
   * signOut:
   *  - if demo_user exists, clear it and reset local state
   *  - otherwise call Supabase signOut
   */
  const signOut = async () => {
    const rawDemo = localStorage.getItem('demo_user');
    if (rawDemo) {
      localStorage.removeItem('demo_user');
      // keep demo_users list, so created demo accounts persist across sessions if desired
      setUser(null);
      setProfile(null);
      setLoading(false);
      return Promise.resolve();
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
