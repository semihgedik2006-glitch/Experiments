"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LightningStrike } from "@/components/home/lightning-strike";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: background glow drifts slower than the foreground content while scrolling past the hero.
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background">
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full opacity-25 blur-[110px]"
        style={{
          background: "radial-gradient(circle, var(--color-lime), transparent 70%)",
          y: glowY,
        }}
        animate={{
          scale: [1, 1.35, 0.85, 1.2, 1],
          opacity: [0.18, 0.32, 0.12, 0.28, 0.18],
          x: [0, 60, -50, 25, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <LightningStrike />

      <motion.div style={{ y: contentY, opacity: contentOpacity }}>
        <Container className="relative flex flex-col items-center py-28 text-center md:py-40">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="mb-6 rounded-full border border-border px-4 py-1 text-xs uppercase tracking-widest text-muted"
          >
            EMS-Studio in Hürth &middot; Köln &middot; Brühl
          </motion.span>

          {/* Emerges from the logo up in the header: starts tiny/blurred near the nav, then grows into place. */}
          <motion.h1
            initial={{ opacity: 0, y: -210, scale: 0.16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.15, delay: 0.15, ease: easeOut }}
            style={{ transformOrigin: "top center" }}
            className="font-display max-w-4xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
          >
            <motion.span
              className="inline-block"
              animate={{ opacity: [1, 1, 0.2, 1, 0.3, 1, 1, 0.4, 1] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 3.5,
                delay: 1.4,
                times: [0, 0.4, 0.43, 0.47, 0.55, 0.59, 0.75, 0.79, 1],
                ease: "linear",
              }}
            >
              20 Minuten Training.
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.75, ease: easeOut }}
              className="relative inline-block text-lime"
              style={{ textShadow: "0 0 24px var(--color-lime)" }}
            >
              <motion.span
                className="inline-block"
                animate={{ opacity: [1, 1, 0.35, 1, 0.25, 1, 1, 0.5, 1] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 3.2,
                  delay: 2.2,
                  times: [0, 0.42, 0.45, 0.49, 0.58, 0.62, 0.78, 0.82, 1],
                  ease: "linear",
                }}
              >
                Ein sichtbarer Unterschied.
              </motion.span>
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
            className="mt-6 max-w-xl text-lg text-muted"
          >
            Effektives EMS-Training für Berufstätige mit wenig Zeit. Einmal pro
            Woche, gelenkschonend, individuell betreut - bei Körperformen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease: easeOut }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
            <Button href="/studio" variant="secondary">
              Studio finden
            </Button>
          </motion.div>
        </Container>
      </motion.div>
    </section>
  );
}
