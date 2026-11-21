'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ui_lang';
const COOKIE_KEY = 'ui_lang';
const CHANGE_EVENT = 'ui_lang_change';
const IP_CACHE_KEY = 'ip_country_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export type Language = 'tr' | 'en';

declare global {
  interface WindowEventMap {
    [CHANGE_EVENT]: CustomEvent<Language>;
  }
}

/**
 * Language resolution order (first match wins):
 *  1. the visitor's saved choice (localStorage `ui_lang`)
 *  2. country of the visitor's IP (ipwho.is `country_code`): Turkey -> tr, anywhere else -> en
 *  3. if the lookup fails: browser language (Turkish -> tr, anything else -> en)
 *
 * The detected language is never written to localStorage (that key is reserved for the
 * visitor's explicit choice). It lives in module state and is broadcast with the
 * `ui_lang_change` event so every hook instance on the page switches together.
 */
let detectedLang: Language | null = null;
let detecting = false;

function isLanguage(value: unknown): value is Language {
  return value === 'tr' || value === 'en';
}

function readStored(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
}

function readCachedCountry(): string | null {
  try {
    const cached = localStorage.getItem(IP_CACHE_KEY);
    if (!cached) return null;
    const { country, timestamp } = JSON.parse(cached) as { country?: unknown; timestamp?: unknown };
    if (typeof country === 'string' && typeof timestamp === 'number' && Date.now() - timestamp < CACHE_DURATION) {
      return country;
    }
  } catch {
    // Ignore unreadable cache.
  }
  return null;
}

function langFromCountry(country: string): Language {
  return country.toUpperCase() === 'TR' ? 'tr' : 'en';
}

function langFromBrowser(): Language | null {
  if (typeof navigator === 'undefined') return null;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const primary = (languages.find(Boolean) || '').toLowerCase();
  if (!primary) return null;
  return primary.startsWith('tr') ? 'tr' : 'en';
}

async function fetchIpCountry(): Promise<string | null> {
  const cached = readCachedCountry();
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch('https://ipwho.is/', { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) return null;
    const data = (await response.json()) as { success?: boolean; country_code?: unknown };
    if (data?.success === false || typeof data?.country_code !== 'string' || !data.country_code) return null;
    const country = data.country_code.toUpperCase();
    try {
      localStorage.setItem(IP_CACHE_KEY, JSON.stringify({ country, timestamp: Date.now() }));
    } catch {
      // Storage unavailable: detection still works, it just is not cached.
    }
    return country;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function setCookie(lang: Language): void {
  try {
    const maxAge = 365 * 24 * 60 * 60; // 1 year
    document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Cookies unavailable.
  }
}

function emit(lang: Language): void {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: lang }));
}

async function detectLang(): Promise<void> {
  if (detecting || detectedLang || readStored()) return;
  detecting = true;
  try {
    const country = await fetchIpCountry();
    // IP country first; only when the lookup failed do we fall back to the browser language.
    const lang = country ? langFromCountry(country) : (langFromBrowser() ?? 'tr');
    detectedLang = lang;
    emit(lang);
  } finally {
    detecting = false;
  }
}

/** Saves the visitor's explicit choice and switches every hook instance. */
export function setLang(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage unavailable: keep the choice for this page view only.
    detectedLang = lang;
  }
  setCookie(lang);
  emit(lang);
}

function getSnapshot(): Language {
  const stored = readStored();
  if (stored) return stored;
  if (detectedLang) return detectedLang;
  const cachedCountry = readCachedCountry();
  return cachedCountry ? langFromCountry(cachedCountry) : 'tr';
}

// Server render and the first client render (hydration) both use this, so they always match.
function getServerSnapshot(): Language {
  return 'tr';
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange); // other tabs
  void detectLang();
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useLang(): [Language, (lang: Language) => void] {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const set = useCallback((next: Language) => setLang(next), []);
  return [lang, set];
}

export function pickByLang<T>(lang: Language, tr: T, en: T): T {
  return lang === 'tr' ? tr : en;
}
