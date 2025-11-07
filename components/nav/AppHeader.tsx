"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { ProfileMenu } from "@/components/nav/ProfileMenu";
import { useLogout } from "@/lib/logout";
import { useToast } from "@/components/Toast";
import { Toaster } from "@/components/common/Toaster";
import { Button } from "@/components/common/Button";

/**
 * AppHeader - Global fixed navbar with USER and GUEST variants
 * Fixed at top, glassmorphism, scroll shadow, responsive mobile menu
 */
export function AppHeader() {
  const pathname = usePathname();
  const email = useAuthEmail();
  const isUser = !!email;
  const headerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout: handleLogout, isPending: isLoggingOut } = useLogout();
  const { toast, showToast, hideToast } = useToast();

  // Set CSS variable for header height
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty("--h-header", `${height}px`);
    };

    // Initial measurement
    updateHeaderHeight();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(header);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Scroll listener for shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  // Note: Using /pricing as the actual route (matches existing page)
  const navLinks = isUser
    ? [
        { href: "/pricing", label: "Plans" },
        { href: "/billing", label: "Billing" },
      ]
    : [
        { href: "/pricing", label: "Plans" },
      ];

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-200 backdrop-blur-sm border-b ${
        isScrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.25)]" : ""
      }`}
      style={{
        backgroundColor: "var(--color-surface-1)",
        opacity: 0.95,
        borderColor: "var(--color-stroke)",
      }}
    >
      <nav
        aria-label="Global"
        className="h-14 md:h-16"
      >
        <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Brand */}
            <Link
              href="/"
              className="text-sm md:text-base font-semibold tracking-wide text-text1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg px-2 py-1 -ml-2"
              aria-label="Home"
            >
              CARIUSB
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
              {/* Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg px-2 py-1 ${
                    isActive(link.href)
                      ? "text-text1 font-medium underline underline-offset-4 decoration-2"
                      : ""
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Primary CTA */}
              {isUser ? (
                <ProfileMenu />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg px-2 py-1"
                  >
                    Login
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      variant="default"
                      className="!rounded-xl"
                      aria-label="Register"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language Switcher */}
              <LanguageSwitcher />
            </div>

            {/* Mobile: Menu Button + Icons */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-text2 hover:text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t backdrop-blur"
            style={{
              backgroundColor: "var(--color-surface-1)",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block text-sm py-2 px-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    isActive(link.href)
                      ? "text-text1 font-medium bg-surface-2"
                      : "text-text2 hover:text-text1 hover:bg-surface-2"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile: User actions */}
              {isUser ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-sm py-2 px-2 rounded-lg text-text2 hover:text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard#settings"
                    className="block text-sm py-2 px-2 rounded-lg text-text2 hover:text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Settings
                  </Link>
                  <div
                    className="my-1 border-t"
                    style={{ borderColor: "var(--color-stroke)" }}
                  />
                  <button
                    onClick={() => {
                      handleLogout({
                        redirectTo: '/',
                        onSuccess: () => {
                          showToast('Signed out', 'success');
                          setIsMobileMenuOpen(false);
                        },
                        onError: (error) => {
                          showToast(error || 'Logout failed', 'error');
                        },
                      });
                    }}
                    disabled={isLoggingOut}
                    aria-label="Log out"
                    aria-busy={isLoggingOut}
                    className="w-full text-left block text-sm py-2 px-2 rounded-lg text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block text-sm py-2 px-2 rounded-lg text-text2 hover:text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Login
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full !rounded-xl"
                      aria-label="Register"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <Toaster toast={toast} onClose={hideToast} />
    </header>
  );
}

