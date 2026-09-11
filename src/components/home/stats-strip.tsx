"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { Kennzahl } from "@/lib/beweise";

// Hier stand als erste Zahl eine hochzählende "90 %" für die
// aktivierten Muskelfasern. Die steht in jedem zweiten EMS-Prospekt,
// aber nirgends eine Quelle dazu - und als hochzählende Ziffer trat sie
// auf wie ein Messwert.
//
// Was jetzt hier steht, kommt vollständig aus der eigenen Datenbank
// (siehe src/lib/beweise.ts): die Dauer einer Einheit, die Zahl der
// Standorte und die freien Termine der nächsten sieben Tage. Das sind
// Zahlen, die niemand nachschlagen muss, die kein Wettbewerber
// abschreiben kann und die sich jeden Tag von selbst aktualisieren - und
// sie beantworten genau die Frage, mit der jemand hier ist: Kann ich da
// hin, und wann?
//
// Keine Zahl wird hier hineingeschrieben. Kommt ein Studio dazu, stimmt
// die Seite am selben Tag.

/**
 * Eine hochzählende Zahl.
 *
 * Der Startwert ist die ENDZAHL und nicht 0 - das ist der Unterschied
 * zwischen "steht 20" und "steht 0". Vorher begann der Zähler bei null
 * und zählte erst hoch, wenn jemand hinscrollte. Für jeden, der nie so
 * weit scrollte, stand dort dauerhaft "0 Min"; im ausgelieferten HTML,
 * das eine Suchmaschine liest, ebenfalls. Ausgerechnet bei den Zahlen,
 * die Vertrauen schaffen sollen, stand also überall eine Null.
 *
 * Jetzt steht die richtige Zahl von Anfang an da und springt erst im
 * Moment des Sichtbarwerdens auf null, um hochzulaufen.
 */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const wenigerBewegung = useReducedMotion();
  const count = useMotionValue(value);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    // Wer "Bewegung reduzieren" eingeschaltet hat, bekommt die Zahl
    // sofort. Eine hochzählende Ziffer ist zwar keine Bewegung im Raum,
    // aber flimmernder Text - und genau davon soll die Einstellung
    // befreien.
    if (wenigerBewegung) {
      count.set(value);
      return;
    }
    count.set(0);
    const controls = animate(count, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, count, value, wenigerBewegung]);

  return (
    <motion.span ref={ref} className="font-display text-5xl font-black text-accent md:text-6xl">
      {rounded}
    </motion.span>
  );
}

export function StatsStrip({ zahlen }: { zahlen: Kennzahl[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const wenigerBewegung = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  // Der Schein wandert beim Scrollen quer durch das dunkle Band. Er ist der
  // einzige Grund, warum dieser Abschnitt beim Vorbeiscrollen nicht wie ein
  // stehendes Bild wirkt - und er kostet nichts, weil sich nur ein Verlauf
  // verschiebt.
  const scheinX = useTransform(
    scrollYProgress,
    [0, 1],
    wenigerBewegung ? ["0%", "0%"] : ["-18%", "18%"],
  );
  const scheinOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.7, 0.25]);

  return (
    <section ref={sectionRef} className="on-ink relative overflow-hidden py-20 sm:py-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[760px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(ellipse, var(--color-lime), transparent 68%)",
          x: scheinX,
          opacity: scheinOpacity,
          // Ohne diese Dämpfung liegt ein sattes Limette über dem Band und
          // die Zahlen darauf verlieren ihren Kontrast.
          mixBlendMode: "overlay",
        }}
      />
      <Container className="relative">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Warum EMS
          </span>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Keine Zahlen aus Prospekten - das hier steht gerade so in unserem
            Terminkalender.
          </p>
        </Reveal>

        {/* Trennlinien nur ab sm: untereinander wirken sie wie abgehackte
            Kästchen statt wie eine zusammengehörige Reihe. */}
        {/* Die Spaltenzahl richtet sich nach dem, was tatsächlich da ist.
            Fest auf drei gestellt, klaffte bei einer fehlenden Zahl eine
            leere Spalte - und die sieht aus wie ein Fehler. */}
        <Reveal
          delay={0.1}
          className={`mt-14 grid gap-12 text-center sm:gap-0 sm:divide-x sm:divide-border ${
            zahlen.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
          {zahlen.map((zahl) => (
            <div key={zahl.label} className="sm:px-6">
              <Counter value={Number(zahl.wert)} suffix={zahl.einheit ?? ""} />
              <p className="mx-auto mt-3 max-w-[230px] text-sm text-muted">{zahl.label}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
