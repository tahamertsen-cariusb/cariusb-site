'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email || !password) { setErr('Please fill in email and password.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      // Better error mapping
      const m = error.message?.toLowerCase() || '';
      if (m.includes('email') && m.includes('confirm')) {
        setErr('Please confirm your email before signing in.');
      } else if (m.includes('invalid') || m.includes('credentials')) {
        setErr('Invalid email or password.');
      } else {
        setErr(error.message);
      }
      return;
    }

    // If login ok but no profiles row yet, upsert a default one
    const user = data.user;
    if (user?.id && user.email) {
      await supabase.from('profiles').upsert({ user_id: user.id, email: user.email, plan: 'free' });
    }

    r.push('/dashboard');
  }

  return (
    <div className="min-h-[75vh] grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-border/50 bg-panel/60 backdrop-blur p-6 space-y-3">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm opacity-70">Sign in to continue</p>
        <input
          className="w-full rounded-xl border border-border bg-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-border bg-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button disabled={loading} className="w-full rounded-xl py-2 font-semibold bg-accent/90 hover:bg-accent disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-panel/60 text-white/50">Or</span>
          </div>
        </div>
        <GoogleLoginButton className="w-full rounded-xl py-2 font-semibold" />
        <a href="/auth/forgot" className="block text-sm opacity-80 text-center">Forgot your password?</a>
        <a href="/auth/register" className="block text-sm opacity-70 text-center">Don&apos;t have an account? Create one</a>
      </form>
    </div>
  );
}
