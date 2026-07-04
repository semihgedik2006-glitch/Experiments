"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";

const easeOut = [0.16, 1, 0.3, 1] as const;

const lineVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 1.8 } },
};

const wordVariants: Variants = {
  hidden: { y: "110%" },
  visible: { y: 0, transition: { duration: 0.7, ease: easeOut } },
};

function StaggeredLine({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, index) => (
        <span key={index} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span variants={wordVariants} className="inline-block">
            {word}
            {" "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: backdrop drifts slower than the content while scrolling away.
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-background"
    >
      {/* Aurora backdrop: two soft color fields drifting slowly. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[8%] h-[560px] w-[560px] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, var(--color-lime), transparent 65%)",
          opacity: "var(--aurora-opacity)",
          y: auroraY,
        }}
        animate={{ x: [0, 60, -20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 right-[4%] h-[620px] w-[620px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle, var(--color-electric-blue), transparent 65%)",
          opacity: "calc(var(--aurora-opacity) * 0.55)",
          y: auroraY,
        }}
        animate={{ x: [0, -50, 30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blueprint grid, masked so it dissolves toward the edges. */}
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 opacity-40" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="w-full">
        <Container className="flex flex-col items-center py-24 text-center md:py-28">
          {/* Logo opens the page big and alone, then settles into place as
              part of the normal flow - it can never overlap the headline. */}
          <motion.div
            initial={{ opacity: 0, scale: 2.1, y: 150 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              opacity: { duration: 0.7, ease: "easeOut" },
              scale: { duration: 0.9, delay: 1.0, ease: easeOut },
              y: { duration: 0.9, delay: 1.0, ease: easeOut },
            }}
            className="mb-10"
          >
            <Logo className="h-14 w-auto sm:h-16" />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6, ease: easeOut }}
            className="mb-8 rounded-full border border-border bg-surface-raised/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted backdrop-blur"
          >
            EMS-Studio in Hürth &middot; Köln &middot; Brühl
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={lineVariants}
            className="font-display max-w-5xl text-[2.6rem] font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl"
          >
            <StaggeredLine text="20 Minuten Training." />
            <br />
            <StaggeredLine text="Ein sichtbarer Unterschied." className="text-glow text-lime" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.5, ease: easeOut }}
            className="mt-8 max-w-xl text-lg text-muted"
          >
            Effektives EMS-Training für Berufstätige mit wenig Zeit. Einmal pro
            Woche, gelenkschonend, individuell betreut - bei Körperformen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.65, ease: easeOut }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
            <Button href="/ems-training" variant="secondary">
              Wie EMS funktioniert
            </Button>
          </motion.div>
        </Container>
      </motion.div>

      {/* Scroll cue - fades out as soon as the visitor starts scrolling. */}
      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.6 }}
          className="flex flex-col items-center gap-1 text-muted"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}
