import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = { title: "İletişim", alternates: { canonical: "/contact" } };

export default function Page() { return <LegalPage title="İletişim"><p>Hesap, teknik destek, ödeme veya kişisel veri talepleriniz için <a className="text-sky-300 underline" href="mailto:info@stratejidanismanlik.com.tr">info@stratejidanismanlik.com.tr</a> adresine yazabilirsiniz.</p></LegalPage>; }
