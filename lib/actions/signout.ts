'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server action to sign out user
 * Note: Supabase stores auth in localStorage on client-side
 * This action revalidates paths to clear cached data
 * The actual signOut() is called client-side for immediate effect
 * Always returns { ok: true } - never throws
 */
export async function signOut(): Promise<{ ok: boolean; error?: string }> {
  try {
    // Revalidate paths to clear cached user data
    // This ensures server components show updated auth state
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard');
    revalidatePath('/chat');
    revalidatePath('/billing');

    return { ok: true };
  } catch (error: any) {
    console.error('Sign out exception:', error);
    // Always return ok: true to prevent UI errors
    return { ok: true };
  }
}

