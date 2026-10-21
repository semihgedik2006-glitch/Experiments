"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MehrDazu } from "@/components/ui/mehr-dazu";

/**
 * Ein Problem, eine Lösung, eine Grafik - der gemeinsame Rahmen.
 *
 * Zuerst gab es das nur auf der Startseite ("Das kennst du", die volle
 * Woche). Jetzt hat jede Hauptseite ihr eigenes Problem. Damit sie sich
 * gleich anfühlen, teilen sie Aufbau, Karte und Takt:
 *
 *   links:  Kicker, Überschrift, zwei bis drei Punkte mit Haken,
 *           optional eine Rechnung zum Aufklappen, ein Knopf
 *   rechts: dunkle Karte mit der Grafik und einer Zeile darunter, in der
 *           am Ende das Ergebnis aufleuchtet
 *
 * Früher stand links "Klassisch" mit einem X gegen "Bei uns" mit Haken.
 * Das las sich wie ein Seitenhieb auf Fitnessstudios - und schlechtmachen
 * wollen wir niemanden. Jetzt zählt jeder Punkt, was es bei uns gibt.
 *
 * Der Ablauf steht in globals.css ("Die volle Woche" und "Probleme auf
 * den Unterseiten"). Jedes Element bekommt seinen Einsatz als --ab.
 * Grundzustand ist immer das ENDBILD: ohne JavaScript, bei "Bewegung
 * reduzieren" und beim Laden mitten im Abschnitt ist sofort alles da.
 */

/** Einsatz im Takt (Sekunden ab Start). */
export const ab = (s: number) => ({ "--ab": `${s}s` }) as React.CSSProperties;

type Zustand = "fertig" | "bereit" | "laeuft";

/**
 * "fertig": Endbild. "bereit": alles wartet auf dem ersten Bild.
 * "laeuft": der Abschnitt ist im Blick, der Ablauf spielt einmal.
 */
export function useAblauf<T extends Element>() {
  const ref = useRef<T>(null);
  const [zustand, setZustand] = useState<Zustand>("fertig");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    // Liegt der Abschnitt beim Laden schon mitten im Bild (Anker,
    // Zurück-Taste), nicht erst ausblenden und neu abspielen.
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

export function ProblemAbschnitt({
  kicker,
  titel,
  punkte,
  rechnung,
  knopf,
  kartenTitel,
  legende,
  alt,
  neu,
  /** Ab wann (s) die Zeile unten das Alte durchstreicht und das Neue zeigt. */
  aufloesung = 3.4,
  hintergrund = "surface",
  children,
}: {
  kicker: string;
  titel: string;
  punkte: { label: string; text: ReactNode }[];
  rechnung?: { titel: string; inhalt: ReactNode };
  knopf: { href: string; text: string };
  kartenTitel: string;
  legende?: ReactNode;
  /** Links in der Fußzeile der Karte, ohne Hervorhebung. */
  alt?: { label: string; wert: string };
  /** Rechts, leuchtet am Ende des Ablaufs auf. */
  neu: { label: string; wert: string };
  aufloesung?: number;
  hintergrund?: "surface" | "background";
  children: ReactNode;
}) {
  const { ref, zustand } = useAblauf<HTMLElement>();
  const wenigerBewegung = useReducedMotion();

  // Die Karte zieht beim Scrollen etwas langsamer mit als der Text - eine
  // leichte Tiefe. Bei "Bewegung reduzieren" steht sie still.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const karteY = useTransform(scrollYProgress, [0, 1], wenigerBewegung ? [0, 0] : [36, -36]);

  return (
    <section
      ref={ref}
      className={`zp relative overflow-hidden border-y border-border py-20 sm:py-24 md:py-32 ${
        hintergrund === "surface" ? "bg-surface" : ""
      } ${zustand === "fertig" ? "" : `zp-${zustand}`}`}
      style={{ "--aufloesung": `${aufloesung}s` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="zp-schein pointer-events-none absolute right-[-10%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <span className="zp-auf block text-xs font-semibold uppercase tracking-[0.2em] text-accent" style={ab(0)}>
              {kicker}
            </span>
            <h2
              className="zp-auf mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
              style={ab(0.08)}
            >
              {titel}
            </h2>

            <ul className="mt-8 space-y-5">
              {punkte.map((punkt, i) => (
                <li key={punkt.label} className="zp-auf flex gap-4" style={ab(0.2 + i * 0.1)}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime">
                    <Check size={16} aria-hidden />
                  </span>
                  <p className="lesebreite text-muted">
                    <strong className="font-semibold text-foreground">{punkt.label}:</strong> {punkt.text}
                  </p>
                </li>
              ))}
            </ul>

            {rechnung && (
              <div className="zp-auf" style={ab(0.4)}>
                <MehrDazu titel={rechnung.titel} className="mt-6">
                  {rechnung.inhalt}
                </MehrDazu>
              </div>
            )}

            <div className="zp-auf mt-8" style={ab(0.5)}>
              <Button href={knopf.href}>{knopf.text}</Button>
            </div>
          </div>

          {/* Dunkle Karte wie die Einladung: Lime leuchtet nur auf Dunkel. */}
          <motion.div style={{ y: karteY }}>
            <div className="on-ink kal-karte zp-karte relative rounded-3xl p-5 sm:p-7" style={ab(0.15)}>
              <p className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <span>{kartenTitel}</span>
                {legende && (
                  <span className="flex items-center gap-3 normal-case tracking-normal">{legende}</span>
                )}
              </p>

              {children}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-sm">
                {alt ? (
                  <span className="zp-alt text-muted">
                    {alt.label} <span className="font-semibold text-foreground">{alt.wert}</span>
                  </span>
                ) : (
                  <span />
                )}
                <span className="zp-neu flex items-center gap-2 font-semibold">
                  <span className="font-normal text-muted">{neu.label}</span>
                  <span className="rounded-full bg-lime px-3 py-1 text-on-lime">{neu.wert}</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/** Kleine Legende in der Kartenkopfzeile. */
export function Legende({ farbe, children }: { farbe: "termin" | "alt" | "neu"; children: ReactNode }) {
  const punkt =
    farbe === "termin"
      ? "bg-white/15"
      : farbe === "alt"
        ? "border border-orange-400 bg-orange-400/20"
        : "bg-[var(--ink-lime)]";
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${punkt}`} aria-hidden /> {children}
    </span>
  );
}
