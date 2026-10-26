"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Target } from "lucide-react";
import { useZiel } from "@/components/ziel/ziel-kontext";
import { ZielMotiv } from "@/components/ziel/ziel-motiv";
import {
  STANDARD_REIHENFOLGE,
  zielInhalte,
  zielInhalt,
  type AbschnittKey,
} from "@/lib/ziel-inhalte";
import { useSprache } from "@/lib/i18n/use-sprache";

/**
 * Die Abschnitte der Startseite in der Reihenfolge, die zum Ziel passt.
 *
 * Die Abschnitte selbst entstehen auf dem Server (Datenbank, Instagram)
 * und kommen fertig hier an - umgestellt wird nur ihre Reihenfolge. Was
 * die Reihenfolge eines Ziels nicht nennt, entfällt für dieses Ziel; so
 * wird die Seite für jeden kürzer. Ohne Ziel steht alles da, wie immer -
 * auch für Suchmaschinen, die nie ein Ziel wählen.
 */
export function ZielAbschnitte({ abschnitte }: { abschnitte: Partial<Record<AbschnittKey, ReactNode>> }) {
  const { ziel } = useZiel();
  const reihenfolge = zielInhalt(ziel, useSprache())?.reihenfolge ?? STANDARD_REIHENFOLGE;
  return (
    <>
      {reihenfolge.map((key) =>
        abschnitte[key] ? <div key={key}>{abschnitte[key]}</div> : null,
      )}
    </>
  );
}

/**
 * Die Ziel-Leiste: erscheint, sobald der erste Bildschirm vorbei ist.
 *
 * Sie zeigt das gewählte Ziel und lässt es wechseln, ohne nach oben zu
 * scrollen. Nach dem Wechsel geht es zu "Erkennst du dich wieder?" - dort
 * beginnt die Seite, die sich gerade umgebaut hat. Ohne Ziel lädt sie
 * zur Wahl ein.
 */
export function ZielLeiste() {
  const { ziel, waehlen } = useZiel();
  const sprache = useSprache();
  const en = sprache === "en";
  const inhalt = zielInhalt(ziel, sprache);
  const [sichtbar, setSichtbar] = useState(false);
  const [offen, setOffen] = useState(false);
  const wenigerBewegung = useReducedMotion();

  useEffect(() => {
    const pruefen = () => {
      const abschnitt = document.getElementById("dein-ziel");
      const unten = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      // Ab dem Zielabschnitt sichtbar, kurz vor dem Seitenende wieder weg -
      // dort steht der Aufruf zum Probetermin und braucht den Platz.
      setSichtbar(!!abschnitt && abschnitt.getBoundingClientRect().top < window.innerHeight * 0.4 && unten > 600);
    };
    pruefen();
    window.addEventListener("scroll", pruefen, { passive: true });
    return () => window.removeEventListener("scroll", pruefen);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- beim Verschwinden zuklappen
    if (!sichtbar) setOffen(false);
  }, [sichtbar]);

  return (
    <AnimatePresence>
      {sichtbar && (
        <motion.div
          initial={wenigerBewegung ? false : { y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={wenigerBewegung ? undefined : { y: -16, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-0 top-[4.5rem] z-40 flex justify-center px-4"
        >
          <div className="on-ink kal-karte max-w-full rounded-3xl border border-white/10 px-2 py-2 shadow-2xl shadow-black/40">
            <button
              type="button"
              aria-expanded={offen}
              onClick={() => setOffen((o) => !o)}
              className="flex w-full items-center gap-3 rounded-full py-1 pl-1 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-accent"
            >
              {inhalt ? (
                <span className="h-8 w-8 shrink-0 rounded-full bg-black/50 p-1">
                  <ZielMotiv ziel={inhalt.wert} className="h-full w-full" />
                </span>
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime" aria-hidden>
                  <Target size={16} />
                </span>
              )}
              <span className="text-muted">{inhalt ? (en ? "Your goal:" : "Dein Ziel:") : en ? "What is your goal?" : "Was ist dein Ziel?"}</span>
              {inhalt && <span className="font-semibold text-foreground">{inhalt.kurz}</span>}
              <ChevronDown
                size={16}
                aria-hidden
                className={`ml-auto text-accent transition-transform ${offen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {offen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex max-w-xl flex-wrap justify-center gap-2 px-2 pb-2 pt-3">
                    {zielInhalte(sprache).map((z) => (
                      <button
                        key={z.wert}
                        type="button"
                        onClick={() => {
                          setOffen(false);
                          waehlen(z.wert);
                          document
                            .getElementById("dein-ziel")
                            ?.scrollIntoView({ behavior: wenigerBewegung ? "auto" : "smooth" });
                        }}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                          z.wert === ziel
                            ? "border-lime bg-lime font-semibold text-on-lime"
                            : "border-white/20 text-foreground/85 hover:border-lime/60"
                        }`}
                      >
                        {z.kurz}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
