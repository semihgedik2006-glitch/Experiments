import Link from "next/link";
import { siteConfig, mainNav } from "@/lib/site-config";
import { NewsletterForm } from "@/components/newsletter-form";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/icons/social-icons";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold tracking-tight">
            Körper<span className="text-lime">formen</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">{siteConfig.tagline}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-lime hover:text-lime"
            >
              <InstagramIcon width={16} height={16} />
            </a>
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-lime hover:text-lime"
            >
              <FacebookIcon width={16} height={16} />
            </a>
            <a
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-lime hover:text-lime"
            >
              <TikTokIcon width={16} height={16} />
            </a>
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
          <p className="text-sm font-semibold">Kontakt</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-foreground">
                {siteConfig.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-foreground">
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <Link href="/impressum" className="hover:text-foreground">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="hover:text-foreground">
                Datenschutz
              </Link>
            </li>
            <li>
              <Link href="/agb" className="hover:text-foreground">
                AGB
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Newsletter</p>
          <p className="mt-4 text-sm text-muted">
            Trainingstipps &amp; Angebote direkt ins Postfach.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border px-6 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
