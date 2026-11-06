export type DivisionPreference = 'women' | 'kids' | 'all';

export const PREF_STORAGE_KEY = 'tgc_pref';
export const PREF_COOKIE_NAME = 'tgc_pref';

/**
 * Read current preference from localStorage or cookie.
 * Falls back to 'all'.
 */
export function getStoredPreference(): DivisionPreference {
  if (typeof window === 'undefined') return 'all';
  try {
    const local = localStorage.getItem(PREF_STORAGE_KEY);
    if (local === 'women' || local === 'kids' || local === 'all') {
      return local;
    }
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${PREF_COOKIE_NAME}=([^;]*)`));
    if (cookieMatch && (cookieMatch[1] === 'women' || cookieMatch[1] === 'kids' || cookieMatch[1] === 'all')) {
      return cookieMatch[1] as DivisionPreference;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return 'all';
}

/**
 * Check if the user has explicitly selected a preference previously
 */
export function hasStoredPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const local = localStorage.getItem(PREF_STORAGE_KEY);
    if (local) return true;
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${PREF_COOKIE_NAME}=([^;]*)`));
    if (cookieMatch && cookieMatch[1]) return true;
  } catch (e) {
    // Ignore
  }
  return false;
}

/**
 * Persist preference to localStorage, 1-year first party cookie, and update html[data-pref]
 */
export function setStoredPreference(pref: DivisionPreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREF_STORAGE_KEY, pref);
    // 1 year max-age = 31536000 seconds
    document.cookie = `${PREF_COOKIE_NAME}=${pref}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute('data-pref', pref);
    window.dispatchEvent(new CustomEvent('tgc-pref-changed', { detail: { pref } }));
  } catch (e) {
    // Ignore
  }
}

