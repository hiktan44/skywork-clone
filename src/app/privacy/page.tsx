import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = { title: "Gizlilik ve KVKK Aydınlatma Metni", alternates: { canonical: "/privacy" } };

export default function Page() { return <LegalPage title="Gizlilik ve KVKK Aydınlatma Metni"><p>Hesap, iletişim, işlem ve güvenlik kayıtları; hizmeti sunmak, güvenliği sağlamak, destek taleplerini yanıtlamak ve hukuki yükümlülükleri yerine getirmek amacıyla işlenir.</p><p>Veriler sözleşmenin kurulması veya ifası, hukuki yükümlülük ve meşru menfaat sebeplerine dayanılarak; yalnız hizmet için zorunlu altyapı sağlayıcıları ve yetkili kurumlarla amaçla sınırlı paylaşılabilir.</p><p>KVKK kapsamındaki erişim, düzeltme, silme ve itiraz taleplerinizi <a className="text-sky-300 underline" href="mailto:info@stratejidanismanlik.com.tr">info@stratejidanismanlik.com.tr</a> adresine iletebilirsiniz.</p></LegalPage>; }
