"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmsVest } from "@/components/home/ems-vest";

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
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--color-lime), transparent 70%)",
          y: glowY,
        }}
        animate={{
          scale: [1, 1.25, 0.95, 1],
          opacity: [0.2, 0.35, 0.18, 0.2],
          x: [0, 40, -30, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

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

          <motion.h1
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
          >
            20 Minuten Training.
            <br />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: easeOut }}
              className="inline-block text-lime"
            >
              Ein sichtbarer Unterschied.
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

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: easeOut }}
            className="mt-16"
          >
            <EmsVest />
            <p className="mt-3 text-xs uppercase tracking-widest text-muted">
              Elektro-Muskel-Stimulation live
            </p>
          </motion.div>
        </Container>
      </motion.div>
    </section>
  );
}
