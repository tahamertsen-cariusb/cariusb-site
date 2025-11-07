import { NextResponse } from 'next/server';

/**
 * API route handler for sign out (fallback/progressive enhancement)
 * POST /api/auth/signout
 * 
 * Note: Supabase auth is handled client-side via localStorage
 * This route exists for fallback scenarios
 * Always returns 200 with { ok: true }
 */
export async function POST() {
  try {
    // Return success - actual signOut is handled client-side
    // This allows the route to be called for progressive enhancement
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('Sign out API error:', error);
    // Always return 200 to prevent UI errors
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

