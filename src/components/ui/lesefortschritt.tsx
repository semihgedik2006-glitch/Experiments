"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Der Balken am oberen Rand, der mitläuft.
 *
 * Zwei Gründe, warum er hier steht:
 *
 * Er sagt etwas Nützliches - wie viel von der Seite noch kommt. Auf einer
 * Startseite mit neun Abschnitten ist das keine Kleinigkeit: Ohne ihn weiß
 * niemand, ob nach dem nächsten Scrollen noch zwei oder noch zwanzig
 * Bildschirme folgen.
 *
 * Und er macht das Scrollen zu einer Bewegung statt zu einem Sprung. Genau
 * das war die Rückmeldung zur Startseite: Sie sah aus wie eine Folge
 * einzelner Bilder, nicht wie eine Seite.
 *
 * Die Feder statt des rohen Fortschritts: Ohne sie klebt der Balken exakt
 * am Rad und ruckelt bei jedem Anschlag mit. Mit ihr zieht er weich nach -
 * dieselbe Wirkung, die ein gut gemachtes Menü beim Aufklappen hat.
 *
 * transformOrigin links, weil ein von der Mitte wachsender Balken
 * aussieht, als würde er sich ausdehnen, statt zu füllen.
 */
export function Lesefortschritt() {
  const { scrollYProgress } = useScroll();
  const breite = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      // Über allem außer den Menüs: Der Balken darf beim geöffneten
      // Handymenü nicht darüberliegen.
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-lime"
      style={{ scaleX: breite }}
    />
  );
}
