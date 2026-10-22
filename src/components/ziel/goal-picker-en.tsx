"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ZielMotiv } from "@/components/ziel/ziel-motiv";
import { ZIEL_EREIGNIS, ZIEL_SPEICHER } from "@/components/ziel/ziel-kontext";
import { GOALS_EN } from "@/lib/ziel-inhalte-en";
import type { ZielWert } from "@/lib/ziel-inhalte";

const weich = [0.16, 1, 0.3, 1] as const;

/**
 * "What do you want to achieve?" - die Zielauswahl der englischen Seite.
 *
 * Kleiner als auf der deutschen Startseite: Die englische Seite ist eine
 * einzige Landingpage mit dem Formular darunter. Die Wahl zeigt, wie das
 * Training für dieses Ziel aussieht, und kreuzt es im Formular schon an -
 * über sessionStorage und ein Ereignis, weil das Formular dann bereits
 * auf der Seite steht.
 */
export function GoalPickerEn() {
  const [ziel, setZiel] = useState<ZielWert | null>(null);
  const still = useReducedMotion();
  const inhalt = GOALS_EN.find((g) => g.wert === ziel);

  function waehlen(wert: ZielWert) {
    setZiel(wert);
    try {
      sessionStorage.setItem(ZIEL_SPEICHER, wert);
    } catch {
      // Ohne Speicher eben ohne Vorauswahl nach einem Neuladen.
    }
    window.dispatchEvent(new CustomEvent(ZIEL_EREIGNIS, { detail: wert }));
  }

  return (
    <section className="on-ink relative overflow-hidden py-16 md:py-20">
      <Container className="max-w-4xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What do you want to achieve?</h2>
        <p className="mt-3 text-muted">Pick your goal – and see what your training for it looks like.</p>

        <div role="radiogroup" aria-label="Your goal" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GOALS_EN.map((g) => {
            const aktiv = g.wert === ziel;
            return (
              <button
                key={g.wert}
                type="button"
                role="radio"
                aria-checked={aktiv}
                onClick={() => waehlen(g.wert)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  aktiv ? "border-lime bg-lime/10" : "border-white/15 bg-white/[0.03] hover:border-lime/60"
                }`}
              >
                <span className="h-11 w-11 shrink-0 rounded-xl bg-black/40 p-1.5">
                  <ZielMotiv ziel={g.wert} stehend={!aktiv} className="h-full w-full" />
                </span>
                <span className="font-semibold">{g.kurz}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {inhalt && (
            <motion.div
              key={inhalt.wert}
              initial={still ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={still ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: weich }}
              className="kal-karte mt-8 rounded-3xl p-6 sm:p-8"
            >
              <div className="grid gap-8 sm:grid-cols-[1fr_8rem]">
                <div>
                  <p className="text-lg font-semibold">{inhalt.antwort}</p>
                  <p className="mt-6 text-sm font-semibold text-accent">Sound familiar?</p>
                  <ul className="mt-3 space-y-2">
                    {inhalt.erkennst.map((satz, i) => (
                      <motion.li
                        key={satz}
                        initial={still ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.08, ease: weich }}
                        className="flex gap-3"
                      >
                        <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                        {satz}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="mx-auto h-32 w-32 rounded-2xl bg-black/40 p-3 sm:order-last">
                  <ZielMotiv ziel={inhalt.wert} className="h-full w-full" />
                </div>
              </div>

              <dl className="mt-8 grid gap-5 sm:grid-cols-3">
                {inhalt.soArbeiten.map((punkt) => (
                  <div key={punkt.titel} className="border-t border-lime/40 pt-4">
                    <dt className="font-semibold">{punkt.titel}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-muted">{punkt.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-muted">{inhalt.hinweis}</p>

              <a
                href="#book"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3 font-semibold text-on-lime transition-opacity hover:opacity-90"
              >
                Book a free trial for this goal
                <ArrowDown size={16} aria-hidden />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
