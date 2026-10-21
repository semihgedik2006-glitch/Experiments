"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { useZiel } from "@/components/ziel/ziel-kontext";
import { ZIEL_INHALTE, ZONEN, zielInhalt } from "@/lib/ziel-inhalte";

/**
 * "Dein Training ist nur deins" - wie aus einem Gespräch ein eigener Plan
 * wird.
 *
 * Links vier Schritte an einer Linie, die beim Scrollen mitwächst. Rechts
 * eine Karte "Dein Plan", die sich Schritt für Schritt füllt: erst das
 * Ziel, dann die Schwerpunkte, dann die Einstellung, dann der Trainer.
 * Hat jemand oben ein Ziel gewählt, steht es hier schon im Plan.
 *
 * Bei "Bewegung reduzieren" ist die Linie voll und der Plan fertig.
 */

const SCHRITTE = [
  {
    titel: "Kennenlernen",
    text: "Im Probetraining sprichst du mit deinem Trainer über dein Ziel, deinen Alltag und deine Vorgeschichte.",
  },
  {
    titel: "Dein Plan",
    text: "Daraus entsteht dein Trainingsplan – kein Standardpaket, sondern deine Schwerpunkte.",
  },
  {
    titel: "Jede Einheit eingestellt",
    text: "Bei jedem Training stellt dein Trainer die Intensität für jede Muskelgruppe ein – passend zu dir und deinem Tag.",
  },
  {
    titel: "Gemeinsam weiter",
    text: "Dein Trainer kennt deinen Stand. Wirst du stärker oder ändert sich dein Ziel, ändert sich dein Plan mit.",
  },
];

export function Individuell() {
  const ref = useRef<HTMLElement>(null);
  const wenigerBewegung = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 90%"] });
  const weich = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  const linie = useTransform(weich, [0, 1], [0, 1]);
  const [stufe, setStufe] = useState(wenigerBewegung ? SCHRITTE.length : 0);

  useMotionValueEvent(weich, "change", (v) => {
    if (wenigerBewegung) return;
    const neu = Math.min(SCHRITTE.length, Math.floor(v * SCHRITTE.length + 0.35));
    setStufe((alt) => (alt === neu ? alt : neu));
  });

  const sichtbar = wenigerBewegung ? SCHRITTE.length : stufe;

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-border bg-surface py-20 sm:py-24 md:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Dein Training ist nur deins.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Kein Kurs, kein Gerätepark, kein Plan von der Stange. Jedes Training wird auf dich
            eingestellt – auf deinen Körper, dein Ziel und deinen Tag.
          </p>
        </Reveal>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <ol className="relative space-y-10 pl-10">
            {/* Die Linie: grau als Spur, Lime wächst beim Scrollen mit. */}
            <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded-full bg-border" />
            <motion.span
              aria-hidden
              className="absolute left-[11px] top-2 bottom-2 w-0.5 origin-top rounded-full bg-lime"
              style={{ scaleY: wenigerBewegung ? 1 : linie }}
            />
            {SCHRITTE.map((schritt, i) => {
              const an = i < sichtbar;
              return (
                <li key={schritt.titel} className="relative">
                  <motion.span
                    aria-hidden
                    className="absolute -left-10 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                    initial={false}
                    animate={
                      an
                        ? { backgroundColor: "var(--color-lime)", borderColor: "var(--color-lime)", color: "#0d0f0a", scale: 1 }
                        : { backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--muted)", scale: 0.9 }
                    }
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  >
                    {i + 1}
                  </motion.span>
                  <h3 className={`text-xl font-semibold tracking-tight transition-colors duration-500 ${an ? "" : "text-muted"}`}>
                    {schritt.titel}
                  </h3>
                  <p className="mt-2 max-w-md leading-relaxed text-muted">{schritt.text}</p>
                </li>
              );
            })}
          </ol>

          <PlanKarte stufe={sichtbar} />
        </div>
      </Container>
    </section>
  );
}

function PlanKarte({ stufe }: { stufe: number }) {
  const { ziel } = useZiel();
  const inhalt = zielInhalt(ziel) ?? ZIEL_INHALTE[0];
  const schwerpunkte = inhalt.profil
    .map((wert, i) => ({ wert, zone: ZONEN[i] }))
    .sort((a, b) => b.wert - a.wert)
    .slice(0, 3)
    .map((z) => z.zone)
    .join(", ");

  const zeilen = [
    { label: "Ziel", wert: ziel ? inhalt.kurz : "deins – z. B. " + inhalt.kurz },
    { label: "Schwerpunkte", wert: schwerpunkte },
    { label: "Intensität", wert: "je Muskelgruppe eingestellt" },
    { label: "Trainer", wert: "bei jeder Einheit dabei" },
  ];

  return (
    <div className="on-ink kal-karte relative rounded-3xl p-6 sm:p-8 lg:sticky lg:top-24">
      <p className="text-sm font-semibold text-foreground">Dein Plan</p>
      <dl className="mt-6 divide-y divide-white/10">
        {zeilen.map((zeile, i) => {
          const da = i < stufe;
          return (
            <div key={zeile.label} className="grid grid-cols-[7.5rem_1fr] gap-4 py-4 text-sm">
              <dt className="text-muted">{zeile.label}</dt>
              <dd className="relative min-h-[1.25rem] font-semibold">
                {/* Platzhalterbalken, bis der Schritt erreicht ist. */}
                <motion.span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-2 w-3/4 -translate-y-1/2 rounded-full bg-white/10"
                  initial={false}
                  animate={{ opacity: da ? 0 : 1 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.span
                  className="relative block"
                  initial={false}
                  animate={da ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {zeile.wert}
                </motion.span>
              </dd>
            </div>
          );
        })}
      </dl>
      <motion.p
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-on-lime"
        initial={false}
        animate={stufe >= SCHRITTE.length ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        Nur für dich gemacht
      </motion.p>
    </div>
  );
}
