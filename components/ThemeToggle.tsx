"use client";
import { useEffect, useState } from "react";

/**
 * Theme toggle component
 * Switches between dark and light themes
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to dark
    const stored = localStorage.getItem('orb.theme');
    const initialTheme = (stored === 'light' ? 'light' : 'dark') as 'dark' | 'light';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('orb.theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <button
        aria-label="Toggle theme"
        className="w-8 h-8 rounded-btn flex items-center justify-center text-text2 hover:text-text1 transition-hover"
        disabled
      >
        <span className="text-sm">●</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="w-8 h-8 rounded-btn flex items-center justify-center text-text2 hover:text-text1 transition-hover focus-ring"
    >
      <span className="text-sm" aria-hidden="true">
        {theme === 'dark' ? '☀' : '●'}
      </span>
    </button>
  );
}



