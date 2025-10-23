import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don’t crash — log a warning and let the app continue.
  console.warn(
    '⚠️ Missing Supabase environment variables. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (e.g. Vercel project settings).'
  );
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}
