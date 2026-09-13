import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { NewsletterForm } from "@/components/newsletter-form";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/icons/social-icons";
import { Logo } from "@/components/logo";
import { getStudios } from "@/lib/data";

const socials = [
  { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: siteConfig.social.tiktok, label: "TikTok", Icon: TikTokIcon },
];

export async function Footer({
  nav,
  showNewsletter,
}: {
  nav: { label: string; href: string }[];
  showNewsletter: boolean;
}) {
  const studios = await getStudios();
  const studio = studios[0];

  return (
    <footer className="on-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <Logo className="h-8 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted">{siteConfig.tagline}</p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="tastflaeche flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-lime hover:text-accent"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Navigation</p>
          {/* space-y-0 statt space-y-2: Der Abstand steckt jetzt in den
              Verweisen selbst (py-1.5), nicht zwischen ihnen - jeder ist
              dadurch 32 statt 17 Pixel hoch antippbar, optisch ändert
              sich nichts.
              Gemessen, nicht vermutet: 32 und nicht 44. Untereinander
              stehende Verweise können sich nicht gegenseitig überlappen -
              die unsichtbare Fläche aus .tastflaeche endet dort, wo der
              nächste Verweis beginnt. 44 gäbe es nur mit echtem Abstand,
              und der zöge die Fußzeile deutlich in die Länge. 32 liegt
              über dem Mindestmaß von 24 aus WCAG 2.5.8. */}
          <ul className="mt-3 space-y-0">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="tastflaeche block py-1.5 text-sm text-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Getrennt von der Hauptnavigation und bewusst hier unten:
                Diese Seite sucht nur, wer schon einen Termin hat - im
                Kopfbereich stünde sie jedem im Weg, der noch keinen hat. */}
            <li className="pt-2">
              <Link
                href="/meine-termine"
                className="tastflaeche block py-1.5 text-sm text-muted hover:text-foreground"
              >
                Meine Termine
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">
            {studio ? studio.name : "Kontakt"}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {studio && (
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  {studio.street}
                  <br />
                  {studio.postalCode} {studio.city}
                </span>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <Phone size={15} className="mt-0.5 shrink-0 text-accent" />
              <a
                href={`tel:${(studio?.phone ?? siteConfig.contact.phone).replace(/\s/g, "")}`}
                className="tastflaeche -my-1 py-1 hover:text-foreground"
              >
                {studio?.phone || siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={15} className="mt-0.5 shrink-0 text-accent" />
              <a
                href={`mailto:${studio?.email || siteConfig.contact.email}`}
                className="tastflaeche -my-1 py-1 hover:text-foreground"
              >
                {studio?.email || siteConfig.contact.email}
              </a>
            </li>
            {studio?.openingHours && (
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="mt-0.5 shrink-0 text-accent" />
                <span className="whitespace-pre-line">{studio.openingHours}</span>
              </li>
            )}
          </ul>

          {studios.length > 1 && (
            <Link href="/studio" className="tastflaeche mt-4 inline-block text-sm text-accent hover:underline">
              + {studios.length - 1} weitere{studios.length - 1 === 1 ? "r" : ""} Standort
              {studios.length - 1 === 1 ? "" : "e"}
            </Link>
          )}
        </div>

        {showNewsletter && (
          <div>
            <p className="text-sm font-semibold">Newsletter</p>
            <p className="mt-4 text-sm text-muted">
              Trainingstipps &amp; Angebote direkt ins Postfach.
            </p>
            <NewsletterForm />
          </div>
        )}
      </div>

      <div className="border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
          </p>
          {/* -my-2 gleicht das py-2 wieder aus: Die Zeile bleibt optisch
              genauso hoch wie vorher, die drei Verweise sind aber 16
              statt 32 Pixel hoch antippbar. Sie stehen in einem <nav>,
              sind also Navigation und nicht Teil eines Satzes - für die
              gilt das Mindestmaß aus WCAG 2.5.8. */}
          <nav aria-label="Rechtliches" className="-my-2 flex gap-5">
            <Link href="/impressum" className="tastflaeche py-2 hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="tastflaeche py-2 hover:text-foreground">
              Datenschutz
            </Link>
            <Link href="/agb" className="tastflaeche py-2 hover:text-foreground">
              AGB
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
