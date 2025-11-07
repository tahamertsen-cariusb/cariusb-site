'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { NavBarGuest } from '@/components/NavBarGuest';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/reset`
        : 'http://localhost:3000/auth/reset'
    });
    if (error) setErr(error.message);
    else setOk(true);
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header>
        <NavBarGuest />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        {ok ? (
          <div className="glass rounded-xl p-6 w-full max-w-md space-y-4 text-center">
            <p>Check your email for a reset link.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="glass rounded-xl p-6 w-full max-w-md space-y-4" aria-label="Forgot password form">
            <h1 className="text-xl font-medium">Forgot Password</h1>
            <label className="block text-sm">
              <span>Email</span>
              <input
                className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="Email"
                type="email"
              />
            </label>
            {err && <p className="text-red-400 text-sm" role="alert">{err}</p>}
            <button className="w-full glass rounded-md py-2 font-medium" type="submit" aria-label="Send reset link">Send reset link</button>
          </form>
        )}
      </main>
    </div>
  );
}





