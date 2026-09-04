import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { siteConfig, mainNav } from "@/lib/site-config";
import { NewsletterForm } from "@/components/newsletter-form";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/icons/social-icons";
import { Logo } from "@/components/logo";
import { getStudios } from "@/lib/data";

const socials = [
  { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: siteConfig.social.tiktok, label: "TikTok", Icon: TikTokIcon },
];

export async function Footer() {
  const studios = await getStudios();
  const studio = studios[0];

  return (
    <footer className="border-t border-border bg-surface">
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-lime hover:text-lime"
              >
                <Icon width={16} height={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Navigation</p>
          <ul className="mt-4 space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">
            {studio ? studio.name : "Kontakt"}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {studio && (
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-lime" />
                <span>
                  {studio.street}
                  <br />
                  {studio.postalCode} {studio.city}
                </span>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <Phone size={15} className="mt-0.5 shrink-0 text-lime" />
              <a
                href={`tel:${(studio?.phone ?? siteConfig.contact.phone).replace(/\s/g, "")}`}
                className="hover:text-foreground"
              >
                {studio?.phone || siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={15} className="mt-0.5 shrink-0 text-lime" />
              <a
                href={`mailto:${studio?.email || siteConfig.contact.email}`}
                className="hover:text-foreground"
              >
                {studio?.email || siteConfig.contact.email}
              </a>
            </li>
            {studio?.openingHours && (
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="mt-0.5 shrink-0 text-lime" />
                <span className="whitespace-pre-line">{studio.openingHours}</span>
              </li>
            )}
          </ul>

          {studios.length > 1 && (
            <Link href="/studio" className="mt-4 inline-block text-sm text-lime hover:underline">
              + {studios.length - 1} weitere{studios.length - 1 === 1 ? "r" : ""} Standort
              {studios.length - 1 === 1 ? "" : "e"}
            </Link>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold">Newsletter</p>
          <p className="mt-4 text-sm text-muted">
            Trainingstipps &amp; Angebote direkt ins Postfach.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
          </p>
          <nav className="flex gap-5">
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
      </div>
    </footer>
  );
}
