"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import type { ZielWert } from "@/lib/ziel-inhalte";

/**
 * Ein Motiv je Ziel - abstrakt, nicht als Körper.
 *
 * Warum keine Figur: Gezeichnete Menschen sind hier schon dreimal
 * gescheitert (siehe home/ems-figur.tsx) - sie sehen aus wie
 * Schaufensterpuppen. Geometrie hat dieses Problem nicht. Jedes Motiv
 * zeigt deshalb, was beim Training für dieses Ziel passiert:
 *
 *   Rücken        Wirbel für Wirbel leuchtet von unten nach oben auf,
 *                 links und rechts laufen Impulse mit.
 *   Straffen      Konturen ziehen sich zusammen - mehr Spannung.
 *   Abnehmen      Woche für Woche ein Haken: Dranbleiben, nicht Kilos.
 *   Muskelaufbau  Acht Zonen laden sich auf, Stufe für Stufe.
 *   Fitness       Ein Puls läuft durch, Ringe atmen im Takt.
 *
 * Bei "Bewegung reduzieren" steht das Endbild.
 */

const LIME = "var(--ink-lime)";
const SPUR = "rgb(255 255 255 / 0.12)";

export function ZielMotiv({
  ziel,
  className,
  stehend = false,
}: {
  ziel: ZielWert;
  className?: string;
  /** Nur das Endbild, ohne Bewegung - wo mehrere Motive nebeneinander stehen. */
  stehend?: boolean;
}) {
  const still = (useReducedMotion() ?? false) || stehend;
  const Motiv = { ruecken: Ruecken, straffen: Straffen, abnehmen: Abnehmen, muskelaufbau: Muskeln, fitness: Fitness }[ziel];
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className}>
      <Motiv still={still} />
    </svg>
  );
}

function schleife(dauer: number, verzoegerung = 0, pause = 1.2): Transition {
  return { duration: dauer, delay: verzoegerung, repeat: Infinity, repeatDelay: pause, ease: "easeInOut" };
}

/* ---------- Rücken: Wirbelsäule, die von unten aufleuchtet ---------- */
function Ruecken({ still }: { still: boolean }) {
  const wirbel = Array.from({ length: 7 }, (_, i) => 6 - i); // unten zuerst
  return (
    <g>
      {[62, 138].map((x, seite) => (
        <g key={x}>
          <path d={`M${x} 172 C ${x + (seite ? 10 : -10)} 120, ${x + (seite ? -8 : 8)} 80, ${x} 28`} fill="none" stroke={SPUR} strokeWidth={2} />
          <motion.path
            d={`M${x} 172 C ${x + (seite ? 10 : -10)} 120, ${x + (seite ? -8 : 8)} 80, ${x} 28`}
            fill="none"
            stroke={LIME}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={false}
            animate={still ? { pathLength: 1, opacity: 0.8 } : { pathLength: [0, 1, 1], opacity: [0.9, 0.9, 0] }}
            transition={still ? { duration: 0 } : schleife(2.2, 0.1, 0.6)}
          />
        </g>
      ))}
      {wirbel.map((stufe, n) => (
        <motion.rect
          key={stufe}
          x={80}
          y={30 + stufe * 20}
          width={40}
          height={14}
          rx={6}
          fill="none"
          strokeWidth={2.5}
          initial={false}
          animate={
            still
              ? { stroke: LIME, fill: "rgb(195 245 60 / 0.25)" }
              : { stroke: [SPUR, LIME, LIME], fill: ["rgb(195 245 60 / 0)", "rgb(195 245 60 / 0.35)", "rgb(195 245 60 / 0.1)"] }
          }
          transition={still ? { duration: 0 } : schleife(1.6, n * 0.22, 1.2)}
        />
      ))}
    </g>
  );
}

/* ---------- Straffen: Konturen ziehen sich zusammen ---------- */
function Straffen({ still }: { still: boolean }) {
  const ringe = [80, 62, 44, 26];
  return (
    <g>
      {ringe.map((r, i) => (
        <motion.ellipse
          key={r}
          cx={100}
          cy={100}
          rx={r * 0.78}
          ry={r}
          fill="none"
          stroke={LIME}
          strokeWidth={i === ringe.length - 1 ? 3 : 2}
          style={{ transformOrigin: "100px 100px" }}
          initial={false}
          animate={still ? { scale: 0.92, opacity: 0.4 + i * 0.18 } : { scale: [1, 0.86, 0.92], opacity: [0.15, 0.95, 0.45 + i * 0.12] }}
          transition={still ? { duration: 0 } : schleife(1.8, i * 0.15, 1)}
        />
      ))}
      <motion.circle
        cx={100}
        cy={100}
        r={6}
        fill={LIME}
        initial={false}
        animate={still ? { scale: 1 } : { scale: [1, 1.6, 1] }}
        style={{ transformOrigin: "100px 100px" }}
        transition={still ? { duration: 0 } : schleife(1.8, 0.45, 1)}
      />
    </g>
  );
}

