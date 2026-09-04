"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const stats = [
  { value: 90, suffix: "%", label: "der Muskelfasern gleichzeitig aktiviert" },
  { value: 20, suffix: " Min", label: "pro Trainingseinheit - mehr braucht es nicht" },
  { value: 1, suffix: "x", label: "pro Woche für spürbare Ergebnisse" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, count, value]);

  return (
    <motion.span ref={ref} className="font-display text-5xl font-black text-lime md:text-6xl">
      {rounded}
    </motion.span>
  );
}

export function StatsStrip() {
  return (
    <section className="border-y border-border bg-surface py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            Warum EMS
          </span>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Drei Zahlen erklären, warum 20 Minuten reichen - und warum EMS
            gerade für Menschen mit vollem Kalender funktioniert.
          </p>
        </Reveal>

        {/* Trennlinien nur ab sm: untereinander wirken sie wie abgehackte
            Kästchen statt wie eine zusammengehörige Reihe. */}
        <Reveal
          delay={0.1}
          className="mt-14 grid gap-12 text-center sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="sm:px-6">
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="mx-auto mt-3 max-w-[220px] text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
