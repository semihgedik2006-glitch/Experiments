"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
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
  const wenigerBewegung = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    // Wer "Bewegung reduzieren" eingeschaltet hat, bekommt die Zahl
    // sofort. Eine hochzählende Ziffer ist zwar keine Bewegung im Raum,
    // aber flimmernder Text - und genau davon soll die Einstellung
    // befreien.
    if (wenigerBewegung) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, count, value, wenigerBewegung]);

  return (
    <motion.span ref={ref} className="font-display text-5xl font-black text-accent md:text-6xl">
      {rounded}
    </motion.span>
  );
}

export function StatsStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const wenigerBewegung = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  // Der Schein wandert beim Scrollen quer durch das dunkle Band. Er ist der
  // einzige Grund, warum dieser Abschnitt beim Vorbeiscrollen nicht wie ein
  // stehendes Bild wirkt - und er kostet nichts, weil sich nur ein Verlauf
  // verschiebt.
  const scheinX = useTransform(
    scrollYProgress,
    [0, 1],
    wenigerBewegung ? ["0%", "0%"] : ["-18%", "18%"],
  );
  const scheinOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.7, 0.25]);

  return (
    <section ref={sectionRef} className="on-ink relative overflow-hidden py-20 sm:py-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[760px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(ellipse, var(--color-lime), transparent 68%)",
          x: scheinX,
          opacity: scheinOpacity,
          // Ohne diese Dämpfung liegt ein sattes Limette über dem Band und
          // die Zahlen darauf verlieren ihren Kontrast.
          mixBlendMode: "overlay",
        }}
      />
      <Container className="relative">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
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
