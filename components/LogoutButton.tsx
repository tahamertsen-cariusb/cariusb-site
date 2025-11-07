'use client';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }}
      className="rounded-md border px-3 py-2 hover:bg-white/10 transition-colors"
    >
      Logout
    </button>
  );
}




