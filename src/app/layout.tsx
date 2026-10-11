import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthModal from '@/components/modals/AuthModal';
import { LanguageProvider } from "@/components/LanguageProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Skywork', statusBarStyle: 'default' },
  metadataBase: new URL("https://skywork.seymata.com"),
  title: "Skywork — Yapay Zekâ Çalışma Alanı",
  description: "Projeleri, görevleri ve içerik üretimini tek çalışma alanında yöneten yapay zekâ destekli platform.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Skywork — Yapay Zekâ Çalışma Alanı",
    description: "Projeleri, görevleri ve içerik üretimini tek çalışma alanında yönetin.",
    url: "https://skywork.seymata.com",
    siteName: "Skywork",
    locale: "tr_TR",
    type: "website",
  },
  twitter: { card: "summary", title: "Skywork", description: "Yapay zekâ destekli çalışma alanı." },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Skywork",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: "https://skywork.seymata.com",
          publisher: { "@type": "Organization", name: "STRATEJİ DANIŞMANLIK HİZMETLERİ SAN. VE TİC. A.Ş.", taxID: "7810520457", email: "info@stratejidanismanlik.com.tr" },
        }) }} />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <TooltipProvider>{children}<AuthModal /></TooltipProvider>
        </LanguageProvider>
      <LegalFooter />
      <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){window.addEventListener('load', function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}"}} />
      </body>
    </html>
  );
}


function LegalFooter() { return <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-sm text-slate-600"><div className="flex flex-wrap justify-center gap-4"><a href="/privacy">Gizlilik ve KVKK</a><a href="/terms">Kullanım Koşulları</a><a href="/cookies">Çerez Politikası</a><a href="/contact">İletişim</a></div><p className="mt-3">STRATEJİ DANIŞMANLIK HİZMETLERİ SAN. VE TİC. A.Ş. · <a href="mailto:info@stratejidanismanlik.com.tr">info@stratejidanismanlik.com.tr</a></p></footer>; }

export const viewport = { themeColor: '#0369a1' };
