"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-lime), transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
        >
          20 Minuten Training.
          <br />
          <span className="text-lime">Ein sichtbarer Unterschied.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
          className="mt-6 max-w-xl text-lg text-muted"
        >
          Effektives EMS-Training für Berufstätige mit wenig Zeit. Einmal pro
          Woche, gelenkschonend, individuell betreut - bei Körperformen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: easeOut }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
          <Button href="/studio" variant="secondary">
            Studio finden
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
