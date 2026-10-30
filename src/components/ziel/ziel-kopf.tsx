"use client";

import Link from "@/components/sprach-link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ZielMotiv } from "@/components/ziel/ziel-motiv";
import { ZielUebergang } from "@/components/ui/ziel-uebergang";
import { AuszeichnungMarke } from "@/components/auszeichnung/auszeichnung";
import { zielInhalte, type ZielInhalt } from "@/lib/ziel-inhalte";
import { useSprache } from "@/lib/i18n/use-sprache";

/**
 * Der erste Bildschirm einer Zielseite.
 *
 * Wer hier landet, kommt meist über eine Suche oder eine Anzeige zu genau
 * diesem Thema. Er muss nichts mehr wählen: Die Überschrift spricht sein
 * Ziel an, das Motiv daneben zeigt, was im Training dafür passiert, und
 * der Knopf führt direkt zum Formular weiter unten auf derselben Seite.
 *
 * Die anderen Ziele stehen klein darunter - wer sich vertan hat oder
 * mehrere Ziele hat, kommt mit einem Klick hin.
 */
export function ZielKopf({ inhalt, anzahlStudios }: { inhalt: ZielInhalt; anzahlStudios: number }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const motivY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : 90]);
  const motivDreh = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : -8]);

  const [eins, zwei] = inhalt.titel.map((zeile) => zeile.replace(/ (\S+)$/, " $1"));
  const sprache = useSprache();
  const en = sprache === "en";
  const andere = zielInhalte(sprache).filter((z) => z.wert !== inhalt.wert);

  return (
    <section ref={ref} className="on-ink hero-foto relative isolate overflow-hidden">
      <div aria-hidden className="hero-schein pointer-events-none absolute -z-10" />
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:min-h-[78vh] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="min-w-0">
          <p className="hero-anim text-sm font-semibold text-accent" style={{ "--hero-delay": "0.1s" } as React.CSSProperties}>
            {en ? "EMS training" : "EMS-Training"} · {inhalt.kurz}
          </p>
          <div className="hero-anim mt-3" style={{ "--hero-delay": "0.15s" } as React.CSSProperties}>
            <AuszeichnungMarke />
          </div>
          <h1 className="font-display mt-5 text-[2.4rem] font-black leading-[1.04] tracking-tight sm:text-[3.2rem] xl:text-[3.7rem]">
            <span className="hero-anim block" style={{ "--hero-delay": "0.2s" } as React.CSSProperties}>
              {eins}
            </span>
            <span className="hero-anim block text-accent" style={{ "--hero-delay": "0.35s" } as React.CSSProperties}>
              {zwei}
            </span>
          </h1>
          <p
            className="hero-anim mt-6 max-w-lg text-lg leading-relaxed text-foreground/80"
            style={{ "--hero-delay": "0.5s" } as React.CSSProperties}
          >
            {inhalt.antwort}{" "}
            {en
              ? `20 minutes a week, ${anzahlStudios > 1 ? `at ${anzahlStudios} studios in and around Cologne.` : "in and around Cologne."}`
              : `20 Minuten pro Woche, ${anzahlStudios > 1 ? `in ${anzahlStudios} Studios in Köln und Umgebung.` : "in Köln und Umgebung."}`}
          </p>
          <div
            className="hero-anim mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ "--hero-delay": "0.65s" } as React.CSSProperties}
          >
            <Button href="#termin" className="knopf-glanz-dauer whitespace-nowrap px-8 py-3.5">
              {inhalt.knopf}
              <ArrowRight size={16} aria-hidden />
            </Button>
            <Button href="#dein-ziel" variant="secondary" className="border-white/25">
              {en ? "How you train for it" : "So trainierst du dafür"}
            </Button>
          </div>
          <p
            className="hero-anim mt-6 text-xs text-foreground/70"
            style={{ "--hero-delay": "0.8s" } as React.CSSProperties}
          >
            {en
              ? "Free and without obligation – you get the offer in writing."
              : "Kostenlos und unverbindlich – das Angebot bekommst du schriftlich."}
          </p>
        </div>

        <motion.div style={{ y: motivY, rotate: motivDreh }} className="relative mx-auto w-full max-w-[22rem]">
          <div
            className="hero-anim kal-karte relative aspect-square rounded-[2rem] p-8 sm:p-10"
            style={{ "--hero-delay": "0.3s" } as React.CSSProperties}
          >
            <ZielUebergang>
              <ZielMotiv ziel={inhalt.wert} className="h-full w-full" />
            </ZielUebergang>
          </div>
        </motion.div>
      </Container>

      <Container className="relative pb-10">
        <nav aria-label={en ? "Other goals" : "Andere Ziele"} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="mr-1 text-muted">{en ? "Different goal?" : "Anderes Ziel?"}</span>
          {andere.map((z) => (
            <Link
              key={z.wert}
              href={`/ziel/${z.wert}`}
              className="rounded-full border border-white/15 px-3.5 py-1.5 text-foreground/80 transition-colors hover:border-lime/60 hover:text-foreground"
            >
              {z.kurz}
            </Link>
          ))}
        </nav>
      </Container>
    </section>
  );
}
