"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

type Pad = { id: string; cx: number; cy: number; wire: string; delay: number };

// Electrode positions roughly matching where an EMS vest places its pads
// (chest, abs, obliques, upper traps), each with a wire path back to the
// control unit on the belt and its own pulse timing offset.
const pads: Pad[] = [
  { id: "chest-l", cx: 78, cy: 100, wire: "M100,155 C90,140 82,125 78,100", delay: 0 },
  { id: "chest-r", cx: 122, cy: 100, wire: "M100,155 C110,140 118,125 122,100", delay: 0.2 },
  { id: "abs", cx: 100, cy: 132, wire: "M100,155 L100,132", delay: 0.4 },
  { id: "oblique-l", cx: 62, cy: 138, wire: "M100,155 C85,150 70,145 62,138", delay: 0.6 },
  { id: "oblique-r", cx: 138, cy: 138, wire: "M100,155 C115,150 130,145 138,138", delay: 0.8 },
  { id: "trap-l", cx: 69, cy: 52, wire: "M100,155 C85,120 72,90 69,52", delay: 1.0 },
  { id: "trap-r", cx: 131, cy: 52, wire: "M100,155 C115,120 128,90 131,52", delay: 1.2 },
];

const CYCLE = 1.5;

function Spark({ cx, cy }: { cx: number; cy: number }) {
  const lines = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g>
      {lines.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * 6;
        const y1 = cy + Math.sin(rad) * 6;
        const x2 = cx + Math.cos(rad) * 20;
        const y2 = cy + Math.sin(rad) * 20;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-lime)"
            strokeWidth={2}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px var(--color-lime))" }}
          />
        );
      })}
    </g>
  );
}

function ShockRing({ cx, cy, delay }: { cx: number; cy: number; delay: number }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={7}
      fill="none"
      stroke="var(--color-lime)"
      strokeWidth={1.5}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 0.8, 0], scale: [0.6, 2.6, 3.2] }}
      transition={{ duration: CYCLE, repeat: Infinity, ease: "easeOut", delay }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}

function ElectrodePad({ cx, cy, delay }: Pad) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={7}
      fill="var(--color-lime)"
      style={{ filter: "drop-shadow(0 0 12px var(--color-lime))" }}
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.55, 0.7] }}
      transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Wire({ d, delay }: { d: string; delay: number }) {
  return (
    <>
      <path d={d} stroke="var(--border-color)" strokeWidth={2} fill="none" strokeLinecap="round" />
      <motion.path
        d={d}
        stroke="var(--color-lime)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="14 110"
        style={{ filter: "drop-shadow(0 0 5px var(--color-lime))" }}
        animate={{ strokeDashoffset: [130, -14] }}
        transition={{ duration: CYCLE, repeat: Infinity, ease: "linear", delay }}
      />
    </>
  );
}

function useTiltTransform(value: MotionValue<number>) {
  const spring = useSpring(value, { stiffness: 150, damping: 15, mass: 0.4 });
  return useTransform(spring, [-0.5, 0.5], [-16, 16]);
}

export function EmsVest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useTiltTransform(pointerX);
  const rotateX = useTransform(useTiltTransform(pointerY), (v) => -v);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 800 }}
      animate={{ y: [0, -14, 0], rotate: [0, -1.2, 1.2, -0.6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto w-full max-w-[260px] sm:max-w-[320px]"
    >
      {/* Glow behind the vest that throbs with the whole cycle */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-lime), transparent 70%)" }}
        initial={{ opacity: 0.15, scale: 0.8 }}
        animate={{ opacity: [0.15, 0.55, 0.15], scale: [0.8, 1.15, 0.8] }}
        transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 200 260" className="h-auto w-full overflow-visible">
        {/* Wires from the control unit to each electrode */}
        {pads.map((pad) => (
          <Wire key={pad.id} d={pad.wire} delay={pad.delay} />
        ))}

        {/* Shoulder straps */}
        <rect
          x="60"
          y="28"
          width="16"
          height="58"
          rx="8"
          transform="rotate(-9 68 57)"
          fill="var(--surface-raised)"
          stroke="var(--border-color)"
          strokeWidth={2}
        />
        <rect
          x="124"
          y="28"
          width="16"
          height="58"
          rx="8"
          transform="rotate(9 132 57)"
          fill="var(--surface-raised)"
          stroke="var(--border-color)"
          strokeWidth={2}
        />

        {/* Vest torso */}
        <rect
          x="52"
          y="72"
          width="96"
          height="148"
          rx="30"
          fill="var(--surface-raised)"
          stroke="var(--border-color)"
          strokeWidth={2.5}
        />
        {/* Collar notch */}
        <ellipse cx="100" cy="76" rx="20" ry="13" fill="var(--background)" />

        {/* Belt with control unit */}
        <rect x="48" y="146" width="104" height="13" rx="6.5" fill="var(--surface)" stroke="var(--border-color)" strokeWidth={2} />
        <motion.rect
          x="88"
          y="142"
          width="24"
          height="22"
          rx="6"
          fill="var(--foreground)"
          animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.06, 1] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 153px" }}
        />
        <motion.circle
          cx="100"
          cy="153"
          r="3.5"
          fill="var(--color-lime)"
          style={{ filter: "drop-shadow(0 0 8px var(--color-lime))" }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Electrode pads + shockwaves + spark bursts, timed to each pad's pulse */}
        {pads.map((pad) => (
          <g key={pad.id}>
            <ShockRing cx={pad.cx} cy={pad.cy} delay={pad.delay} />
            <ElectrodePad {...pad} />
            <motion.g
              animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
              transition={{ duration: CYCLE, repeat: Infinity, ease: "linear", delay: pad.delay, times: [0, 0.32, 0.42, 0.5, 0.58, 1] }}
            >
              <Spark cx={pad.cx} cy={pad.cy} />
            </motion.g>
          </g>
        ))}
      </svg>
    </motion.div>
  );
}
