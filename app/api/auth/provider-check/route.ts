import { NextResponse } from 'next/server';

export async function GET() {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const site = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const authorize = `${supaUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(site + '/auth/callback')}`;

  try {
    const res = await fetch(authorize, { redirect: 'manual' });

    const status = res.status;
    const loc = res.headers.get('location') || null;

    // Beklenen: 302/303 gibi bir yönlendirme ve accounts.google.com'a location
    const enabled =
      status >= 300 &&
      status < 400 &&
      (loc?.includes('accounts.google.com') || loc?.includes('google.com'));

    return NextResponse.json({
      ok: enabled,
      status,
      location: loc,
      supabase_url: supaUrl,
      message: enabled
        ? 'Provider appears ENABLED (redirect to Google detected).'
        : 'Provider likely DISABLED or redirect URI not allowed.',
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'fetch error', supabase_url: supaUrl },
      { status: 500 }
    );
  }
}




