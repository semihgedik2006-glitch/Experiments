import type { Metadata } from "next";
import type { Sprache } from "@/lib/sprache";
import { siteConfig } from "@/lib/site-config";
import { sprachAlternativen } from "@/lib/i18n/pfade";

/**
 * Titel, Beschreibung und Sprachverweise einer Seite - für beide Fassungen.
 *
 * Neben kanonischer Adresse und hreflang (sprachAlternativen) setzt das
 * auch Open Graph und Twitter: Ohne eigene Angabe erbt eine englische
 * Seite sonst die deutsche Vorschau aus dem Hauptlayout, und wer den Link
 * teilt, sieht einen deutschen Text.
 */
export function seitenMetadaten(
  sprache: Sprache,
  dePfad: string,
  angaben: { title: string; description: string; absolut?: boolean } & Omit<Metadata, "title" | "description">,
): Metadata {
  const { title, description, absolut, ...rest } = angaben;
  const alternates = sprachAlternativen(sprache, dePfad);
  const vollerTitel = absolut ? title : `${title} | ${siteConfig.name}`;
  return {
    title: absolut ? { absolute: title } : title,
    description,
    alternates,
    openGraph: {
      title: vollerTitel,
      description,
      locale: sprache === "en" ? "en_GB" : "de_DE",
      url: `${siteConfig.url}${alternates.canonical}`,
    },
    twitter: { title: vollerTitel, description },
    ...rest,
  };
}
