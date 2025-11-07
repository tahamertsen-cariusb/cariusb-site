"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function NavBarUser() {
  const router = useRouter();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <Link href="/" className="font-semibold">orb</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="text-white/80 hover:text-white" aria-label="Dashboard">Dashboard</Link>
        <button
          onClick={handleLogout}
          className="glass rounded-md px-3 py-1.5"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}



