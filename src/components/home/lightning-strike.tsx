"use client";

import { motion } from "motion/react";

// Small, jagged accent bolts - subtle blue static-discharge flickers rather
// than a full-screen storm.
const bolts = [
  { d: "M130,20 L118,70 L145,78 L110,145", delay: 0, repeatDelay: 5.2 },
  { d: "M690,40 L705,95 L678,102 L700,170", delay: 2.1, repeatDelay: 5.2 },
  { d: "M410,10 L425,55 L398,62 L418,120", delay: 3.6, repeatDelay: 5.2 },
];

export function LightningStrike() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="h-full w-full" viewBox="0 0 800 540" preserveAspectRatio="xMidYMin slice">
        <defs>
          <filter id="bolt-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {bolts.map((bolt, i) => (
          <g key={i} filter="url(#bolt-glow)">
            <motion.path
              d={bolt.d}
              fill="none"
              stroke="var(--color-electric-blue)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 0.4, 0.4, 0] }}
              transition={{
                duration: 0.4,
                times: [0, 0.35, 0.7, 1],
                repeat: Infinity,
                repeatDelay: bolt.repeatDelay,
                delay: bolt.delay,
                ease: "easeOut",
              }}
            />
            <motion.path
              d={bolt.d}
              fill="none"
              stroke="#eaf6ff"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 0.8, 0.8, 0] }}
              transition={{
                duration: 0.4,
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
