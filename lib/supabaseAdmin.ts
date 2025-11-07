/**
 * Server-only Supabase admin client
 * 
 * Uses service role key - NEVER falls back to anon key.
 * This client bypasses RLS and should only be used server-side.
 * 
 * DO NOT import this in client components - it will expose the service role key.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required - no fallback to anon key allowed');
}

/**
 * Server-only Supabase admin client with service role key
 * Bypasses RLS - use only for admin operations on the server
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Server-side: no session persistence
  },
});



