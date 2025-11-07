import { supabase } from './supabaseClient';

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getUserEmail() {
  const s = await getSession();
  return s?.user?.email ?? null;
}

export async function getUserPlan() {
  const email = await getUserEmail();
  if (!email) return 'free';
  const { data } = await supabase.from('profiles').select('plan').eq('email', email).maybeSingle();
  return data?.plan ?? 'free';
}

// guest id fallback (mevcut guest_id yaklaşımını koru)
export function getGuestId() {
  if (typeof window === 'undefined') return 'guest_' + Math.random().toString(36).slice(2,10);
  const k = 'guest_id';
  let v = localStorage.getItem(k);
  if (!v) { v = 'guest_' + Math.random().toString(36).slice(2,10); localStorage.setItem(k, v); }
  return v;
}


