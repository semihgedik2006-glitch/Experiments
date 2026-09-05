import Link from "next/link";
import { Logo } from "@/components/logo";
import { legalConfig } from "@/lib/legal-config";

/**
 * Reduzierter Rahmen für Kampagnenseiten: keine Navigation, keine
 * Ablenkung - nur Logo und die rechtlich zwingend erreichbaren Links.
 *
 * Impressum und Datenschutzerklärung müssen nach § 5 DDG auch hier
 * "leicht erkennbar und unmittelbar erreichbar" sein. Sie fallen deshalb
 * nicht weg, auch wenn die Seite sonst auf eine einzige Handlung zielt.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="shrink-0">
            <Logo className="h-8 w-auto" />
          </Link>
          <a
            href={`tel:${legalConfig.contact.phoneHref}`}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {legalConfig.contact.phone}
          </a>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {legalConfig.companyName}
          </p>
          <nav aria-label="Rechtliches" className="flex gap-5">
            <Link href="/impressum" className="hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:text-foreground">
              AGB
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
