'use client';

import { useT } from '@/lib/i18n';

export default function LegalFooter() {
  const t = useT();
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-sm text-slate-600">
      <div className="flex flex-wrap justify-center gap-4">
        <a href="/privacy">{t('legal.footerPrivacy')}</a>
        <a href="/terms">{t('legal.footerTerms')}</a>
        <a href="/cookies">{t('legal.footerCookies')}</a>
        <a href="/contact">{t('legal.footerContact')}</a>
      </div>
      <p className="mt-3">
        STRATEJİ DANIŞMANLIK HİZMETLERİ SAN. VE TİC. A.Ş. · <a href="mailto:info@stratejidanismanlik.com.tr">info@stratejidanismanlik.com.tr</a>
      </p>
    </footer>
  );
}
