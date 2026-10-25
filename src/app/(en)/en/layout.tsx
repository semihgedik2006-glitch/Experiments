import type { Metadata } from "next";
import { SiteRahmen } from "@/components/layout/site-rahmen";
import { siteConfig, siteTexte } from "@/lib/site-config";

/**
 * Grundwerte für englische Seiten ohne eigene Angabe - die persönlichen
 * Terminseiten und die 404-Seite. Ohne sie erbten diese Seiten
 * Beschreibung und Vorschau der deutschen Startseite.
 */
const titelEn = `${siteConfig.name} - ${siteTexte.en.tagline}`;
export const metadata: Metadata = {
  title: { default: titelEn, template: `%s | ${siteConfig.name}` },
  description: siteTexte.en.description,
  alternates: { canonical: "/en", languages: { de: "/", en: "/en", "x-default": "/" } },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: `${siteConfig.url}/en`,
    siteName: siteConfig.name,
    title: titelEn,
    description: siteTexte.en.description,
  },
  twitter: {
    card: "summary_large_image",
    title: titelEn,
    description: siteTexte.en.description,
  },
};

/**
 * Der Rahmen der englischen Fassung - derselbe wie der deutsche.
 *
 * lang="en" auf dem Teilbaum, weil das <html> der ganzen Anwendung auf
 * "de" steht und es nur eines davon gibt. Ohne diese Angabe liest ein
 * Vorleseprogramm den englischen Text mit deutscher Aussprache vor - ein
 * Fehler, den keine Prüfung meldet, weil eine Sprachangabe ja vorhanden ist.
 */
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" className="contents">
      <SiteRahmen sprache="en">{children}</SiteRahmen>
    </div>
  );
}
