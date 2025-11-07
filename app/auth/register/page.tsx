'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NavBarGuest } from '@/components/NavBarGuest';
import { Toast, useToast } from '@/components/Toast';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function RegisterPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      showToast('Passwords do not match', 'error');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      // Create Supabase user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        showToast(signUpError.message, 'error');
        setLoading(false);
        return;
      }

      // Upsert into profiles table
      const user = data.user;
      if (user?.id && user.email) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            { user_id: user.id, email: user.email, plan: 'free' },
            { onConflict: 'user_id' }
          );

        if (profileError) {
          console.error('Profile upsert error:', profileError);
          // Continue anyway - profile might be created by trigger or user can retry
        }
      }

      showToast('Account created successfully!', 'success');
      
      // Redirect after a short delay to show success toast
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header>
        <NavBarGuest />
      </header>
      <main className="flex-1 grid place-items-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="glass rounded-xl p-8 backdrop-blur-md border border-white/10 shadow-xl">
            <h1 className="text-2xl font-semibold text-foreground mb-6">
              Create your account
            </h1>

            <form onSubmit={onSubmit} className="space-y-5" aria-label="Register form">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent hover:bg-accent/90 text-[#0b0e11] font-semibold py-3 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-white/5 text-white/50">Or</span>
                </div>
              </div>
              <GoogleLoginButton className="w-full rounded-xl py-3 font-semibold" />
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
