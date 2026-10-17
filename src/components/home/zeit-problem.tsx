"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Check, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MehrDazu } from "@/components/ui/mehr-dazu";

/**
 * Das Problem, das wir lösen: Zeit.
 *
 * Bewusst KEIN Versprechen über Wirkung ("so effektiv wie drei Stunden
 * Studio") - das wäre eine Behauptung, die niemand belegen kann. Gezeigt
 * wird nur, was sich nachrechnen lässt: Wie viel Platz drei Studio-Einheiten
 * in einer vollen Arbeitswoche brauchen, und wie viel ein Termin bei uns.
 *
 * DER ABLAUF (globals.css, "Die volle Woche"), ein Takt für den ganzen
 * Abschnitt statt Einzeleffekte:
 *   1. Text und Karte gleiten herein.
 *   2. Die Woche füllt sich Tag für Tag mit Terminen.
 *   3. Drei Studio-Blöcke fallen hinein, stoßen an, werden rot, verblassen.
 *   4. Ein schmaler Lime-Block setzt sich in die Lücke und atmet weiter.
 *   5. Unten: 4,5 Std. wird durchgestrichen, "unter 1 Std." leuchtet auf.
 *
 * Nur opacity und transform - beides rechnet die Grafikkarte, nichts
 * ruckelt. Ohne JavaScript und bei "Bewegung reduzieren" steht sofort das
 * Endbild da.
 */

/* Raster: Mo-Fr, 8 bis 20 Uhr, 18 px je Stunde. */
const LINKS = 44;
const OBEN = 40;
const SPALTE = 62;
const BREITE = 56;
const PRO_STUNDE = 18;
const y = (stunde: number) => OBEN + (stunde - 8) * PRO_STUNDE;
const x = (tag: number) => LINKS + tag * SPALTE;

/** Was ohnehin im Kalender steht - Arbeit, Termine. */
const BELEGT: [tag: number, von: number, bis: number][] = [
  [0, 8, 12], [0, 13, 17.5],
  [1, 9, 12.5], [1, 13.5, 18],
  [2, 8, 11.5], [2, 12.5, 18.5],
  [3, 8, 12], [3, 13, 17],
  [4, 8, 13], [4, 14, 17],
];

/** Drei Studio-Einheiten à 90 Minuten (Training, Weg, Umziehen). */
const STUDIO: [tag: number, von: number][] = [
  [0, 17],
  [2, 18],
  [4, 16.5],
];

/** Der eine Termin bei uns: 20 Minuten Training. */
const EMS = { tag: 3, von: 17.5, dauer: 20 / 60 };

/** Kurzschreibweise für den Einsatz im Takt (Sekunden ab Start). */
const ab = (s: number) => ({ "--ab": `${s}s` }) as React.CSSProperties;

/**
 * "fertig": Endbild (kein JS, oder "Bewegung reduzieren").
 * "bereit": alles steht auf dem ersten Bild und wartet.
 * "laeuft": der Abschnitt ist im Blick, der Ablauf spielt einmal.
 */
type Zustand = "fertig" | "bereit" | "laeuft";

function useAblauf<T extends Element>() {
  const ref = useRef<T>(null);
  const [zustand, setZustand] = useState<Zustand>("fertig");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    // Liegt der Abschnitt beim Laden schon mitten im Bild (Sprung per
    // Anker, Zurück-Taste), nicht erst ausblenden und neu abspielen.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.5 && box.bottom > 0) return;

    setZustand("bereit");
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) {
          setZustand("laeuft");
          beobachter.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  return { ref, zustand };
}

function Kalender() {
  return (
    <svg
      viewBox="0 0 360 280"
      role="img"
      aria-label="Eine volle Arbeitswoche: Drei Studio-Einheiten à 90 Minuten stoßen an bestehende Termine. Ein 20-Minuten-Termin passt am Donnerstag um 17:30 Uhr in eine Lücke."
      className="w-full"
    >
      {["Mo", "Di", "Mi", "Do", "Fr"].map((tag, i) => (
        <text key={tag} x={x(i) + BREITE / 2} y={26} textAnchor="middle" className="kal-tag zp-auf" style={ab(0.35 + i * 0.06)}>
          {tag}
        </text>
      ))}
      {[8, 12, 16, 20].map((h) => (
        <g key={h}>
          <text x={LINKS - 8} y={y(h) + 4} textAnchor="end" className="kal-zeit">
            {h}
          </text>
          <line x1={LINKS - 2} x2={x(4) + BREITE} y1={y(h)} y2={y(h)} className="kal-linie" />
        </g>
      ))}

      {/* Die Woche füllt sich, Tag für Tag von oben nach unten. */}
      {BELEGT.map(([tag, von, bis], i) => (
        <rect
          key={`${tag}-${von}`}
          x={x(tag)}
          y={y(von) + 1}
          width={BREITE}
          height={(bis - von) * PRO_STUNDE - 2}
          rx={4}
          className="kal-belegt"
          style={ab(0.55 + tag * 0.09 + (i % 2) * 0.12)}
        />
      ))}

      {/* Drei Mal Studio - stößt überall an. */}
      {STUDIO.map(([tag, von], i) => (
        <g key={tag} className="kal-studio" style={ab(1.55 + i * 0.28)}>
          <rect x={x(tag) + 3} y={y(von)} width={BREITE - 6} height={1.5 * PRO_STUNDE} rx={4} />
          <text x={x(tag) + BREITE / 2} y={y(von) + 17} textAnchor="middle">
            Studio
          </text>
        </g>
      ))}

      {/* Der eine Termin. */}
      <rect
        x={x(EMS.tag) + 2}
        y={y(EMS.von)}
        width={BREITE - 4}
        height={Math.max(EMS.dauer * PRO_STUNDE, 6)}
        rx={3}
        className="kal-ems-block"
      />
      <path
        d={`M${x(EMS.tag) + BREITE / 2} ${y(EMS.von) + 9} V${y(18.9)} H${x(EMS.tag) + BREITE + 18}`}
        className="kal-ems-linie"
      />
      {/* Außen die Lage, innen die Bewegung: Eine CSS-Animation mit
          transform würde sonst das translate() der Lage überschreiben. */}
      <g transform={`translate(${x(EMS.tag) + BREITE + 18} ${y(18.9) - 13})`}>
        <g className="kal-ems-schild">
          <rect width={52} height={26} rx={13} />
          <text x={26} y={17} textAnchor="middle">
            20 Min
          </text>
        </g>
      </g>
    </svg>
  );
}

