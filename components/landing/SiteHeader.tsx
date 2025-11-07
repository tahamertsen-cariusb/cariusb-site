"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DomainModeToggle } from "@/components/DomainModeToggle";
import { isUserLoggedIn } from "@/lib/utils";

/**
 * SiteHeader - Landing page header
 * Logo, DomainModeToggle (readonly), LanguageSwitcher, ThemeToggle, Sign In/Go to Chat
 * Sticky + blur effect
 */
export function SiteHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(isUserLoggedIn());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center text-xl font-display font-bold text-text1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            aria-label="CARIUSB Home"
          >
            CARIUSB
          </Link>

          {/* Right side: Controls + Auth */}
          <div className="flex items-center gap-4">
            {/* Domain Mode Toggle (readonly view) */}
            <div className="hidden md:flex items-center">
              <DomainModeToggle />
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Button */}
            {mounted && (
              <Link
                href={isAuthenticated ? "/chat" : "/auth/login"}
                className="rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                aria-label={isAuthenticated ? "Go to Chat" : "Sign In"}
              >
                {isAuthenticated ? "Go to Chat" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



