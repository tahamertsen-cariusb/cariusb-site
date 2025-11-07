'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { signOut } from '@/lib/actions/signout';
import { useChatSessionStore } from '@/store/useChatSession';
import { supabase } from '@/lib/supabaseClient';

export interface LogoutOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Client-side logout hook
 * - Calls server action to revoke session
 * - Also calls client-side signOut for immediate UI update
 * - Resets session_id store
 * - Redirects to specified route (default: "/")
 */
export function useLogout() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const resetSessionId = useChatSessionStore((state) => state.resetSessionId);

  const logout = async (options?: LogoutOptions) => {
    const { redirectTo = '/', onSuccess, onError } = options || {};

    startTransition(async () => {
      try {
        // Call client-side signOut - this revokes the refresh token
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('Client signOut error:', error);
          // Continue anyway - we'll still clear local state
        }

        // Call server action to revalidate paths
        await signOut();

        // Reset session_id to avoid cross-user bleed
        resetSessionId();

        // Clear localStorage user data (if any)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('orb.user');
          localStorage.removeItem('user');
        }

        // Call success callback
        onSuccess?.();

        // Trigger auth state change event for other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('supabase-auth'));
        }

        // Redirect (client-side to avoid flash)
        router.replace(redirectTo as any);
      } catch (error: any) {
        console.error('Logout error:', error);
        onError?.(error.message || 'Logout failed');
      }
    });
  };

  return { logout, isPending };
}

/**
 * Standalone logout function (for use outside React components)
 * Falls back to API route if server action is not available
 */
export async function logout(options?: LogoutOptions): Promise<void> {
  const { redirectTo = '/', onSuccess, onError } = options || {};

  try {
    // Call client-side signOut - this revokes the refresh token
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Client signOut error:', error);
      // Continue anyway - we'll still clear local state
    }

    // Call server action to revalidate paths
    await signOut();

    // Reset session_id
    if (typeof window !== 'undefined') {
      const { useChatSessionStore } = await import('@/store/useChatSession');
      useChatSessionStore.getState().resetSessionId();
      localStorage.removeItem('orb.user');
      localStorage.removeItem('user');
    }

    onSuccess?.();
    
    // Trigger auth state change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('supabase-auth'));
      window.location.href = redirectTo;
    }
  } catch (error: any) {
    console.error('Logout error:', error);
    onError?.(error.message || 'Logout failed');
  }
}