export function ZeitProblem() {
  const { ref, zustand } = useAblauf<HTMLElement>();
  const wenigerBewegung = useReducedMotion();

  // Die Karte zieht beim Scrollen etwas langsamer mit als der Text - eine
  // leichte Tiefe, kein Effekt. Bei "Bewegung reduzieren" steht sie still.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const karteY = useTransform(scrollYProgress, [0, 1], wenigerBewegung ? [0, 0] : [36, -36]);

  return (
    <section
      ref={ref}
      className={`zp relative overflow-hidden border-b border-border bg-surface py-20 sm:py-24 md:py-32 ${
        zustand === "fertig" ? "" : `zp-${zustand}`
      }`}
    >
      {/* Ein weicher Lime-Schein hinter der Karte. */}
      <div aria-hidden className="zp-schein pointer-events-none absolute right-[-10%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full" />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <span className="zp-auf block text-xs font-semibold uppercase tracking-[0.2em] text-accent" style={ab(0)}>
              Das kennst du
            </span>
            <h2
              className="zp-auf mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
              style={ab(0.08)}
            >
              Dreimal die Woche ins Studio? Dein Kalender sagt nein.
            </h2>

            <ul className="mt-8 space-y-5">
              <li className="zp-auf flex gap-4" style={ab(0.2)}>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/12 text-orange-600 dark:text-orange-400">
                  <X size={16} aria-hidden />
                </span>
                <p className="lesebreite text-muted">
                  <strong className="font-semibold text-foreground">Klassisch:</strong> drei
                  Einheiten, dazu Weg und Umziehen – gut{" "}
                  <strong className="font-semibold text-foreground">4,5 Stunden</strong> pro
                  Woche.
                </p>
              </li>
              <li className="zp-auf flex gap-4" style={ab(0.3)}>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime">
                  <Check size={16} aria-hidden />
                </span>
                <p className="lesebreite text-muted">
                  <strong className="font-semibold text-foreground">Bei uns:</strong> ein fester
                  Termin, 20 Minuten Training, dein Trainer stellt alles ein. Mit Weg{" "}
                  <strong className="font-semibold text-foreground">unter einer Stunde</strong>.
                </p>
              </li>
            </ul>

            <div className="zp-auf" style={ab(0.4)}>
              <MehrDazu titel="So ist gerechnet" className="mt-6">
                <p>
                  Klassisch: 3 × (60 Min. Training + 20 Min. Weg + 10 Min. Umziehen) = 270 Min.
                  Bei uns: 1 × (20 Min. Training + 20 Min. Weg + 10 Min. Umziehen) = 50 Min.
                </p>
                <p className="mt-2">
                  Eine Beispielrechnung – dein Weg hängt davon ab, wo du wohnst und arbeitest.
                  Mit 14 Studios rund um Köln ist er meistens kurz.
                </p>
              </MehrDazu>
            </div>

            <div className="zp-auf mt-8" style={ab(0.5)}>
              <Button href="/probetermin">Freien Termin finden</Button>
            </div>
          </div>

          {/* Dunkle Karte wie die Einladung: Lime leuchtet nur auf Dunkel. */}
          <motion.div style={{ y: karteY }}>
            <div className="on-ink kal-karte zp-karte relative rounded-3xl p-5 sm:p-7" style={ab(0.15)}>
              <p className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <span>Deine Woche</span>
                <span className="flex items-center gap-3 normal-case tracking-normal">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-white/15" aria-hidden /> Termine
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm border border-orange-400 bg-orange-400/20" aria-hidden /> Studio
                  </span>
                </span>
              </p>

              <Kalender />

              {/* Die Rechnung in einer Zeile - wird zum Schluss aufgelöst. */}
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm">
                <span className="zp-alt text-muted">
                  Klassisch <span className="zp-alt-zahl relative font-semibold text-foreground">4,5 Std.</span>
                </span>
                <span className="zp-neu flex items-center gap-2 font-semibold">
                  <span className="text-muted font-normal">Bei uns</span>
                  <span className="rounded-full bg-lime px-3 py-1 text-on-lime">unter 1 Std.</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
