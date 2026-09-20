import Link from "next/link";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-10">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200">← Skywork</Link>
        <h1 className="mt-6 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">Son güncelleme: 20 Eylül 2026</p>
        <div className="mt-8 space-y-5 leading-7 text-slate-300">{children}</div>
        <section className="mt-10 border-t border-slate-800 pt-6 text-sm leading-6 text-slate-400">
          <h2 className="font-semibold text-slate-200">İşletmeci ve destek</h2>
          <p className="mt-2">STRATEJİ DANIŞMANLIK HİZMETLERİ SAN. VE TİC. A.Ş.<br />Zafer Mah. Kumrulu Sok. No. 2/18 Bahçelievler/İstanbul<br />Yenibosna V.D. · Vergi No: 7810520457<br /><a className="text-sky-300 underline" href="mailto:info@stratejidanismanlik.com.tr">info@stratejidanismanlik.com.tr</a></p>
        </section>
      </article>
    </main>
  );
}
