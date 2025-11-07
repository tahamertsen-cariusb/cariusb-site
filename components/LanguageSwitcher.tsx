"use client";
import { useEffect, useState, useRef } from "react";
import { getLocale, setLocale, getLocaleName, getAvailableLocales, type Locale } from "@/lib/i18n";

/**
 * Language switcher component
 * Dropdown menu for selecting language (ES/FR/DE/IT/TR/EN)
 */
export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('EN');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(getLocale());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocale(locale);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <button
        aria-label="Select language"
        className="px-3 py-1.5 rounded-btn text-body-s text-text2 hover:text-text1 transition-hover"
        disabled
      >
        EN ▾
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
        className="px-3 py-1.5 rounded-btn text-body-s text-text2 hover:text-text1 transition-hover focus-ring"
      >
        {currentLocale} <span aria-hidden="true">▾</span>
      </button>
      
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-40 rounded-card bg-surface-1 border border-stroke shadow-elev1_dark z-50"
          style={{ 
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-stroke)',
            boxShadow: 'var(--shadow-elev-1)',
          }}
        >
          {getAvailableLocales().map((locale) => (
            <button
              key={locale}
              role="menuitem"
              onClick={() => handleSelect(locale)}
              className={`w-full text-left px-4 py-2 text-body-s transition-hover ${
                currentLocale === locale
                  ? 'text-accent bg-surface-2'
                  : 'text-text2 hover:text-text1 hover:bg-surface-2'
              }`}
              style={{
                color: currentLocale === locale ? 'var(--color-accent)' : 'var(--color-text-2)',
                backgroundColor: currentLocale === locale ? 'var(--color-surface-2)' : 'transparent',
              }}
            >
              {locale} - {getLocaleName(locale)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



