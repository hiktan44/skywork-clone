'use client';

import Link from "next/link";
import { useT } from "@/lib/i18n";

export type LegalSlug = "privacy" | "terms" | "cookies" | "contact";

const MAIL = <a className="text-sky-300 underline" href="mailto:info@stratejidanismanlik.com.tr">info@stratejidanismanlik.com.tr</a>;

/** Shared legal page frame; the body text for each page comes from the `legal.*` i18n keys. */
export function LegalPage({ slug }: { slug: LegalSlug }) {
  const t = useT();
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-10">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200">← Skywork</Link>
        <h1 className="mt-6 text-3xl font-bold">{t(`legal.${slug}Title`)}</h1>
        <p className="mt-2 text-sm text-slate-400">{t('legal.lastUpdated')}</p>
        <div className="mt-8 space-y-5 leading-7 text-slate-300">
          {slug === "privacy" && (
            <>
              <p>{t('legal.privacyP1')}</p>
              <p>{t('legal.privacyP2')}</p>
              <p>{t('legal.privacyP3Before')}{MAIL}{t('legal.privacyP3After')}</p>
            </>
          )}
          {slug === "terms" && (
            <>
              <p>{t('legal.termsP1')}</p>
              <p>{t('legal.termsP2')}</p>
              <p>{t('legal.termsP3')}</p>
            </>
          )}
          {slug === "cookies" && (
            <>
              <p>{t('legal.cookiesP1')}</p>
              <p>{t('legal.cookiesP2')}</p>
            </>
          )}
          {slug === "contact" && <p>{t('legal.contactP1Before')}{MAIL}{t('legal.contactP1After')}</p>}
        </div>
        <section className="mt-10 border-t border-slate-800 pt-6 text-sm leading-6 text-slate-400">
          <h2 className="font-semibold text-slate-200">{t('legal.operatorTitle')}</h2>
          <p className="mt-2">STRATEJİ DANIŞMANLIK HİZMETLERİ SAN. VE TİC. A.Ş.<br />Zafer Mah. Kumrulu Sok. No. 2/18 Bahçelievler/İstanbul<br />{t('legal.taxOffice')}<br />{MAIL}</p>
        </section>
      </article>
    </main>
  );
}
