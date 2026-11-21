'use client';

import { useLang, pickByLang } from './use-lang';
import { t } from './i18n-core';

export { DICT, t, localeOf } from './i18n-core';
export type { Translations } from './i18n-core';

// Hook to use translation with current language
export function useT() {
  const [lang] = useLang();

  return (key: string, vars?: Record<string, string>) => t(key, lang, vars);
}

// Helper to pick value based on language
export { pickByLang };
