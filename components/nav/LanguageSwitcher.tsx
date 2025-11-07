"use client";
import { useEffect, useState, useRef } from "react";
import { getLang } from "@/lib/utils";

/**
 * LanguageSwitcher - Stub component for header
 * Shows current language with dropdown (simplified for header use)
 */
export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("EN");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lang = getLang().toUpperCase();
    setCurrentLang(lang === "TR" ? "TR" : "EN");
  }, []);

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

  const handleSelect = (lang: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
      setCurrentLang(lang);
      setIsOpen(false);
    }
  };

  if (!mounted) {
    return (
      <button
        aria-label="Select language"
        className="px-2 py-1.5 rounded-lg text-sm text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        disabled
      >
        EN <span aria-hidden="true">▾</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="px-2 py-1.5 rounded-lg text-sm text-text2 hover:text-text1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {currentLang} <span aria-hidden="true">▾</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-32 rounded-xl bg-surface-1 border border-stroke shadow-xl z-50"
          style={{
            backgroundColor: "var(--color-surface-1)",
            borderColor: "var(--color-stroke)",
          }}
        >
          <button
            role="menuitem"
            onClick={() => handleSelect("EN")}
            className={`w-full text-left px-4 py-2 text-sm transition-colors rounded-t-xl ${
              currentLang === "EN"
                ? "text-accent bg-surface-2"
                : "text-text2 hover:text-text1 hover:bg-surface-2"
            }`}
            style={{
              color: currentLang === "EN" ? "var(--color-accent)" : "var(--color-text-2)",
            }}
          >
            English
          </button>
          <button
            role="menuitem"
            onClick={() => handleSelect("TR")}
            className={`w-full text-left px-4 py-2 text-sm transition-colors rounded-b-xl ${
              currentLang === "TR"
                ? "text-accent bg-surface-2"
                : "text-text2 hover:text-text1 hover:bg-surface-2"
            }`}
            style={{
              color: currentLang === "TR" ? "var(--color-accent)" : "var(--color-text-2)",
            }}
          >
            Turkish
          </button>
        </div>
      )}
    </div>
  );
}

