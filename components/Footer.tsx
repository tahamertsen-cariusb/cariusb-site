"use client";
import Link from "next/link";

/**
 * Footer component
 * Minimal footer with Privacy, Terms, Contact links
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-stroke mt-auto" style={{ borderColor: 'var(--color-stroke)' }}>
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-micro text-text2">
            © {new Date().getFullYear()} CARIUSB. All rights reserved.
          </div>
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link
              href="/privacy"
              className="text-micro text-text2 hover:text-text1 transition-hover focus-ring"
              aria-label="Privacy Policy"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-micro text-text2 hover:text-text1 transition-hover focus-ring"
              aria-label="Terms of Service"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-micro text-text2 hover:text-text1 transition-hover focus-ring"
              aria-label="Contact"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}



