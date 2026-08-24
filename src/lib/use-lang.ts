'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ui_lang';
const COOKIE_KEY = 'ui_lang';
const CHANGE_EVENT = 'ui_lang_change';
const IP_CACHE_KEY = 'ip_country_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

type Language = 'tr' | 'en';

interface IpResponse {
  country?: string;
  error?: string;
}

declare global {
  interface WindowEventMap {
    [CHANGE_EVENT]: CustomEvent<Language>;
  }
}

// IP Detection with fallback providers
async function detectCountryFromIp(): Promise<string | null> {
  // Check cache first
  if (typeof window !== 'undefined') {
    const cached = sessionStorage.getItem(IP_CACHE_KEY);
    if (cached) {
      const { country, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return country;
      }
    }
  }

  // Try ipwho.is first (faster)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.country_code) {
        cacheCountry(data.country_code);
        return data.country_code;
      }
    }
  } catch (e) {
    console.debug('ipwho.is failed, trying fallback');
  }

  // Fallback to ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.country) {
        cacheCountry(data.country);
        return data.country;
      }
    }
  } catch (e) {
    console.debug('ipapi.co failed, using browser locale');
  }

  return null;
}

function cacheCountry(country: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify({
      country,
      timestamp: Date.now()
    }));
  }
}

function setCookie(lang: Language): void {
  if (typeof document !== 'undefined') {
    const maxAge = 365 * 24 * 60 * 60; // 1 year
    document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export function setLang(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  setCookie(lang);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: lang }));
  }
}

export function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'tr'; // SSR default

  // 1. Check localStorage (manual preference - highest priority)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'tr' || stored === 'en')) {
    return stored as Language;
  }

  // 2. Check cookie
  const cookies = document.cookie.split(';').map(c => c.trim());
  const cookieLang = cookies.find(c => c.startsWith(`${COOKIE_KEY}=`));
  if (cookieLang) {
    const lang = cookieLang.split('=')[1];
    if (lang === 'tr' || lang === 'en') {
      return lang as Language;
    }
  }

  // 3. Use navigator.language as fallback
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('tr')) {
    return 'tr';
  }

  return 'tr'; // Default fallback
}

export function useLang(): [Language, (lang: Language) => void] {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  useEffect(() => {
    // Perform IP detection on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      detectCountryFromIp().then(country => {
        if (country && country === 'TR') {
          setLang('tr');
          setLangState('tr');
        } else {
          setLang('en');
          setLangState('en');
        }
      }).catch(() => {
        // Fall back to browser locale
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('tr')) {
          setLang('tr');
          setLangState('tr');
        } else {
          setLang('en');
          setLangState('en');
        }
      });
    }

    const handleLangChange = (e: CustomEvent<Language>) => {
      setLangState(e.detail);
    };

    window.addEventListener(CHANGE_EVENT, handleLangChange as EventListener);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleLangChange as EventListener);
    };
  }, []);

  return [lang, setLang];
}

export function pickByLang<T>(lang: Language, tr: T, en: T): T {
  return lang === 'tr' ? tr : en;
}