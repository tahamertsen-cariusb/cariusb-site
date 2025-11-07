"use client";
import Link from "next/link";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Navbar component for guest users
 * Includes: Logo, Access Console, Plans, Request Key, Theme toggle, Language switcher
 */
export function NavBarGuest() {
  const email = useAuthEmail();
  const logged = !!email;
  
  return (
    <div className="sticky top-0 z-40 w-full">
      <div 
        className="w-full border-b backdrop-blur-sm"
        style={{
          borderColor: 'var(--color-stroke)',
          backgroundColor: 'var(--color-surface-1)',
          opacity: 0.95,
        }}
      >
        <nav className="h-[54px]">
          <div className="mx-auto max-w-[1280px] h-full px-6 flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="font-display text-display-2 text-text1 font-semibold tracking-[-0.2px] focus-ring"
              aria-label="Home"
            >
              CARIUSB
            </Link>
            
            {/* Right side navigation */}
            <div className="flex items-center gap-4">
              {/* Access Console - Primary button */}
              <Link
                href={logged ? "/dashboard" : "/auth/login"}
                className="rounded-btn px-4 py-2 text-body-s font-medium text-text1 transition-hover focus-ring"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-page)',
                }}
                aria-label={logged ? "Dashboard" : "Access Console"}
              >
                {logged ? "Dashboard" : "Access Console"}
              </Link>
              
              {/* Plans */}
              <Link
                href="/pricing"
                className="text-body-s text-text2 hover:text-text1 transition-hover focus-ring"
                aria-label="Plans"
              >
                Plans
              </Link>
              
              {/* Request Key - Placeholder for future */}
              <Link
                href={("/request-key" as any)}
                className="text-body-s text-text2 hover:text-text1 transition-hover focus-ring"
                aria-label="Request Key"
              >
                Request Key
              </Link>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Language Switcher */}
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
