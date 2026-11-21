import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";
import { getServerLang } from "@/lib/server-lang";
import { t } from "@/lib/i18n-core";

export async function generateMetadata(): Promise<Metadata> {
  return { title: t("legal.termsTitle", await getServerLang()), alternates: { canonical: "/terms" } };
}

export default function Page() { return <LegalPage slug="terms" />; }
