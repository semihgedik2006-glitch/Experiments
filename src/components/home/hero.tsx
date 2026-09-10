"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, CalendarClock, ChevronDown, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Der erste Bildschirm.
 *
 * Vorher standen hier sechs zentrierte Blöcke untereinander - Logo,
 * Kennzeichnung, Überschrift, Absatz, Knöpfe, Kleingedrucktes - und links
 * und rechts jeweils ein Viertel leere Fläche. Das las sich wie eine
 * Vorlage: nichts, woran das Auge hängen bleibt, und der einzige
 * Blickfang war ein Logo, das zwei Zentimeter darüber schon in der
 * Kopfzeile steht.
 *
 * Jetzt zwei Spalten. Links die Aussage, rechts eine Karte, die dieselbe
 * Aussage zeigt statt sie zu behaupten: die 20 Minuten als Ring, der sich
 * beim Öffnen einmal füllt, darunter die drei Punkte, auf die es beim
 * ersten Termin ankommt - und ganz unten der nächste tatsächlich freie
 * Termin aus der Datenbank.
 *
 * Der letzte Punkt ist der eigentliche Unterschied: Ein Bild wäre Zierde,
 * "Donnerstag um 9 in Hürth" ist eine Verabredung.
 *
 * Was hier bewusst NICHT steht: ein Foto. Es gibt noch keine eigenen
 * Studiofotos, und ein gekauftes Bild von fremden Menschen an fremden
 * Geräten wäre auf der Seite eines Studios mit vierzehn echten Standorten
 * die schlechtere Wahl als gar keins. Kommen die Fotos, gehören sie in
 * die rechte Spalte - die Karte kann dann daneben oder darunter.
 *
 * Wichtig für die Ladezeit: Die Eingangsanimation läuft über CSS-Klassen
 * (siehe globals.css), nicht über Motion. Über Motion gesteuert stünde der
 * gesamte Hero bis zur Hydration bei opacity 0 - auf einem langsamen
 * Mobilgerät rund drei Sekunden leerer Bildschirm, in denen Google die
 * Überschrift als nicht dargestellt wertet.
 */