/* ---------- Abnehmen: Woche für Woche ein Haken ---------- */
function Abnehmen({ still }: { still: boolean }) {
  const wochen = Array.from({ length: 12 }, (_, i) => i);
  return (
    <g>
      {wochen.map((w) => {
        const x = 28 + (w % 4) * 38;
        const y = 44 + Math.floor(w / 4) * 42;
        return (
          <g key={w}>
            <rect x={x} y={y} width={30} height={30} rx={8} fill="none" stroke={SPUR} strokeWidth={2} />
            <motion.rect
              x={x}
              y={y}
              width={30}
              height={30}
              rx={8}
              fill={LIME}
              style={{ transformOrigin: `${x + 15}px ${y + 15}px` }}
              initial={false}
              animate={still ? { scale: 1, opacity: 1 } : { scale: [0.3, 1, 1, 1], opacity: [0, 1, 1, 0] }}
              transition={
                still
                  ? { duration: 0 }
                  : { duration: 4.8, times: [0, 0.06, 0.85, 1], delay: w * 0.22, repeat: Infinity, repeatDelay: 2.64 }
              }
            />
            <motion.path
              d={`M${x + 8} ${y + 15.5} l5 5 l9 -10`}
              fill="none"
              stroke="#0d0f0a"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={still ? { pathLength: 1, opacity: 1 } : { pathLength: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
              transition={
                still ? { duration: 0 } : { duration: 4.8, times: [0, 0.08, 0.85, 1], delay: w * 0.22 + 0.1, repeat: Infinity, repeatDelay: 2.64 }
              }
            />
          </g>
        );
      })}
    </g>
  );
}

/* ---------- Muskelaufbau: acht Zonen laden sich auf ---------- */
function Muskeln({ still }: { still: boolean }) {
  const hoehen = [0.85, 0.7, 0.85, 0.8, 0.75, 0.55, 0.8, 0.85];
  return (
    <g>
      {hoehen.map((h, i) => {
        const x = 24 + i * 20;
        const voll = 130 * h;
        return (
          <g key={i}>
            <rect x={x} y={40} width={12} height={130} rx={6} fill={SPUR} />
            <motion.rect
              x={x}
              width={12}
              rx={6}
              fill={LIME}
              initial={false}
              animate={
                still
                  ? { y: 170 - voll, height: voll }
                  : { y: [170, 170 - voll * 0.35, 170 - voll * 0.65, 170 - voll], height: [0, voll * 0.35, voll * 0.65, voll] }
              }
              transition={still ? { duration: 0 } : { duration: 2.4, times: [0, 0.33, 0.66, 1], delay: i * 0.08, repeat: Infinity, repeatDelay: 1.4, ease: "easeOut" }}
            />
          </g>
        );
      })}
      <line x1={18} x2={182} y1={176} y2={176} stroke={SPUR} strokeWidth={2} />
    </g>
  );
}

/* ---------- Fitness: Puls und atmende Ringe ---------- */
function Fitness({ still }: { still: boolean }) {
  const puls = "M10 100 H62 L74 72 L88 132 L102 58 L114 112 L124 100 H190";
  return (
    <g>
      {[70, 52, 34].map((r, i) => (
        <motion.circle
          key={r}
          cx={100}
          cy={100}
          r={r}
          fill="none"
          stroke={LIME}
          strokeWidth={1.5}
          style={{ transformOrigin: "100px 100px" }}
          initial={false}
          animate={still ? { opacity: 0.25 } : { scale: [1, 1.08, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={still ? { duration: 0 } : { duration: 2.4, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <path d={puls} fill="none" stroke={SPUR} strokeWidth={3} strokeLinejoin="round" />
      <motion.path
        d={puls}
        fill="none"
        stroke={LIME}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={still ? { pathLength: 1 } : { pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={still ? { duration: 0 } : { duration: 1.8, times: [0, 0.7, 1], repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
      />
    </g>
  );
}
