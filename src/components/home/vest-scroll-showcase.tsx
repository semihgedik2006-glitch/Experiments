"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useTransform, useScroll, type MotionValue } from "motion/react";
import { Button } from "@/components/ui/button";

type Pad = { id: string; x: number; y: number; start: number };

// Positions are best-guess percentages over the photo, matched to where the
// electrode pads sit on the real vest. Nudge x/y here if they drift once you
// see the real image in place.
const pads: Pad[] = [
  { id: "shoulder-l", x: 18, y: 34, start: 0.04 },
  { id: "shoulder-r", x: 82, y: 34, start: 0.09 },
  { id: "chest-l-upper", x: 39, y: 32, start: 0.14 },
  { id: "chest-r-upper", x: 61, y: 32, start: 0.19 },
  { id: "chest-l-lower", x: 41, y: 39, start: 0.24 },
  { id: "chest-r-lower", x: 59, y: 39, start: 0.29 },
  { id: "ab-l-upper", x: 35, y: 57, start: 0.4 },
  { id: "ab-r-upper", x: 65, y: 55, start: 0.45 },
  { id: "ab-l-lower", x: 37, y: 68, start: 0.5 },
  { id: "ab-r-lower", x: 63, y: 67, start: 0.55 },
];

function PadGlow({ pad, progress }: { pad: Pad; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [pad.start, pad.start + 0.04], [0, 1]);
  const scale = useTransform(progress, [pad.start, pad.start + 0.04], [0.3, 1]);
  const ringScale = useTransform(progress, [pad.start, pad.start + 0.15], [0.6, 2.4]);
  const ringOpacity = useTransform(progress, [pad.start, pad.start + 0.03, pad.start + 0.15], [0, 0.6, 0]);

  return (
    <>
      <motion.div
        className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime"
        style={{ left: `${pad.x}%`, top: `${pad.y}%`, opacity: ringOpacity, scale: ringScale }}
      />
      <motion.div
        className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime"
        style={{
          left: `${pad.x}%`,
          top: `${pad.y}%`,
          opacity,
          scale,
          filter: "drop-shadow(0 0 8px var(--color-lime))",
        }}
      />
    </>
  );
}

export function VestScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const percentLabel = useTransform(scrollYProgress, (v) => `${Math.round(Math.min(Math.max(v, 0), 1) * 100)}%`);
  const vestScale = useTransform(scrollYProgress, [0, 0.15, 0.9, 1], [0.85, 1, 1, 1.04]);
  const vestRotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  const cta1Opacity = useTransform(scrollYProgress, [0.3, 0.38, 0.56, 0.64], [0, 1, 1, 0]);
  const cta1Y = useTransform(scrollYProgress, [0.3, 0.38], [14, 0]);

  const cta2Opacity = useTransform(scrollYProgress, [0.78, 0.86], [0, 1]);
  const cta2Y = useTransform(scrollYProgress, [0.78, 0.86], [14, 0]);

  return (
    <section ref={sectionRef} className="relative h-[280vh] bg-surface">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
        <div className="mb-6 text-center">
          <span className="text-xs uppercase tracking-widest text-muted">Live-Aktivierung</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">
            Scroll, um zu sehen wie EMS wirkt
          </h2>
        </div>

        <motion.div
          style={{ scale: vestScale, rotate: vestRotate }}
          className="relative aspect-[3/4] w-full max-w-[240px] sm:max-w-[300px]"
        >
          <Image
            src="/ems-vest.png"
            alt="Körperformen EMS-Weste"
            fill
            priority
            sizes="(max-width: 640px) 240px, 300px"
            className="select-none object-contain"
          />
          {pads.map((pad) => (
            <PadGlow key={pad.id} pad={pad} progress={scrollYProgress} />
          ))}
        </motion.div>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full bg-lime"
              style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
            />
          </div>
          <motion.span className="font-display w-12 text-sm text-lime">{percentLabel}</motion.span>
        </div>

        <div className="relative mt-6 h-20 w-full max-w-sm">
          <motion.div
            style={{ opacity: cta1Opacity, y: cta1Y }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-lime/40 bg-surface-raised/95 px-4 text-center shadow-lg backdrop-blur"
          >
            <p className="text-sm font-semibold text-lime">Bis zu 90% der Muskelfasern</p>
            <p className="mt-1 text-xs text-muted">
              werden gleichzeitig aktiviert - deutlich mehr als beim klassischen Training.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: cta2Opacity, y: cta2Y }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Button href="/probetermin">Jetzt Probetermin buchen</Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
