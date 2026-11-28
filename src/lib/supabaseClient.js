import { createClient } from '@supabase/supabase-js';

const DEFAULT_PROJECT_URL = 'https://axkjlnbycmcxfhstzbxd.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_ktqD2iORnTrX53Ql-E0VQg_siqsX-3o';

// Supabase project credentials from Vite / Next environment variables
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const rawUrl =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  DEFAULT_PROJECT_URL;
const supabaseUrl = rawUrl.includes('placeholder') ? DEFAULT_PROJECT_URL : rawUrl;

const rawKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_ANON_KEY;
const supabaseAnonKey = rawKey.includes('placeholder') ? DEFAULT_ANON_KEY : rawKey;

// Check if valid Supabase configuration is present
export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder') &&
    (supabaseAnonKey.startsWith('sb_publishable_') || supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.length >= 20)
  );
};

// Initialize the Supabase PostgreSQL client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

export default supabase;