/** Zeilenweiser Wortaufbau - jedes Wort steigt aus seiner Zeile herauf. */
function StaggeredLine({
  text,
  className,
  startDelay,
}: {
  text: string;
  className?: string;
  /** Verzögerung des ersten Wortes in Sekunden. */
  startDelay: number;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        // Das Leerzeichen steht bewusst zwischen den Wortcontainern und
        // nicht in ihnen: Innerhalb des überlaufenden Containers wird ein
        // abschließendes Leerzeichen verschluckt, und die Wörter kleben
        // aneinander.
        <Fragment key={index}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span
              className="hero-anim-word"
              style={{ "--hero-delay": `${startDelay + index * 0.05}s` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}

/** Umfang des Rings - muss zum Radius im SVG passen (2 * PI * 54). */
const RING = 2 * Math.PI * 54;

const punkte = [
  { icon: CalendarClock, text: "Einmal pro Woche" },
  { icon: UserRound, text: "Immer persönlich betreut" },
  { icon: ShieldCheck, text: "Kein Abo beim Probetraining" },
];

export type NaechsterTermin = { label: string; studio: string; href: string };

export function Hero({
  standorte,
  anzahlStudios,
  naechsterTermin,
}: {
  standorte: string;
  anzahlStudios: number;
  naechsterTermin: NaechsterTermin | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: der Inhalt zieht beim Wegscrollen langsamer mit.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="hero-wash relative flex min-h-[92vh] items-center overflow-hidden bg-background"
    >
      {/* Der farbige Schimmer wird direkt in die Fläche des Abschnitts
          gemalt (siehe .hero-wash in globals.css) statt über zwei große
          halbtransparente Ebenen darüberzuliegen.

          Gemessen: Die beiden Ebenen kosteten drei Viertel der Bildrate -
          die Startseite schaffte damit 16 statt 60 Bilder pro Sekunde,
          weil bei jedem erzeugten Bild eine bildschirmgroße durchsichtige
          Fläche neu überlagert werden musste. Auf älteren Geräten war das
          als Ruckeln beim Scrollen zu sehen. Ein Verlauf im Hintergrund
          des Abschnitts wird dagegen einmal gezeichnet. */}
      <div aria-hidden className="soft-glow pointer-events-none absolute inset-0" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="w-full">
        {/* Zwei Spalten statt zwölf: Bei einem Zwölferraster mit großem
            Abstand gehen elf Abstände von der Breite ab, und die
            Textspalte wird schmaler als sie aussieht. Hier greift der
            Abstand genau einmal - zwischen Text und Karte. */}
        <Container className="grid items-center gap-12 py-24 md:py-28 lg:grid-cols-[1.45fr_1fr]">
          {/* ---------------- Linke Spalte: die Aussage ---------------- */}
          <div>
            <span
              className="hero-anim inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-raised px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted"
              style={{ "--hero-delay": "0.15s" } as React.CSSProperties}
            >
              {/* Der Punkt pulst leise - er macht aus einer Angabe eine
                  laufende Sache. Reine Zierde, deshalb ausgeblendet für
                  Vorleseprogramme. */}
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="puls-welle absolute inset-0 rounded-full bg-lime" />
                <span className="relative h-2 w-2 rounded-full bg-lime" />
              </span>
              {standorte}
            </span>

            {/* Die Größen sind an der Spaltenbreite gemessen, nicht
                geraten: Bei 4,2rem brach "20 Minuten Training." in der
                sieben Zwölftel breiten Spalte um, und die Überschrift
                stand vierzeilig da. */}
            <h1 className="font-display mt-7 text-[2.6rem] font-black leading-[1.06] tracking-tight sm:text-[3.25rem] lg:text-[3.05rem] xl:text-[3.3rem]">
              <StaggeredLine text="20 Minuten Training." startDelay={0.25} />
              <br />
              {/* Ohne text-glow: Die Wörter steigen aus einem beschnittenen
                  Kasten herauf, und dieser Kasten beschneidet auch den
                  Schein. Im Dunkelmodus stand deshalb hinter jedem Wort ein
                  sichtbares Rechteck. */}
              <StaggeredLine
                text="Ein sichtbarer Unterschied."
                className="text-accent-strong"
                startDelay={0.4}
              />
            </h1>

            <p
              className="hero-anim mt-7 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
              style={{ "--hero-delay": "0.6s" } as React.CSSProperties}
            >
              Effektives EMS-Training für Berufstätige mit wenig Zeit. Einmal pro
              Woche, gelenkschonend, persönlich betreut - bei Körperformen.
            </p>

            <div
              className="hero-anim mt-9 flex flex-col gap-4 sm:flex-row"
              style={{ "--hero-delay": "0.72s" } as React.CSSProperties}
            >
              <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
              <Button href="/ems-training" variant="secondary">
                Wie EMS funktioniert
              </Button>
            </div>

            <p
              className="hero-anim mt-6 text-xs text-muted"
              style={{ "--hero-delay": "0.84s" } as React.CSSProperties}
            >
              Unverbindlich &middot; Ohne Vertragsbindung &middot; Persönlich betreut
            </p>
          </div>

          {/* ---------------- Rechte Spalte: die Karte ---------------- */}
          <div
            className="hero-anim"
            style={{ "--hero-delay": "0.5s" } as React.CSSProperties}
          >
            <div className="impuls-karte relative mx-auto max-w-sm rounded-3xl border border-border p-7 sm:p-8 lg:mx-0">
              <div className="flex flex-col items-center">
                <div className="relative h-[136px] w-[136px]">
                  {/* Die Welle hinter dem Ring: ein einzelner Kreis, der
                      langsam größer und wieder kleiner wird. Klein genug,
                      dass die Bildrate davon nichts merkt. */}
                  <span
                    aria-hidden
                    className="impuls-welle absolute inset-3 rounded-full bg-lime/15"
                  />
                  <svg viewBox="0 0 128 128" className="relative h-full w-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      fill="none"
                      strokeWidth="6"
                      className="stroke-border"
                    />
                    {/* Zeichnet sich beim Öffnen einmal selbst - wie eine
                        Uhr, die eine Trainingseinheit abzählt. */}
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      className="impuls-ring"
                      style={{ "--ring-len": `${RING}` } as React.CSSProperties}
                      strokeDasharray={RING}
                    />
                  </svg>
                  <span className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-4xl font-black leading-none">20</span>
                    <span className="mt-1 text-xs uppercase tracking-widest text-muted">
                      Minuten
                    </span>
                  </span>
                </div>

                <p className="mt-5 text-center text-sm text-muted">
                  Eine Einheit. Mehr braucht deine Woche nicht.
                </p>
              </div>

              <ul className="mt-7 space-y-3 border-t border-border pt-6 text-sm">
                {punkte.map((punkt) => (
                  <li key={punkt.text} className="flex items-center gap-3">
                    <punkt.icon size={16} className="shrink-0 text-accent" aria-hidden />
                    {punkt.text}
                  </li>
                ))}
                {anzahlStudios > 1 && (
                  <li className="flex items-center gap-3">
                    <MapPin size={16} className="shrink-0 text-accent" aria-hidden />
                    {anzahlStudios} Standorte rund um Köln
                  </li>
                )}
              </ul>

              {/* Echte Daten statt eines weiteren Versprechens. Fehlt der
                  Termin, entfällt der Block - eine Zeile "aktuell keine
                  Termine" wäre auf dem ersten Bildschirm das falsche
                  Signal. */}
              {naechsterTermin && (
                <Link
                  href={naechsterTermin.href}
                  className="group mt-6 flex items-center gap-3 rounded-2xl border border-lime/40 bg-lime/5 px-4 py-3.5 transition-colors hover:border-lime"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] uppercase tracking-widest text-muted">
                      Nächster freier Termin
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">
                      {naechsterTermin.label}
                    </span>
                    {naechsterTermin.studio && (
                      <span className="block truncate text-xs text-muted">
                        {naechsterTermin.studio}
                      </span>
                    )}
                  </span>
                  <ArrowRight
                    size={17}
                    aria-hidden
                    className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              )}
            </div>
          </div>
        </Container>
      </motion.div>

      {/* Scroll cue - fades out as soon as the visitor starts scrolling. */}
      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <div
          className="hero-anim flex flex-col items-center gap-1 text-muted"
          style={{ "--hero-delay": "1.6s" } as React.CSSProperties}
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
