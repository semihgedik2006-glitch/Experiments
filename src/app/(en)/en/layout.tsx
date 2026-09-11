import Link from "next/link";
import { Globe } from "lucide-react";
import { Logo } from "@/components/logo";
import { legalConfig } from "@/lib/legal-config";

/**
 * Der Rahmen der englischen Seite.
 *
 * Eigener Rahmen statt der deutschen Kopf- und Fußzeile: Die dortige
 * Navigation führt auf vierzehn deutsche Seiten. Ein englischer Besucher,
 * der dort hineinklickt, steht sofort wieder vor deutschem Text - und
 * findet schlechter zurück als wenn es die Links gar nicht gäbe.
 *
 * Deshalb hier nur das, was gebraucht wird: zurück zur deutschen Seite,
 * die Telefonnummer, und unten die Rechtstexte. Die bleiben deutsch (§ 5
 * DDG verlangt sie, und eine übersetzte Fassung, die vom Original
 * abweicht, wäre ein Haftungsrisiko) - der Hinweis dazu steht dabei.
 */
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="en" auf dem Teilbaum, weil das <html> der ganzen Anwendung auf
    // "de" steht und es nur eines davon gibt. Ohne diese Angabe liest ein
    // Vorleseprogramm den englischen Text mit deutscher Aussprache vor -
    // ein Fehler, den keine Prüfung meldet, weil eine Sprachangabe ja
    // vorhanden ist.
    <div lang="en" className="contents">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-lime focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-lime"
      >
        Skip to content
      </a>

      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
          <Link href="/en" className="shrink-0" aria-label="Körperformen, English home">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${legalConfig.contact.phoneHref}`}
              className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline"
            >
              {legalConfig.contact.phone}
            </a>
            {/* Der Weg zurück zur deutschen Seite. Auf Deutsch beschriftet,
                nicht auf Englisch: Wer ihn sucht, sucht "Deutsch". */}
            <Link
              href="/"
              hrefLang="de"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-lime"
            >
              <Globe size={13} aria-hidden />
              Deutsch
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-muted">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} {legalConfig.companyName}
            </p>
            <nav aria-label="Legal" className="flex flex-wrap gap-5">
              <Link href="/impressum" hrefLang="de" className="hover:text-foreground">
                Imprint
              </Link>
              <Link href="/datenschutz" hrefLang="de" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/agb" hrefLang="de" className="hover:text-foreground">
                Terms
              </Link>
            </nav>
          </div>
          <p className="mt-4 max-w-2xl leading-relaxed">
            Imprint, privacy policy and terms are available in German only. That is
            deliberate: they are legally binding documents, and a translation that
            drifts from the original would create more problems than it solves. The
            German version is the authoritative one.
          </p>
        </div>
      </footer>
    </div>
  );
}
