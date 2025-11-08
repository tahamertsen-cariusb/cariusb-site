"use client";
import Link from "next/link";

/**
 * SiteFooter - Landing page footer
 * Copyright, small links
 */
export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-text2">
            © {currentYear} CARIUSB. All rights reserved.
          </p>

          {/* Links */}
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link
              href="/pricing"
              className="text-sm text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="text-sm text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            >
              Chat
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}




