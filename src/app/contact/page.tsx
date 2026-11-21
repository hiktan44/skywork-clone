import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";
import { getServerLang } from "@/lib/server-lang";
import { t } from "@/lib/i18n-core";

export async function generateMetadata(): Promise<Metadata> {
  return { title: t("legal.contactTitle", await getServerLang()), alternates: { canonical: "/contact" } };
}

export default function Page() { return <LegalPage slug="contact" />; }
