import type { Metadata } from "next";
import { StartSeite } from "@/components/seiten/startseite";
import { siteConfig, siteTexte } from "@/lib/site-config";
import { seitenMetadaten } from "@/lib/i18n/metadaten";

export const metadata: Metadata = seitenMetadaten("en", "/", {
  title: `${siteConfig.name} - ${siteTexte.en.tagline}`,
  absolut: true,
  description: siteTexte.en.description,
});

export default function EnglishHome() {
  return <StartSeite sprache="en" />;
}
