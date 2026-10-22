"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowUpRight, Award } from "lucide-react";
import { Container } from "@/components/ui/container";
import { auszeichnung } from "@/lib/auszeichnung";

/**
 * Die DtGV-Auszeichnung als eigener Abschnitt.
 *
 * Links ein Lorbeerkranz, der sich beim Hereinscrollen zeichnet, mit der
 * "1." darin. Rechts die fünf Teilkategorien - jede mit "Platz 1" und
 * ihrem Wert, der einmal hochzählt. Darunter die Quelle mit Link: Eine
 * Auszeichnung ohne Quelle ist eine Behauptung.
 *
 * Kein DtGV-Siegel (siehe @/lib/auszeichnung): Der Kranz ist eine eigene
 * Zeichnung in den Farben der Seite.
 */

const weich = [0.16, 1, 0.3, 1] as const;

export function AuszeichnungAbschnitt() {
  const ref = useRef<HTMLDivElement>(null);
  const imBild = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const still = useReducedMotion();
  const an = still || imBild;

  return (
    <section id="auszeichnung" className="on-ink relative scroll-mt-20 overflow-hidden py-20 sm:py-24 md:py-28">
      <div aria-hidden className="hero-schein pointer-events-none absolute -z-10" />
      <Container>
        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <Kranz an={an} still={!!still} />
            <p className="mt-6 text-sm font-semibold text-accent">
              {auszeichnung.herausgeberKurz}-{auszeichnung.art} 2026
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {auszeichnung.titel}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/80">
              <strong className="text-foreground">Körperformen</strong> erreichte den{" "}
              <strong className="text-foreground">{auszeichnung.platz}</strong> – und in allen fünf
              Teilkategorien die beste Bewertung.
            </p>
          </div>

          <div>
            <ul className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.03]">
              {auszeichnung.kategorien.map((k, i) => (
                <motion.li
                  key={k.name}
                  initial={still ? false : { opacity: 0, x: 16 }}
                  animate={an ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: weich }}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 sm:px-6"
                >
                  <span className="font-semibold">{k.name}</span>
                  <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-on-lime">Platz 1</span>
                  <span className="w-14 text-right">
                    <span className="block text-[10px] uppercase tracking-widest text-muted">Score</span>
                    <Zahl wert={k.score} start={an} />
                  </span>
                </motion.li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              Quelle: {auszeichnung.herausgeber}, {auszeichnung.art} „{auszeichnung.titel}“,
              veröffentlicht am {auszeichnung.veroeffentlicht}. Befragungszeitraum {auszeichnung.zeitraum},{" "}
              {auszeichnung.bewertungen} Bewertungen zu {auszeichnung.anbieter} EMS-Studio-Ketten. Ausgezeichnet
              ist die Marke Körperformen.{" "}
              <a
                href={auszeichnung.quelle}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-semibold text-accent underline-offset-4 hover:underline"
              >
                Zur Studie <ArrowUpRight size={12} aria-hidden />
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Punkt und Richtung auf dem Zweig (kubische Bézierkurve). */
const ZWEIG = [
  [100, 184],
  [46, 178],
  [18, 118],
  [40, 46],
] as const;
function aufZweig(t: number) {
  const [p0, p1, p2, p3] = ZWEIG;
  const u = 1 - t;
  const x = u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0];
  const y = u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { x, y, winkel: (Math.atan2(dy, dx) * 180) / Math.PI };
}

/**
 * Der Kranz: zwei Zweige, die sich von unten nach oben zeichnen, die Blätter
 * sprießen nacheinander ab - abwechselnd nach außen und nach innen.
 */
function Kranz({ an, still }: { an: boolean; still: boolean }) {
  const blaetter = Array.from({ length: 9 }, (_, i) => {
    const t = 0.12 + (i / 8) * 0.86;
    const { x, y, winkel } = aufZweig(t);
    const aussen = i % 2 === 0;
    // Blatt schräg vom Zweig weg, Spitze in Wuchsrichtung.
    const drehung = winkel + (aussen ? -38 : 38);
    const rad = (drehung * Math.PI) / 180;
    // Auf zwei Stellen gerundet: Server und Browser rechnen die letzte
    // Nachkommastelle sonst minimal anders, und React meldet einen
    // Unterschied zwischen ausgeliefertem und berechnetem Bild.
    const r = (n: number) => Math.round(n * 100) / 100;
    return { i, cx: r(x + Math.cos(rad) * 9), cy: r(y + Math.sin(rad) * 9), drehung: r(drehung) };
  });
  const [p0, p1, p2, p3] = ZWEIG;
  const pfad = `M${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`;
  const zweig = (seite: 1 | -1) => (
    <g transform={seite === -1 ? "translate(200 0) scale(-1 1)" : undefined}>
      <motion.path
        d={pfad}
        fill="none"
        stroke="var(--ink-lime)"
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={still ? false : { pathLength: 0 }}
        animate={an ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      {blaetter.map((b) => (
        // Die Drehung sitzt auf der Gruppe: Die Animation setzt am Blatt
        // selbst eine CSS-Transformation, die eine SVG-Drehung am selben
        // Element überschreiben würde.
        <g key={b.i} transform={`rotate(${b.drehung} ${b.cx} ${b.cy})`}>
          <motion.ellipse
            cx={b.cx}
            cy={b.cy}
            rx={10}
            ry={4}
            fill="var(--ink-lime)"
            initial={still ? false : { opacity: 0, scale: 0.2 }}
            animate={an ? { opacity: 0.9, scale: 1 } : undefined}
            style={{ transformOrigin: `${b.cx}px ${b.cy}px` }}
            transition={{ duration: 0.4, delay: 0.2 + b.i * 0.09, ease: weich }}
          />
        </g>
      ))}
    </g>
  );
  return (
    <div className="relative mx-auto h-44 w-44 lg:mx-0">
      <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 h-full w-full">
        {zweig(1)}
        {zweig(-1)}
      </svg>
      <motion.div
        initial={still ? false : { opacity: 0, scale: 0.6 }}
        animate={an ? { opacity: 1, scale: 1 } : undefined}
        transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.9 }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="font-display text-5xl font-black leading-none text-foreground">1.</span>
        <span className="mt-1 text-xs font-bold uppercase tracking-widest text-accent">Platz</span>
      </motion.div>
    </div>
  );
}

/** Zählt einmal auf den Wert hoch ("7,71"). Steht ohne Bewegung sofort da. */
function Zahl({ wert, start }: { wert: string; start: boolean }) {
  const ziel = Number(wert.replace(",", "."));
  const v = useMotionValue(ziel);
  const text = useTransform(v, (x) => x.toFixed(2).replace(".", ","));
  const still = useReducedMotion();
  useEffect(() => {
    if (!start || still) return;
    v.set(0);
    const s = animate(v, ziel, { duration: 1.4, delay: 0.6, ease: weich });
    return () => s.stop();
  }, [start, still, v, ziel]);
  return <motion.span className="block font-display text-xl font-black tabular-nums text-accent">{text}</motion.span>;
}

/**
 * Die kleine Plakette für andere Seiten - verlinkt auf den Abschnitt der
 * Startseite (oder, wo es ihn nicht gibt, auf die Studie).
 */
export function AuszeichnungMarke({ className = "", aufStartseite = true }: { className?: string; aufStartseite?: boolean }) {
  return (
    <a
      href={aufStartseite ? "/#auszeichnung" : auszeichnung.quelle}
      {...(aufStartseite ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className={`group inline-flex max-w-full items-center gap-2.5 rounded-full border border-lime/40 bg-lime/10 py-1.5 pl-1.5 pr-4 text-xs transition-colors hover:border-lime ${className}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime">
        <Award size={14} aria-hidden />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="font-semibold text-foreground">1. Platz</span>
        <span className="text-foreground/75"> · {auszeichnung.titel}</span>
        <span className="text-muted"> ({auszeichnung.herausgeberKurz})</span>
      </span>
    </a>
  );
}
