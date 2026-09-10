"use client";

import { motion } from "motion/react";

/**
 * Der kurze Strich vor jeder Abschnittsüberschrift.
 *
 * Er war bisher ein festes Strichlein. Jetzt wächst er von links nach
 * rechts, sobald der Abschnitt ins Bild kommt.
 *
 * Warum ausgerechnet dieses winzige Element: Es ist das einzige
 * Gestaltungsmerkmal, das auf JEDEM Abschnitt der Website wiederkehrt -
 * Startseite, EMS-Training, Preise, Standorte, Blog. Eine Bewegung an
 * dieser Stelle wiederholt sich damit über die ganze Seite und wird zur
 * Handschrift, während dieselbe Bewegung an einer einzelnen Stelle nur ein
 * Effekt wäre.
 *
 * Und sie kostet praktisch nichts: eine Skalierung auf einem acht Pixel
 * breiten Element, einmal je Abschnitt, danach nie wieder (once: true).
 */
export function KickerStrich() {
  return (
    <motion.span
      aria-hidden
      className="h-px w-8 origin-left bg-accent/50"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    />
  );
}
