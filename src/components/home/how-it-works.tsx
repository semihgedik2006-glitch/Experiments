"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";

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
  const wenigerBewegung = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  // Der Farbfleck zieht langsamer mit als der Inhalt - das ist der
  // Tiefeneindruck. Bei "Bewegung reduzieren" steht er still.
  const blobY = useTransform(scrollYProgress, [0, 1], wenigerBewegung ? [0, 0] : [80, -80]);

  /**
   * Die Linie zwischen den drei Schritten zeichnet sich beim Scrollen.
   *
   * Sie ist der Grund, warum "drei Schritte" hier auch als drei Schritte zu
   * lesen ist: Vorher standen drei Absätze nebeneinander, und nur die
   * Nummern sagten, dass sie aufeinander folgen. Eine Linie, die von 01
   * nach 03 wächst, sagt es ohne Worte.
   *
   * Der Bereich von 0,32 bis 0,62 ist bewusst eng: Die Linie soll fertig
   * sein, wenn der Abschnitt in der Mitte des Bildschirms steht - nicht
   * erst, wenn er ihn schon wieder verlässt.
   */
  const linie = useTransform(scrollYProgress, [0.32, 0.62], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-border bg-surface py-20 sm:py-24 md:py-32"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-48 top-1/4 h-[520px] w-[520px] opacity-10"
        style={{ background: "radial-gradient(circle, var(--color-lime), transparent 70%)", y: blobY }}
      />
      <Container>
        <SectionHeader
          kicker="In drei Schritten"
          title="So einfach startest du mit EMS"
          intro="Elektro-Muskel-Stimulation aktiviert bis zu 90% deiner Muskelfasern gleichzeitig - deutlich mehr als klassisches Training."
          className="mb-16"
        />

        <div className="relative">
          {/* Die Linie liegt auf Höhe der Nummern und nur ab md: Auf dem
              Handy stehen die Schritte untereinander, dort wäre eine
              waagerechte Linie zwischen ihnen sinnlos. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[8%] right-[8%] top-[26px] hidden h-px bg-border md:block"
          >
            <motion.div
              className="h-full origin-left bg-lime"
              style={{ scaleX: linie }}
            />
          </div>

          <Stagger className="relative grid gap-10 md:grid-cols-3">
            {steps.map(({ step, title, text }) => (
              <StaggerItem key={step}>
                {/* Die Nummer bekommt einen eigenen Grund, damit die Linie
                    hinter ihr durchläuft und nicht durch sie hindurch. */}
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block bg-surface pr-4 text-5xl font-black leading-none text-accent-strong"
                >
                  {step}
                </motion.span>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
