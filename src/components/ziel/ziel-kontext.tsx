"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ZielWert } from "@/lib/ziel-inhalte";
import { zielInhalt } from "@/lib/ziel-inhalte";

/**
 * Das Ziel, das jemand oben auf der Startseite gewählt hat.
 *
 * Alle Abschnitte der Startseite lesen es von hier: Der erste Bildschirm
 * antwortet darauf, "Erkennst du dich wieder?" springt auf dasselbe Ziel,
 * und der Knopf zum Probetermin nimmt es mit.
 *
 * Gemerkt wird es für diesen Besuch im sessionStorage. Das Anfrageformular
 * liest denselben Schlüssel und kreuzt das Ziel dort schon an - wer oben
 * "Rücken" gewählt hat, soll es unten nicht noch einmal sagen müssen. Kein
 * Cookie, nichts verlässt den Browser, bevor die Anfrage abgeschickt wird.
 */

export const ZIEL_SPEICHER = "kf-ziel";

type ZielKontext = {
  ziel: ZielWert | null;
  waehlen: (ziel: ZielWert) => void;
  /** Zählt jeden Wechsel mit - daran hängt der Impuls, der über die Seite läuft. */
  wechsel: number;
};

const Kontext = createContext<ZielKontext>({ ziel: null, waehlen: () => {}, wechsel: 0 });

export function ZielProvider({
  children,
  fest,
}: {
  children: ReactNode;
  /**
   * Auf einer Zielseite (/ziel/ruecken) steht das Ziel schon fest. Es gilt
   * dann ab dem ersten Bild - auch auf dem Server - und wird sofort
   * gemerkt, damit das Formular weiter unten es schon angekreuzt hat.
   */
  fest?: ZielWert;
}) {
  const [ziel, setZiel] = useState<ZielWert | null>(() => {
    if (fest && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(ZIEL_SPEICHER, fest);
      } catch {
        // siehe unten
      }
    }
    return fest ?? null;
  });
  const [wechsel, setWechsel] = useState(0);

  // Erst nach dem Aufbau im Browser lesen - auf dem Server gibt es keinen
  // Speicher, und ein anderes erstes Bild verwürfe React.
  useEffect(() => {
    if (fest) return;
    try {
      const gemerkt = sessionStorage.getItem(ZIEL_SPEICHER);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliges Übernehmen aus dem Browser
      if (zielInhalt(gemerkt)) setZiel(gemerkt as ZielWert);
    } catch {
      // Privater Modus oder gesperrter Speicher: dann eben ohne Erinnerung.
    }
  }, [fest]);

  const waehlen = useCallback((neu: ZielWert) => {
    setZiel(neu);
    setWechsel((n) => n + 1);
    try {
      sessionStorage.setItem(ZIEL_SPEICHER, neu);
    } catch {
      // siehe oben
    }
  }, []);

  return (
    <Kontext.Provider value={{ ziel, waehlen, wechsel }}>
      {children}
      <ZielImpuls wechsel={wechsel} />
    </Kontext.Provider>
  );
}

export function useZiel() {
  return useContext(Kontext);
}

/** Link zum Probetermin, mit dem Ziel im Gepäck. */
export function probeterminHref(ziel: ZielWert | null) {
  return ziel ? `/probetermin?ziel=${ziel}` : "/probetermin";
}

/**
 * Der Übergang beim Zielwechsel: Ein Lime-Impuls läuft einmal von oben nach
 * unten über den Bildschirm - so, wie ein Impuls durch den Anzug geht.
 * Während er läuft, sortiert sich die Seite darunter um. Bei "Bewegung
 * reduzieren" entfällt er.
 */
function ZielImpuls({ wechsel }: { wechsel: number }) {
  const still = useReducedMotion();
  if (still) return null;
  return (
    <AnimatePresence>
      {wechsel > 0 && (
        <motion.div
          key={wechsel}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-24"
          initial={{ y: "-6rem", opacity: 1 }}
          animate={{ y: "100vh", opacity: [1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgb(195 245 60 / 0.10) 70%, rgb(195 245 60 / 0.9) 98%, transparent)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
