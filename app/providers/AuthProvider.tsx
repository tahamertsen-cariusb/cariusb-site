'use client';
import { ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, _s) => {
      // force UI refresh when session changes
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('supabase-auth'));
    });
    return () => sub?.subscription.unsubscribe();
  }, []);
  return <>{children}</>;
}


