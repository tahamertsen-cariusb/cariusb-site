import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Create Supabase server client with cookies
 * Use this in server actions, route handlers, and server components
 * 
 * Note: This is a simplified version that works without @supabase/ssr
 * For proper cookie handling, consider installing @supabase/ssr
 */
export async function createClient() {
  const cookieStore = await cookies();
  
  // Get auth tokens from cookies
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // We handle sessions via cookies
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
    }
  );

  // Set session if tokens exist
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return supabase;
}

