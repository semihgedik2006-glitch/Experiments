"use client";

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";

/**
 * Überschrift, die sich Wort für Wort aufbaut, sobald sie ins Bild kommt.
 *
 * Dieselbe Bewegung wie die Hauptüberschrift im ersten Bildschirm - jedes
 * Wort steigt aus seiner eigenen Zeile herauf. Dort läuft sie beim Laden,
 * hier beim Hinscrollen, einmal. So zieht sich eine Handschrift durch die
 * ganze Seite, ohne dass der Anfang unruhiger wird.
 *
 * Bei "Bewegung reduzieren" nimmt MotionConfig (motion-provider) die
 * Verschiebung heraus; die Wörter blenden dann nur weich ein.
 */

const zeile: Variants = {
  verborgen: {},
  sichtbar: { transition: { staggerChildren: 0.055 } },
};
const wort: Variants = {
  verborgen: { y: "105%", opacity: 0 },
  sichtbar: { y: "0%", opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export function WortReveal({ text }: { text: string }) {
  const woerter = text.split(" ");
  return (
    <motion.span
      initial="verborgen"
      whileInView="sichtbar"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={zeile}
    >
      {woerter.map((w, i) => (
        // Das Leerzeichen steht zwischen den Wortcontainern: Innerhalb des
        // beschnittenen Containers würde es verschluckt.
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <motion.span variants={wort} className="inline-block">
              {w}
            </motion.span>
          </span>
          {i < woerter.length - 1 && " "}
        </Fragment>
      ))}
    </motion.span>
  );
}
