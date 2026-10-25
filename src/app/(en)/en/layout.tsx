import { SiteRahmen } from "@/components/layout/site-rahmen";

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
