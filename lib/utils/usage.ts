import { supabase } from '@/lib/supabaseClient';
import type { PlanType } from '@/lib/planConfig';

const GUEST_ID_KEY = 'guest_id';

/**
 * Generate or retrieve guest ID from localStorage
 */
export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') {
    return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    // Generate UUID-like guest ID
    guestId = `guest_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

/**
 * Get current user plan (guest, free, or pro)
 * Returns 'guest' if user is not authenticated
 */
export async function getCurrentPlan(): Promise<PlanType> {
  if (typeof window === 'undefined') return 'guest';

  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return 'guest';
    }

    const uid = session.session.user.id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('user_id', uid)
      .maybeSingle();

    const plan = profile?.plan || 'free';
    // Validate plan type
    if (plan === 'guest' || plan === 'free' || plan === 'pro') {
      return plan as PlanType;
    }
    return 'free'; // Default fallback
  } catch {
    return 'guest';
  }
}

/**
 * Get usage count for current user/guest
 * Returns messages_used and deepsearch_used counts from user_usage table
 */
export async function getUsageCount(): Promise<{ 
  messagesUsed: number; 
  deepsearchUsed: number; 
  lastReset: string | null 
}> {
  if (typeof window === 'undefined') {
    return { messagesUsed: 0, deepsearchUsed: 0, lastReset: null };
  }

  try {
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;

    if (isAuthenticated && session?.session?.user) {
      const uid = session.session.user.id;
      const { data: usage } = await supabase
        .from('user_usage')
        .select('messages_used, deepsearch_used, last_reset')
        .eq('user_id', uid)
        .maybeSingle();

      return {
        messagesUsed: usage?.messages_used || 0,
        deepsearchUsed: usage?.deepsearch_used || 0,
        lastReset: usage?.last_reset || null,
      };
    } else {
      // Guest user - use guest_id
      const guestId = getOrCreateGuestId();
      const { data: usage } = await supabase
        .from('user_usage')
        .select('messages_used, deepsearch_used, last_reset')
        .eq('guest_id', guestId)
        .maybeSingle();

      return {
        messagesUsed: usage?.messages_used || 0,
        deepsearchUsed: usage?.deepsearch_used || 0,
        lastReset: usage?.last_reset || null,
      };
    }
  } catch {
    return { messagesUsed: 0, deepsearchUsed: 0, lastReset: null };
  }
}

/**
 * Check if usage period needs reset (24 hours passed)
 */
export function shouldResetUsage(lastReset: string | null): boolean {
  if (!lastReset) return true;

  const start = new Date(lastReset);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 24;
}

/**
 * Increment usage count (server-side only)
 * This function should be called from server-side code only (/api/chat route)
 * It uses a Supabase client that should have service role key
 */
export async function incrementUsage(
  userId: string | null,
  guestId: string | null,
  plan: PlanType,
  supabaseClient?: any, // Pass Supabase client from server-side
  isDeepsearchEnabled: boolean = false // Whether this request used deepsearch
): Promise<void> {
  try {
    // This function should only be called from server-side
    // The supabaseClient should be passed from /api/chat route
    if (!supabaseClient) {
      console.warn('incrementUsage called without Supabase client - skipping');
      return;
    }

    const now = new Date().toISOString();

    if (userId) {
      // Authenticated user
      const { data: existing } = await supabaseClient
        .from('user_usage')
        .select('messages_used, deepsearch_used, last_reset')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Check if period needs reset (24 hours passed)
        if (shouldResetUsage(existing.last_reset)) {
          // Reset usage
          await supabaseClient
            .from('user_usage')
            .update({
              messages_used: 1,
              deepsearch_used: isDeepsearchEnabled ? 1 : 0,
              last_reset: now,
            })
            .eq('user_id', userId);
        } else {
          // Increment usage
          const updates: any = {
            messages_used: (existing.messages_used || 0) + 1,
          };
          if (isDeepsearchEnabled) {
            updates.deepsearch_used = (existing.deepsearch_used || 0) + 1;
          }
          await supabaseClient
            .from('user_usage')
            .update(updates)
            .eq('user_id', userId);
        }
      } else {
        // Create new usage record
        await supabaseClient.from('user_usage').insert({
          user_id: userId,
          plan,
          messages_used: 1,
          deepsearch_used: isDeepsearchEnabled ? 1 : 0,
          last_reset: now,
        });
      }
    } else if (guestId) {
      // Guest user
      const { data: existing } = await supabaseClient
        .from('user_usage')
        .select('messages_used, deepsearch_used, last_reset')
        .eq('guest_id', guestId)
        .maybeSingle();

      if (existing) {
        // Check if period needs reset (24 hours passed)
        if (shouldResetUsage(existing.last_reset)) {
          // Reset usage
          await supabaseClient
            .from('user_usage')
            .update({
              messages_used: 1,
              deepsearch_used: isDeepsearchEnabled ? 1 : 0,
              last_reset: now,
            })
            .eq('guest_id', guestId);
        } else {
          // Increment usage
          const updates: any = {
            messages_used: (existing.messages_used || 0) + 1,
          };
          if (isDeepsearchEnabled) {
            updates.deepsearch_used = (existing.deepsearch_used || 0) + 1;
          }
          await supabaseClient
            .from('user_usage')
            .update(updates)
            .eq('guest_id', guestId);
        }
      } else {
        // Create new usage record
        await supabaseClient.from('user_usage').insert({
          guest_id: guestId,
          plan: 'guest',
          messages_used: 1,
          deepsearch_used: isDeepsearchEnabled ? 1 : 0,
          last_reset: now,
        });
      }
    }
  } catch (error) {
    console.error('Failed to increment usage:', error);
    // Don't throw - usage tracking failure shouldn't block chat
  }
}

