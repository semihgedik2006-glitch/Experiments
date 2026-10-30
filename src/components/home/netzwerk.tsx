"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useSprache } from "@/lib/i18n/use-sprache";

/**
 * Das Körperformen-Netz - und unser Teil davon.
 *
 * Ein Punkt je Körperformen-Studio. Erst zieht das ganze Netz von links
 * nach rechts auf, dann leuchten unsere Studios nacheinander auf. Die
 * Zahl darunter zählt mit. Mehr braucht die Aussage nicht: So viele
 * Studios gibt es, so viele davon sind unsere.
 *
 * Wo welcher Punkt liegt, hat keine Bedeutung - das Raster ist keine
 * Landkarte. Unsere Punkte sind gleichmäßig verteilt, damit sie nicht wie
 * eine Region aussehen, die es so nicht gibt.
 */

const SPALTEN = 28;
const ABSTAND = 13;
const RAND = 8;

export function Netzwerk({ gesamt, eigene }: { gesamt: number; eigene: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const imBild = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const wenigerBewegung = useReducedMotion();
  const fertig = wenigerBewegung || imBild;
  const en = useSprache() === "en";

  const zeilen = Math.ceil(gesamt / SPALTEN);
  const breite = RAND * 2 + (SPALTEN - 1) * ABSTAND;
  const hoehe = RAND * 2 + (zeilen - 1) * ABSTAND;

  // Unsere Studios gleichmäßig über das Raster verteilt.
  const unsere = new Set(
    Array.from({ length: Math.min(eigene, gesamt) }, (_, i) =>
      Math.floor(((i + 0.5) * gesamt) / Math.max(eigene, 1)),
    ),
  );
  const punkte = Array.from({ length: gesamt }, (_, i) => ({
    i,
    x: RAND + (i % SPALTEN) * ABSTAND,
    y: RAND + Math.floor(i / SPALTEN) * ABSTAND,
    unser: unsere.has(i),
  }));

  return (
    <section className="on-ink relative overflow-hidden py-20 sm:py-24 md:py-32">
      <Container>
        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <Zaehler bis={gesamt} start={fertig} />+ {en ? "Körperformen studios." : "Körperformen-Studios."}
              <br />
              <span className="text-accent">{en ? `${eigene} of them are ours.` : `${eigene} davon sind unsere.`}</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              {en
                ? "That makes us the largest partner in the Körperformen network – the market leader among Körperformen studios. For you, that means one way of working, one standard of supervision and a studio near you, wherever you happen to be in and around Cologne."
                : "Damit sind wir der größte Partner im Körperformen-Netz – Marktführer unter den Körperformen-Studios. Für dich heißt das: ein Ablauf, ein Anspruch an die Betreuung und ein Studio in deiner Nähe, ganz gleich, wo in Köln und Umgebung du gerade bist."}
            </p>
            <Button href="/studio" variant="secondary" className="mt-8 border-white/25">
              {en ? "Find a studio near you" : "Studio in deiner Nähe finden"}
            </Button>
          </div>

          <div className="kal-karte rounded-3xl p-5 sm:p-7">
            <svg
              viewBox={`0 0 ${breite} ${hoehe}`}
              role="img"
              aria-label={
                en
                  ? `${gesamt} dots for the more than ${gesamt} Körperformen studios, ${eigene} of them highlighted: our studios in and around Cologne.`
                  : `${gesamt} Punkte für die über ${gesamt} Körperformen-Studios, ${eigene} davon hervorgehoben: unsere Studios in Köln und Umgebung.`
              }
              className="w-full"
            >
              <defs>
                <clipPath id="netz-aufzug">
                  <motion.rect
                    x={0}
                    y={0}
                    height={hoehe}
                    initial={false}
                    animate={{ width: fertig ? breite : 0 }}
                    transition={wenigerBewegung ? { duration: 0 } : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </clipPath>
              </defs>

              <g clipPath="url(#netz-aufzug)">
                {punkte
                  .filter((p) => !p.unser)
                  .map((p) => (
                    <circle key={p.i} cx={p.x} cy={p.y} r={2.6} fill="currentColor" className="text-white/20" />
                  ))}
              </g>

              {punkte
                .filter((p) => p.unser)
                .map((p, n) => (
                  <g key={p.i} transform={`translate(${p.x} ${p.y})`}>
                    <motion.circle
                      r={7}
                      fill="var(--ink-lime)"
                      initial={false}
                      animate={fertig ? { opacity: [0, 0.35, 0], scale: [0.4, 1.6, 2] } : { opacity: 0, scale: 0.4 }}
                      transition={
                        wenigerBewegung
                          ? { duration: 0 }
                          : { duration: 1.4, delay: 1.1 + n * 0.09, ease: "easeOut" }
                      }
                    />
                    <motion.circle
                      r={4}
                      fill="var(--ink-lime)"
                      initial={false}
                      animate={fertig ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      transition={
                        wenigerBewegung
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 14, delay: 1.1 + n * 0.09 }
                      }
                    />
                  </g>
                ))}
            </svg>
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm text-muted">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden /> {en ? "Körperformen studio" : "Körperformen-Studio"}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink-lime)]" aria-hidden /> {en ? "our studios" : "unsere Studios"}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Zählt einmal hoch, sobald der Abschnitt im Bild ist. Steht vorher schon auf der Endzahl. */
function Zaehler({ bis, start }: { bis: number; start: boolean }) {
  const wert = useMotionValue(bis);
  const text = useTransform(wert, (v) => String(Math.round(v)));
  const wenigerBewegung = useReducedMotion();

  useEffect(() => {
    if (!start || wenigerBewegung) return;
    wert.set(0);
    const steuerung = animate(wert, bis, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => steuerung.stop();
  }, [start, bis, wert, wenigerBewegung]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}
