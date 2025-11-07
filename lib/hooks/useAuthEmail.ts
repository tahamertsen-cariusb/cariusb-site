'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAuthEmail() {
  const [email, setEmail] = useState<string|null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    });
    return () => sub?.subscription.unsubscribe();
  }, []);

  return email;
}


