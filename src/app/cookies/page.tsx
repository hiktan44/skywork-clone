import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = { title: "Çerez Politikası", alternates: { canonical: "/cookies" } };

export default function Page() { return <LegalPage title="Çerez Politikası"><p>Zorunlu çerezler ve benzeri tarayıcı depolama teknolojileri oturum, güvenlik, dil ve tercihlerin çalışması için kullanılabilir.</p><p>Zorunlu olmayan ölçüm veya pazarlama teknolojileri kullanıldığında bunlar ayrıca açıklanır ve gerekli olduğu durumda kullanıcı tercihine bağlanır. Çerezleri tarayıcı ayarlarınızdan silebilir veya engelleyebilirsiniz.</p></LegalPage>; }
