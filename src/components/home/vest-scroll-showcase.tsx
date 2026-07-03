"use client";

import { useRef } from "react";
import { motion, useTransform, useScroll, type MotionValue } from "motion/react";
import { Button } from "@/components/ui/button";

type Pad = { id: string; cx: number; cy: number; wire: string; start: number };

// Coordinates in the 0-200 x 0-260 viewBox, matched to where the electrode
// pads sit on a real EMS vest (shoulders, chest, abs/obliques).
const pads: Pad[] = [
  { id: "shoulder-l", cx: 36, cy: 88, wire: "M100,150 C70,125 50,105 36,88", start: 0.04 },
  { id: "shoulder-r", cx: 164, cy: 88, wire: "M100,150 C130,125 150,105 164,88", start: 0.09 },
  { id: "chest-l-upper", cx: 78, cy: 82, wire: "M100,150 C90,120 82,98 78,82", start: 0.14 },
  { id: "chest-r-upper", cx: 122, cy: 82, wire: "M100,150 C110,120 118,98 122,82", start: 0.19 },
  { id: "chest-l-lower", cx: 82, cy: 101, wire: "M100,150 C92,130 85,113 82,101", start: 0.24 },
  { id: "chest-r-lower", cx: 118, cy: 101, wire: "M100,150 C108,130 115,113 118,101", start: 0.29 },
  { id: "ab-l", cx: 70, cy: 148, wire: "M100,150 L70,148", start: 0.4 },
  { id: "ab-r", cx: 130, cy: 143, wire: "M100,150 L130,143", start: 0.45 },
  { id: "waist-l", cx: 74, cy: 177, wire: "M100,150 C90,166 80,174 74,177", start: 0.5 },
  { id: "waist-r", cx: 126, cy: 174, wire: "M100,150 C110,166 120,171 126,174", start: 0.55 },
];

function Wire({ d, progress, start }: { d: string; progress: MotionValue<number>; start: number }) {
  const pathLength = useTransform(progress, [start, start + 0.04], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.01], [0, 1]);
  return (
    <>
      <path d={d} stroke="var(--border-color)" strokeWidth={2} fill="none" strokeLinecap="round" />
      <motion.path
        d={d}
        stroke="var(--color-lime)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        style={{ pathLength, opacity, filter: "drop-shadow(0 0 4px var(--color-lime))" }}
      />
    </>
  );
}

function ElectrodePad({ pad, progress }: { pad: Pad; progress: MotionValue<number> }) {
  const { cx, cy, start } = pad;
  const opacity = useTransform(progress, [start, start + 0.04], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.04], [0.3, 1]);
  const ringScale = useTransform(progress, [start, start + 0.18], [0.6, 3]);
  const ringOpacity = useTransform(progress, [start, start + 0.03, start + 0.18], [0, 0.6, 0]);
  const flashOpacity = useTransform(progress, [start, start + 0.015, start + 0.03, start + 0.06], [0, 1, 1, 0]);

  return (
    <g>
      <motion.circle
        cx={cx}
        cy={cy}
        r={7}
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={1.5}
        style={{ opacity: ringOpacity, scale: ringScale, transformOrigin: `${cx}px ${cy}px` }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={7}
        fill="var(--color-lime)"
        style={{
          opacity,
          scale,
          transformOrigin: `${cx}px ${cy}px`,
          filter: "drop-shadow(0 0 8px var(--color-lime))",
        }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={12}
        fill="white"
        style={{ opacity: flashOpacity, filter: "blur(3px)" }}
      />
    </g>
  );
}

export function VestScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const percentLabel = useTransform(scrollYProgress, (v) => `${Math.round(Math.min(Math.max(v, 0), 1) * 100)}%`);
  const vestScale = useTransform(scrollYProgress, [0, 0.15, 0.9, 1], [0.85, 1, 1, 1.04]);
  const vestRotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);
  const controllerOpacity = useTransform(scrollYProgress, [0, 0.05], [0.85, 1]);
  const controllerDotOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.8, 1]);

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
          className="relative w-full max-w-[240px] sm:max-w-[300px]"
        >
          <svg viewBox="0 0 200 260" className="h-auto w-full overflow-visible">
            {pads.map((pad) => (
              <Wire key={pad.id} d={pad.wire} progress={scrollYProgress} start={pad.start} />
            ))}

            {/* Sleeves with velcro straps */}
            <rect x="30" y="72" width="34" height="34" rx="10" fill="var(--surface-raised)" stroke="var(--border-color)" strokeWidth={2.5} transform="rotate(-18 47 89)" />
            <rect x="40" y="86" width="14" height="6" rx="3" fill="var(--border-color)" transform="rotate(-18 47 89)" />
            <rect x="136" y="72" width="34" height="34" rx="10" fill="var(--surface-raised)" stroke="var(--border-color)" strokeWidth={2.5} transform="rotate(18 153 89)" />
            <rect x="146" y="86" width="14" height="6" rx="3" fill="var(--border-color)" transform="rotate(18 153 89)" />

            {/* Torso with V-neck */}
            <path
              d="M70,60 L100,92 L130,60 L162,74 L162,220 Q162,232 150,232 L50,232 Q38,232 38,220 L38,74 Z"
              fill="var(--surface-raised)"
              stroke="var(--border-color)"
              strokeWidth={2.5}
            />

            {/* Waist straps */}
            <rect x="42" y="140" width="116" height="10" rx="5" fill="var(--surface)" stroke="var(--border-color)" strokeWidth={1.5} />
            <rect x="42" y="172" width="116" height="10" rx="5" fill="var(--surface)" stroke="var(--border-color)" strokeWidth={1.5} />

            {/* Chest controller unit */}
            <motion.rect x="84" y="132" width="32" height="38" rx="6" fill="var(--foreground)" style={{ opacity: controllerOpacity }} />
            <rect x="89" y="138" width="22" height="14" rx="2" fill="var(--background)" />
            <motion.circle cx="100" cy="160" r="3" fill="var(--color-lime)" style={{ opacity: controllerDotOpacity, filter: "drop-shadow(0 0 5px var(--color-lime))" }} />

            {pads.map((pad) => (
              <ElectrodePad key={pad.id} pad={pad} progress={scrollYProgress} />
            ))}
          </svg>
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
