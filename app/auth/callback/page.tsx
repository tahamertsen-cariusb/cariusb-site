'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('exchangeCodeForSession:', error.message);
          // Redirect to login on error
          router.replace('/auth/login');
          return;
        }
      }
      // Redirect to dashboard on success (or /chat if preferred)
      router.replace('/dashboard');
    };
    run();
  }, [params, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="p-8 text-sm opacity-80">Signing you in…</div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="p-8 text-sm opacity-80">Loading…</div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

