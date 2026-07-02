"use client";

import { motion } from "motion/react";

// Jagged bolt paths spanning the full hero, each on its own strike rhythm.
const bolts = [
  { d: "M120,-20 L95,110 L155,125 L60,300 L125,270 L30,540", delay: 0, repeatDelay: 4.6 },
  { d: "M700,-30 L735,150 L660,165 L755,360 L680,330 L770,560", delay: 1.8, repeatDelay: 4.6 },
  { d: "M420,-20 L455,90 L390,105 L470,260 L410,240 L460,480", delay: 3.1, repeatDelay: 4.6 },
];

export function LightningStrike() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Subtle full-hero flash synced with each strike */}
      {bolts.map((bolt, i) => (
        <motion.div
          key={`flash-${i}`}
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 20%, var(--color-lime), transparent 45%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.12, 0.02, 0.08, 0] }}
          transition={{
            duration: 0.5,
            times: [0, 0.15, 0.3, 0.4, 1],
            repeat: Infinity,
            repeatDelay: bolt.repeatDelay,
            delay: bolt.delay,
            ease: "easeOut",
          }}
        />
      ))}

      <svg
        className="h-full w-full"
        viewBox="0 0 800 540"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <filter id="bolt-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {bolts.map((bolt, i) => (
          <g key={i} filter="url(#bolt-glow)">
            {/* Lime outer glow stroke */}
            <motion.path
              d={bolt.d}
              fill="none"
              stroke="var(--color-lime)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 0.55, 0.55, 0] }}
              transition={{
                duration: 0.5,
                times: [0, 0.35, 0.7, 1],
                repeat: Infinity,
                repeatDelay: bolt.repeatDelay,
                delay: bolt.delay,
                ease: "easeOut",
              }}
            />
            {/* Bright white core so the bolt reads clearly over the glow */}
            <motion.path
              d={bolt.d}
              fill="none"
              stroke="#ffffff"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 0.5,
                times: [0, 0.35, 0.7, 1],
                repeat: Infinity,
                repeatDelay: bolt.repeatDelay,
                delay: bolt.delay,
                ease: "easeOut",
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
