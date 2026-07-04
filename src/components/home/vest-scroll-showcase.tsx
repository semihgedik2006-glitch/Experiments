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

const explainers: { range: [number, number, number, number]; kicker: string; heading: string; text: string }[] = [
  {
    range: [0, 0.05, 0.16, 0.21],
    kicker: "Schritt 1",
    heading: "Nacken & Schultern",
    text: "Die Impulse lösen zuerst Verspannungen in Schultern und Nacken - typische Problemzonen bei Bürojobs.",
  },
  {
    range: [0.16, 0.21, 0.33, 0.38],
    kicker: "Schritt 2",
    heading: "Brust & Rücken",
    text: "Bis zu 90% der Muskelfasern werden gleichzeitig aktiviert - deutlich mehr als beim klassischen Training.",
  },
  {
    range: [0.33, 0.38, 0.52, 0.57],
    kicker: "Schritt 3",
    heading: "Bauch & Rumpf",
    text: "Die tiefliegende Rumpfmuskulatur wird mittrainiert - für einen stabilen Kern und einen strafferen Bauch.",
  },
  {
    range: [0.52, 0.57, 0.72, 0.77],
    kicker: "Ergebnis",
    heading: "Voll aktiviert",
    text: "20 Minuten EMS wirken so intensiv wie mehrere Stunden klassisches Krafttraining - einmal pro Woche reicht.",
  },
];

function Wire({ d, progress, start }: { d: string; progress: MotionValue<number>; start: number }) {
  const pathLength = useTransform(progress, [start, start + 0.04], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.01], [0, 1]);
  return (
    <>
      <path d={d} stroke="var(--vest-line)" strokeWidth={2} fill="none" strokeLinecap="round" />
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
      <circle cx={cx} cy={cy} r={9} fill="#17171a" stroke="var(--vest-line)" strokeWidth={1} />
      <motion.circle
        cx={cx}
        cy={cy}
        r={6}
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

function GroupLabel({
  x,
  y,
  progress,
  start,
  children,
}: {
  x: number;
  y: number;
  progress: MotionValue<number>;
  start: number;
  children: string;
}) {
  const opacity = useTransform(progress, [start, start + 0.03, start + 0.4], [0, 1, 0.5]);
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={7}
      letterSpacing={0.5}
      fill="#9a9aa2"
      style={{ opacity, textTransform: "uppercase" }}
    >
      {children}
    </motion.text>
  );
}

