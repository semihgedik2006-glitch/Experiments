"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { MapPin, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchOverlay } from "@/components/search/search-overlay";
import { ScrollProgress } from "@/components/scroll-progress";
import { Logo } from "@/components/logo";

export function Header({
  nav,
  studioLabel,
}: {
  nav: { label: string; href: string }[];
  /** Beschriftung für den Standort-Knopf, z.B. "14 Studios". Fehlt sie,
      ist die Studio-Seite ausgeblendet und der Knopf entfällt. */
  studioLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 12);
  });

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/95 transition-shadow duration-300 ${
        scrolled ? "shadow-lg shadow-black/10 dark:shadow-black/40" : ""
      }`}
    >
      <ScrollProgress />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="tastflaeche shrink-0 transition-transform hover:scale-105">
          <Logo className="h-8 w-auto" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-5 lg:flex xl:gap-8">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative text-sm transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
                {active ? (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute -bottom-1 left-0 h-px w-full bg-lime"
                  />
                ) : (
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-lime transition-all duration-300 group-hover:w-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-4">
          <SearchOverlay />
          {/* Der Weg zur englischen Seite. Auf Englisch beschriftet: Wer
              ihn sucht, sucht "English" - nicht "Englisch". */}
          <Link
            href="/en"
            hrefLang="en"
            className="whitespace-nowrap text-sm text-muted transition-colors hover:text-foreground"
          >
            English
          </Link>
          <ThemeToggle />
          <Link
            href="/probetermin"
            className="whitespace-nowrap rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-transform hover:scale-105 active:scale-95"
          >
            Probetermin buchen
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {/* Der Weg zum nächsten Studio führte auf dem Handy über Menü
              öffnen, scrollen, tippen. Bei vierzehn Standorten ist das der
              häufigste Grund, die Seite überhaupt aufzurufen - deshalb steht
              er hier direkt in der Kopfzeile. */}
          {studioLabel && (
            <Link
              href="/studio"
              aria-label={`Standorte ansehen: ${studioLabel}`}
              className="tastflaeche flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-lime"
            >
              <MapPin size={14} className="text-accent" />
              {studioLabel}
            </Link>
          )}
          <SearchOverlay />
          {/* 44 x 44, nicht 22 x 22.
              Der Knopf hatte nur die Größe seines Symbols - gemessen 22
              Pixel im Quadrat. Das ist der meistbenutzte Knopf der
              ganzen Seite auf dem Handy und unterschreitet sogar das
              Mindestmaß von 24 Pixeln aus WCAG 2.5.8. Wer ihn mit dem
              Daumen traf, traf ihn zufällig.
              Das Symbol bleibt 22 Pixel groß, nur die Fläche darum
              wächst - sichtbar ändert sich dadurch nichts. */}
          <button
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <nav aria-label="Navigation für kleine Bildschirme" className="flex flex-col gap-4 px-6 py-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/probetermin"
                  onClick={() => setOpen(false)}
                  className="w-fit rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime"
                >
                  Probetermin buchen
                </Link>
                {studioLabel && (
                  <Link
                    href="/studio"
                    onClick={() => setOpen(false)}
                    className="flex w-fit items-center gap-1.5 rounded-full border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-lime"
                  >
                    <MapPin size={15} className="text-accent" />
                    Studio in deiner Nähe
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <ThemeToggle />
                <Link
                  href="/en"
                  hrefLang="en"
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted hover:text-foreground"
                >
                  English
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
