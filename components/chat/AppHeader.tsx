"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DomainModeToggle } from "@/components/DomainModeToggle";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";
import { getCurrentPlan } from "@/lib/utils/usage";
import { supabase } from "@/lib/supabaseClient";

/**
 * AppHeader - Chat page sticky header
 * Logo, DomainModeToggle (controlled), ThemeToggle, LanguageSwitcher, profile menu
 */
export function AppHeader() {
  const router = useRouter();
  const email = useAuthEmail();
  const [plan, setPlan] = useState<"guest" | "free" | "pro">("guest");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getCurrentPlan().then(setPlan);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur safe-area-top" style={{ borderColor: "var(--color-stroke)" }}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 safe-area-left safe-area-right">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center text-xl font-display font-bold text-text1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            aria-label="CARIUSB Home"
          >
            CARIUSB
          </Link>

          {/* Center: Domain Mode Toggle */}
          <div className="hidden md:flex items-center">
            <DomainModeToggle />
          </div>

          {/* Right side: Controls + Profile */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Menu */}
            {mounted && (
              <div className="relative">
                {email ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text2 hidden sm:inline">
                      {email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="rounded-2xl bg-surface-2 px-4 py-2 text-sm font-medium text-text1 transition-all hover:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                      style={{
                        backgroundColor: "var(--color-surface-2)",
                        color: "var(--color-text-1)",
                      }}
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                    aria-label="Sign In"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

