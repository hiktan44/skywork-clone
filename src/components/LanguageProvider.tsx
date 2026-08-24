'use client';

import { useEffect } from 'react';
import { useLang } from '@/lib/use-lang';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang] = useLang();

  useEffect(() => {
    // Update html lang attribute when language changes
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}