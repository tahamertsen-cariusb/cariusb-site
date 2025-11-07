"use client";
import { useEffect, useState } from "react";

/**
 * ThemeToggle - Toggle between dark and light themes
 * Simplified for header use
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("orb.theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored === "light" ? "light" : stored === "dark" ? "dark" : systemPrefersDark ? "dark" : "light";
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: "dark" | "light") => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("orb.theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        disabled
      >
        <span className="text-sm" aria-hidden="true">
          ●
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <span className="text-sm" aria-hidden="true">
        {theme === "dark" ? "☀" : "●"}
      </span>
    </button>
  );
}

