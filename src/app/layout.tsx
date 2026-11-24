import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/LanguageProvider";
import LegalFooter from "@/components/LegalFooter";
import { getServerLang } from "@/lib/server-lang";
import { t } from "@/lib/i18n-core";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  return {
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, title: 'Skywork', statusBarStyle: 'default' },
    metadataBase: new URL("https://skywork.seymata.com"),
    title: t('meta.title', lang),
    description: t('meta.description', lang),
    alternates: { canonical: "/" },
    openGraph: {
      title: t('meta.title', lang),
      description: t('meta.ogDescription', lang),
      url: "https://skywork.seymata.com",
      siteName: "Skywork",
      locale: lang === 'tr' ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: { card: "summary", title: "Skywork", description: t('meta.twitterDescription', lang) },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLang();
  return (
    <html
      lang={lang}
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
          <TooltipProvider>{children}</TooltipProvider>
        </LanguageProvider>
      <LegalFooter />
      {/* The PWA service worker caches JS/CSS cache-first, which serves stale chunks under `next dev`
          (stable chunk names) and can trap the page in a reload loop. Register it only in production
          builds; in development remove any registration left over from an earlier session. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            process.env.NODE_ENV === 'production'
              ? "if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){window.addEventListener('load', function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}"
              : "if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});}).catch(function(){});}",
        }}
      />
        <script defer src="/site-visit-preference.js" data-site-origin="https://skywork.seymata.com" data-context="server" />
      </body>
    </html>
  );
}


export const viewport = { themeColor: '#0369a1' };
