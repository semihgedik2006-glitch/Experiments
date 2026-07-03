"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

const steps = [
  {
    step: "01",
    title: "Kostenloses Probetraining",
    text: "Du lernst das Studio, dein Trainer-Team und die EMS-Technologie in einer unverbindlichen Einheit kennen.",
  },
  {
    step: "02",
    title: "Individueller Trainingsplan",
    text: "Gemeinsam legen wir deine Ziele fest - Abnehmen, Muskelaufbau oder Rückengesundheit.",
  },
  {
    step: "03",
    title: "20 Minuten, einmal pro Woche",
    text: "Ein kurzes, intensives Training reicht für spürbare Ergebnisse - ganz ohne großen Zeitaufwand.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  // Decorative blob drifts slower than the content for a parallax depth cue.
  const blobY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/4 h-[380px] w-[380px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--color-lime), transparent 70%)", y: blobY }}
      />
      <Container>
        <Reveal className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            So einfach startest du mit EMS
          </h2>
          <p className="mt-4 text-muted">
            Elektro-Muskel-Stimulation aktiviert bis zu 90% deiner Muskelfasern
            gleichzeitig - deutlich mehr als klassisches Training.
          </p>
        </Reveal>

        <Stagger className="grid gap-10 md:grid-cols-3">
          {steps.map(({ step, title, text }) => (
            <StaggerItem key={step}>
              <motion.span
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.25 }}
                className="inline-block text-5xl font-black text-lime"
              >
                {step}
              </motion.span>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
