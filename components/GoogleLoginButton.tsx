'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function GoogleLoginButton({ className = '' }: { className?: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setErr(null);
    setLoading(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${appUrl}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });

      if (error) {
        // Daha açıklayıcı hata mesajı
        if (error.message?.includes('provider is not enabled')) {
          setErr('Google OAuth provider is not enabled in Supabase. Please enable it in Supabase Dashboard → Authentication → Providers → Google.');
        } else {
          setErr(error.message);
        }
        setLoading(false);
      }
      // supabase yönlendirme yapar; error yoksa tarayıcı zaten çıkar
    } catch (e: any) {
      setErr(e?.message ?? 'Unknown OAuth error');
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-md border px-4 py-2 font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Continue with Google'}
      </button>
      {err && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-red-400">{err}</p>
          <p className="text-xs text-white/60">
            Need help? Check{' '}
            <Link href="/auth/debug" className="underline hover:text-white/80">
              /auth/debug
            </Link>{' '}
            for diagnostics.
          </p>
        </div>
      )}
    </div>
  );
}

