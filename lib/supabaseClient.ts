import { createClient } from '@supabase/supabase-js';

// Single source of truth for Supabase client
// All components should import: import { supabase } from '@/lib/supabaseClient'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'orbchat.supabase.auth',
    },
  }
);
