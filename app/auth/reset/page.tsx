'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { NavBarGuest } from '@/components/NavBarGuest';

export default function ResetPage() {
  const r = useRouter();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setErr(error.message);
    r.push('/auth/login');
  }

  if (!ready) return (
    <div className="min-h-dvh flex flex-col">
      <header>
        <NavBarGuest />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <p>Loading…</p>
      </main>
    </div>
  );

  return (
    <div className="min-h-dvh flex flex-col">
      <header>
        <NavBarGuest />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <form onSubmit={onSubmit} className="glass rounded-xl p-6 w-full max-w-md space-y-4" aria-label="Reset password form">
          <h1 className="text-xl font-medium">Reset Password</h1>
          <label className="block text-sm">
            <span>New Password</span>
            <input
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none"
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="New password"
            />
          </label>
          {err && <p className="text-red-400 text-sm" role="alert">{err}</p>}
          <button className="w-full glass rounded-md py-2 font-medium" type="submit" aria-label="Set new password">Set new password</button>
        </form>
      </main>
    </div>
  );
}