function Explainer({
  item,
  progress,
}: {
  item: (typeof explainers)[number];
  progress: MotionValue<number>;
}) {
  const [s1, s2, e1, e2] = item.range;
  const opacity = useTransform(progress, [s1, s2, e1, e2], [0, 1, 1, 0]);
  const y = useTransform(progress, [s1, s2], [14, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-lime/40 bg-surface-raised/95 px-5 text-center shadow-lg backdrop-blur"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-lime">
        {item.kicker}
      </span>
      <p className="mt-1 text-sm font-semibold">{item.heading}</p>
      <p className="mt-1 text-xs text-muted">{item.text}</p>
    </motion.div>
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

  const cta2Opacity = useTransform(scrollYProgress, [0.8, 0.88], [0, 1]);
  const cta2Y = useTransform(scrollYProgress, [0.8, 0.88], [14, 0]);

  return (
    <section ref={sectionRef} className="relative h-[340vh] bg-surface">
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
            <defs>
              <linearGradient id="vestFabric" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--vest-shell)" />
                <stop offset="55%" stopColor="var(--vest-shell)" />
                <stop offset="100%" stopColor="var(--vest-panel)" />
              </linearGradient>
              <pattern id="meshPattern" width={5} height={5} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="5" stroke="var(--vest-line)" strokeWidth={1} />
              </pattern>
              <radialGradient id="vestVignette" cx="50%" cy="35%" r="75%">
                <stop offset="60%" stopColor="black" stopOpacity={0} />
                <stop offset="100%" stopColor="black" stopOpacity={0.18} />
              </radialGradient>
            </defs>

            {pads.map((pad) => (
              <Wire key={pad.id} d={pad.wire} progress={scrollYProgress} start={pad.start} />
            ))}

            {/* Sleeves with layered velcro straps */}
            <g transform="rotate(-18 47 89)">
              <rect x="28" y="70" width="36" height="36" rx="11" fill="url(#vestFabric)" stroke="var(--vest-line)" strokeWidth={2.5} />
              <rect x="38" y="80" width="16" height="4.5" rx="2" fill="var(--vest-line)" />
              <rect x="38" y="87" width="16" height="4.5" rx="2" fill="var(--vest-line)" />
              <rect x="38" y="94" width="16" height="4.5" rx="2" fill="var(--vest-line)" />
            </g>
            <g transform="rotate(18 153 89)">
              <rect x="136" y="70" width="36" height="36" rx="11" fill="url(#vestFabric)" stroke="var(--vest-line)" strokeWidth={2.5} />
              <rect x="146" y="80" width="16" height="4.5" rx="2" fill="var(--vest-line)" />
              <rect x="146" y="87" width="16" height="4.5" rx="2" fill="var(--vest-line)" />
              <rect x="146" y="94" width="16" height="4.5" rx="2" fill="var(--vest-line)" />
            </g>

            {/* Torso with V-neck */}
            <path
              d="M70,60 L100,92 L130,60 L162,74 L162,220 Q162,232 150,232 L50,232 Q38,232 38,220 L38,74 Z"
              fill="url(#vestFabric)"
              stroke="var(--vest-line)"
              strokeWidth={2.5}
            />
            {/* Stitching along the hem and collar */}
            <path
              d="M74,66 L100,96 L126,66 M42,78 L42,218 Q42,226 50,226 M158,78 L158,218 Q158,226 150,226"
              fill="none"
              stroke="var(--vest-line)"
              strokeWidth={1}
              strokeDasharray="2.5 3"
              opacity={0.7}
            />
            {/* Center zipper */}
            <line x1="100" y1="92" x2="100" y2="226" stroke="var(--vest-line)" strokeWidth={1.2} strokeDasharray="1 2.5" />
            <rect x="96" y="88" width="8" height="9" rx="2" fill="#6b6b74" />

            {/* Mesh ventilation side panels */}
            <rect x="45" y="110" width="12" height="90" rx="6" fill="url(#meshPattern)" stroke="var(--vest-line)" strokeWidth={1} opacity={0.8} />
            <rect x="143" y="110" width="12" height="90" rx="6" fill="url(#meshPattern)" stroke="var(--vest-line)" strokeWidth={1} opacity={0.8} />

            {/* Waist straps with buckles */}
            <rect x="42" y="140" width="116" height="10" rx="5" fill="var(--vest-strap)" stroke="var(--vest-line)" strokeWidth={1.5} />
            <rect x="36" y="138.5" width="7" height="13" rx="2" fill="#6b6b74" />
            <rect x="157" y="138.5" width="7" height="13" rx="2" fill="#6b6b74" />
            <rect x="42" y="172" width="116" height="10" rx="5" fill="var(--vest-strap)" stroke="var(--vest-line)" strokeWidth={1.5} />
            <rect x="36" y="170.5" width="7" height="13" rx="2" fill="#6b6b74" />
            <rect x="157" y="170.5" width="7" height="13" rx="2" fill="#6b6b74" />

            {/* Chest controller unit */}
            <motion.g style={{ opacity: controllerOpacity }}>
              <rect x="83" y="131" width="34" height="40" rx="7" fill="#0d0d0f" />
              <rect x="88" y="137" width="24" height="15" rx="2" fill="#1c1c21" />
              <path d="M90,148 L94,142 L98,146 L102,138 L106,144 L110,140" stroke="var(--color-lime)" strokeWidth={1} fill="none" opacity={0.8} />
              <circle cx="92" cy="161" r="3" fill="#2c2c33" stroke="#6b6b74" strokeWidth={0.75} />
              <circle cx="100" cy="161" r="3" fill="#2c2c33" stroke="#6b6b74" strokeWidth={0.75} />
              <circle cx="108" cy="161" r="3" fill="#2c2c33" stroke="#6b6b74" strokeWidth={0.75} />
            </motion.g>
            <motion.circle cx="100" cy="134.5" r="2" fill="var(--color-lime)" style={{ opacity: controllerDotOpacity, filter: "drop-shadow(0 0 5px var(--color-lime))" }} />

            {pads.map((pad) => (
              <ElectrodePad key={pad.id} pad={pad} progress={scrollYProgress} />
            ))}

            <GroupLabel x={100} y={45} progress={scrollYProgress} start={0.04}>
              Nacken &amp; Schultern
            </GroupLabel>
            <GroupLabel x={100} y={68} progress={scrollYProgress} start={0.14}>
              Brust
            </GroupLabel>
            <GroupLabel x={100} y={200} progress={scrollYProgress} start={0.4}>
              Bauch &amp; Rumpf
            </GroupLabel>

            <path
              d="M70,60 L100,92 L130,60 L162,74 L162,220 Q162,232 150,232 L50,232 Q38,232 38,220 L38,74 Z"
              fill="url(#vestVignette)"
              pointerEvents="none"
            />
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

        <div className="relative mt-6 h-24 w-full max-w-sm">
          {explainers.map((item) => (
            <Explainer key={item.heading} item={item} progress={scrollYProgress} />
          ))}

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
