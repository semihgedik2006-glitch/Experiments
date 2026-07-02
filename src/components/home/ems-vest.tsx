"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

type Pad = { id: string; cx: number; cy: number; wire: string; delay: number };

// Electrode positions roughly matching where an EMS vest places its pads
// (chest, abs, obliques, upper traps), each with a wire path back to the
// control unit on the belt and its own pulse timing offset.
const pads: Pad[] = [
  { id: "chest-l", cx: 78, cy: 100, wire: "M100,155 C90,140 82,125 78,100", delay: 0 },
  { id: "chest-r", cx: 122, cy: 100, wire: "M100,155 C110,140 118,125 122,100", delay: 0.35 },
  { id: "abs", cx: 100, cy: 132, wire: "M100,155 L100,132", delay: 0.7 },
  { id: "oblique-l", cx: 62, cy: 138, wire: "M100,155 C85,150 70,145 62,138", delay: 1.05 },
  { id: "oblique-r", cx: 138, cy: 138, wire: "M100,155 C115,150 130,145 138,138", delay: 1.4 },
  { id: "trap-l", cx: 69, cy: 52, wire: "M100,155 C85,120 72,90 69,52", delay: 1.75 },
  { id: "trap-r", cx: 131, cy: 52, wire: "M100,155 C115,120 128,90 131,52", delay: 2.1 },
];

const CYCLE = 2.8;

function Spark({ cx, cy }: { cx: number; cy: number }) {
  const lines = [0, 60, 120, 180, 240, 300];
  return (
    <g>
      {lines.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * 6;
        const y1 = cy + Math.sin(rad) * 6;
        const x2 = cx + Math.cos(rad) * 13;
        const y2 = cy + Math.sin(rad) * 13;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-lime)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function ElectrodePad({ cx, cy, delay }: Pad) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={7}
      fill="var(--color-lime)"
      style={{ filter: "drop-shadow(0 0 6px var(--color-lime))" }}
      animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }}
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
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="10 120"
        animate={{ strokeDashoffset: [130, -10] }}
        transition={{ duration: CYCLE, repeat: Infinity, ease: "linear", delay }}
      />
    </>
  );
}

function useTiltTransform(value: MotionValue<number>) {
  const spring = useSpring(value, { stiffness: 150, damping: 15, mass: 0.4 });
  return useTransform(spring, [-0.5, 0.5], [-10, 10]);
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
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="mx-auto w-full max-w-[220px] sm:max-w-[260px]"
    >
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
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="100"
          cy="153"
          r="3"
          fill="var(--color-lime)"
          style={{ filter: "drop-shadow(0 0 5px var(--color-lime))" }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Electrode pads + spark bursts, timed to each pad's pulse */}
        {pads.map((pad) => (
          <g key={pad.id}>
            <ElectrodePad {...pad} />
            <motion.g
              animate={{ opacity: [0, 0, 1, 0, 0] }}
              transition={{ duration: CYCLE, repeat: Infinity, ease: "linear", delay: pad.delay, times: [0, 0.38, 0.5, 0.62, 1] }}
            >
              <Spark cx={pad.cx} cy={pad.cy} />
            </motion.g>
          </g>
        ))}
      </svg>
    </motion.div>
  );
}
