"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";
import { useLogout } from "@/lib/logout";
import { useToast } from "@/components/Toast";
import { Toaster } from "@/components/common/Toaster";

/**
 * ProfileMenu - User profile dropdown menu
 * Shows: [Dashboard], [Settings], divider, [Logout]
 */
export function ProfileMenu() {
  const email = useAuthEmail();
  const { logout, isPending } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await logout({
      redirectTo: "/",
      onSuccess: () => {
        showToast("Signed out", "success");
        setIsOpen(false);
      },
      onError: (error) => {
        showToast(error || "Logout failed", "error");
        setIsOpen(false);
      },
    });
  };

  if (!email) {
    return null;
  }

  // Get user initials for avatar
  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl text-sm text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="User menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-accent">
              {getInitials(email)}
            </span>
          </div>
          <span className="hidden md:inline text-sm text-text1 max-w-[120px] truncate">
            {email.split("@")[0]}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text2 transition-transform ${isOpen ? "rotate-180" : ""} hidden md:block`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-1 border border-stroke shadow-xl z-50 md:block"
            style={{
              backgroundColor: "var(--color-surface-1)",
              borderColor: "var(--color-stroke)",
            }}
          >
            <div className="py-2">
              {/* Dashboard */}
              <Link
                href="/dashboard"
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2 text-sm text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 text-text2" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>

              {/* Settings */}
              <Link
                href="/dashboard#settings"
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2 text-sm text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 text-text2" aria-hidden="true" />
                <span>Settings</span>
              </Link>

              {/* Divider */}
              <div
                className="my-1 border-t"
                style={{ borderColor: "var(--color-stroke)" }}
              />

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isPending}
                role="menuitem"
                aria-label="Log out"
                aria-busy={isPending}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 text-text2 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="w-4 h-4 text-text2" aria-hidden="true" />
                )}
                <span>{isPending ? "Signing out..." : "Logout"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <Toaster toast={toast} onClose={hideToast} />
    </>
  );
}

