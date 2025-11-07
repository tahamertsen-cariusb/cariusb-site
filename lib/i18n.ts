/**
 * Simple i18n utility for locale state management
 * Translations will be added later
 */

export type Locale = 'ES' | 'FR' | 'DE' | 'IT' | 'TR' | 'EN';

const LOCALE_KEY = 'orb.locale';
const DEFAULT_LOCALE: Locale = 'EN';

/**
 * Get current locale from localStorage or default
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && ['ES', 'FR', 'DE', 'IT', 'TR', 'EN'].includes(stored)) {
      return stored as Locale;
    }
  } catch {
    // Ignore errors
  }
  
  return DEFAULT_LOCALE;
}

/**
 * Set locale in localStorage
 */
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Ignore errors
  }
}

/**
 * Get locale display name
 */
export function getLocaleName(locale: Locale): string {
  const names: Record<Locale, string> = {
    ES: 'Español',
    FR: 'Français',
    DE: 'Deutsch',
    IT: 'Italiano',
    TR: 'Türkçe',
    EN: 'English',
  };
  return names[locale];
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return ['ES', 'FR', 'DE', 'IT', 'TR', 'EN'];
}



