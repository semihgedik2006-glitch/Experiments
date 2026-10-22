"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
  ClipboardCheck,
  Handshake,
  MessagesSquare,
  Shirt,
  SlidersHorizontal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import type { Schritt } from "@/lib/ablauf";

/**
 * Der erste Besuch als Geschichte, die beim Scrollen weiterläuft.
 *
 * Links (auf dem Handy oben angeheftet) läuft eine Uhr mit: Minute 0 bis
 * 38. Sie sagt nebenbei, was sonst ein Satz sagen müsste - dass der ganze
 * Besuch kürzer ist als eine Mittagspause.
 *
 * Die Uhr läuft nicht gleichmäßig mit dem Scrollen, sondern springt je
 * Station um deren Dauer weiter: Bei den 20 Minuten Training dreht sie
 * sichtbar schneller. Der Ablauf selbst kommt aus lib/ablauf.ts, damit er
 * hier und auf /ems-training nicht auseinanderläuft.
 *
 * FOTOS: Jede Station zeigt ihr Foto aus einem Körperformen-Studio
 * (Schritt.foto in lib/ablauf.ts). Eine Station ohne Foto trägt nur ihr
 * Symbol - die Seite ist auch ohne sie vollständig.
 */

const SYMBOLE: LucideIcon[] = [Handshake, Shirt, SlidersHorizontal, Zap, MessagesSquare];


const PLAN: Schritt = {
  step: "Dein Plan & deine Mitgliedschaft",
  text: "Zum Schluss besprecht ihr, wie es weitergeht: dein Trainingsplan und die Mitgliedschaft, die zu deinem Ziel passt. Wenn es dir gefallen hat, kannst du direkt loslegen.",
  duration: "",
  foto: {
    src: "/bilder/studio/team-jubel.jpg",
    alt: "Zwei Körperformen-Trainer und ein Kunde im EMS-Anzug jubeln gemeinsam im Studio.",
  },
};

export function AblaufGeschichte({ schritte }: { schritte: Schritt[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const alle = [...schritte, PLAN];
  const n = alle.length;

  // Minuten bis zum Beginn jeder Station: 0, 5, 10, 13, 33, 38.
  const grenzen = schritte.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + (parseInt(s.duration) || 0)], [0]);
  const gesamt = grenzen[grenzen.length - 1];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.35", "end 0.35"] });
  const weich = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const minuten = useTransform(
    weich,
    grenzen.map((_, i) => i / n),
    grenzen,
    { clamp: true },
  );
  const anzeige = useTransform(minuten, (m) => Math.round(m).toString());
  const ring = useTransform(minuten, (m) => m / gesamt);

  return (
    <section className="relative py-16 sm:py-24">
      <Container>
        <div ref={ref} className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
          {/* Die Uhr. Auf dem Handy eine schmale Leiste unter der
              Kopfzeile, ab lg ein großer Ring neben den Stationen. */}
          <div className="sticky top-16 z-10 -mx-6 self-start bg-background/90 px-6 py-3 backdrop-blur lg:top-28 lg:mx-0 lg:h-fit lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-6">
              <div className="relative h-12 w-12 shrink-0 lg:h-56 lg:w-56">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" className="stroke-border" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="stroke-lime"
                    style={{ pathLength: ring }}
                  />
                </svg>
                <div className="absolute inset-0 hidden flex-col items-center justify-center lg:flex" aria-hidden>
                  <motion.span className="text-6xl font-black tabular-nums tracking-tight">{anzeige}</motion.span>
                  <span className="text-sm text-muted">von {gesamt} Minuten</span>
                </div>
              </div>
              <p className="text-sm lg:hidden" aria-hidden>
                Minute <motion.span className="font-bold tabular-nums">{anzeige}</motion.span>
                <span className="text-muted"> von {gesamt}</span>
              </p>
              <p className="hidden max-w-[16rem] text-sm text-muted lg:block">
                So lange dauert dein erster Besuch – von der Begrüßung bis zum Feedback.
              </p>
            </div>
          </div>

          <ol className="relative">
            {/* Die senkrechte Linie zwischen den Stationen füllt sich mit. */}
            <div aria-hidden className="absolute bottom-6 left-[19px] top-6 w-0.5 bg-border">
              <motion.div className="h-full w-full origin-top bg-lime" style={{ scaleY: weich }} />
            </div>

            {alle.map((schritt, i) => {
              const Symbol = SYMBOLE[i] ?? ClipboardCheck;
              const foto = schritt.foto;
              return (
                <motion.li
                  key={schritt.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative grid grid-cols-[40px_1fr] gap-5 pb-14 last:pb-0 sm:gap-7"
                >
                  <motion.span
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 border-lime bg-background text-accent"
                  >
                    <Symbol size={18} aria-hidden />
                  </motion.span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {schritt.duration ? `Minute ${grenzen[i]}–${grenzen[i + 1]}` : "Danach"}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{schritt.step}</h2>
                    <p className="mt-3 max-w-xl leading-relaxed text-muted">{schritt.text}</p>
                    {foto && (
                      <div className="besuch-foto mt-6 overflow-hidden rounded-2xl border border-border">
                        <Image
                          src={foto.src}
                          alt={foto.alt}
                          width={1200}
                          height={800}
                          sizes="(min-width: 1024px) 640px, 100vw"
                          className="aspect-[3/2] w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
