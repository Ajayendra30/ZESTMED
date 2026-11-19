import { createClient } from '@supabase/supabase-js';

// Supabase project credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

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
