"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/logo";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-15 blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--color-lime), transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <Link href="/" aria-label="Zur Startseite">
          <Logo className="h-10 w-auto" />
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
        className="font-display text-glow mt-10 text-8xl font-black text-lime md:text-9xl"
      >
        404
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
        className="mt-6 text-2xl font-bold tracking-tight md:text-3xl"
      >
        Diese Seite gibt es nicht.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
        className="mt-3 max-w-md text-muted"
      >
        Der Link ist veraltet oder die Adresse wurde falsch eingegeben. Zurück
        zur Startseite - oder direkt einen Probetermin sichern.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: easeOut }}
        className="mt-10 flex flex-col gap-4 sm:flex-row"
      >
        <Link
          href="/"
          className="rounded-full bg-lime px-7 py-3 text-sm font-semibold text-[#0d0d0f] transition-transform hover:scale-105 active:scale-95"
        >
          Zur Startseite
        </Link>
        <Link
          href="/probetermin"
          className="rounded-full border border-border px-7 py-3 text-sm font-semibold transition-colors hover:border-lime hover:text-lime"
        >
          Probetermin buchen
        </Link>
      </motion.div>
    </div>
  );
}
