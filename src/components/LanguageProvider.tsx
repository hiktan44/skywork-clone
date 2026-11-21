'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/use-lang';
import { t } from '@/lib/i18n-core';

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Tab title per route, kept in sync when the language changes without a reload.
const TITLE_KEYS: Record<string, string> = {
  '/': 'meta.title',
  '/privacy': 'legal.privacyTitle',
  '/terms': 'legal.termsTitle',
  '/cookies': 'legal.cookiesTitle',
  '/contact': 'legal.contactTitle',
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang] = useLang();
  const pathname = usePathname();

  useEffect(() => {
    // Update html lang attribute when language changes
    document.documentElement.lang = lang;
    // Mirror the resolved language into the (non-authoritative) cookie so the server can
    // render matching <title>/description metadata on the next request.
    try {
      document.cookie = `ui_lang=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    } catch {
      // Cookies unavailable.
    }
    const titleKey = TITLE_KEYS[pathname];
    if (titleKey) document.title = t(titleKey, lang);
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('meta.description', lang));
  }, [lang, pathname]);

  return <>{children}</>;
}
