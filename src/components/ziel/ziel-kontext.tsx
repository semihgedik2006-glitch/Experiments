"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
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
};

const Kontext = createContext<ZielKontext>({ ziel: null, waehlen: () => {} });

export function ZielProvider({ children }: { children: ReactNode }) {
  const [ziel, setZiel] = useState<ZielWert | null>(null);

  // Erst nach dem Aufbau im Browser lesen - auf dem Server gibt es keinen
  // Speicher, und ein anderes erstes Bild verwürfe React.
  useEffect(() => {
    try {
      const gemerkt = sessionStorage.getItem(ZIEL_SPEICHER);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliges Übernehmen aus dem Browser
      if (zielInhalt(gemerkt)) setZiel(gemerkt as ZielWert);
    } catch {
      // Privater Modus oder gesperrter Speicher: dann eben ohne Erinnerung.
    }
  }, []);

  const waehlen = useCallback((neu: ZielWert) => {
    setZiel(neu);
    try {
      sessionStorage.setItem(ZIEL_SPEICHER, neu);
    } catch {
      // siehe oben
    }
  }, []);

  return <Kontext.Provider value={{ ziel, waehlen }}>{children}</Kontext.Provider>;
}

export function useZiel() {
  return useContext(Kontext);
}

/** Link zum Probetermin, mit dem Ziel im Gepäck. */
export function probeterminHref(ziel: ZielWert | null) {
  return ziel ? `/probetermin?ziel=${ziel}` : "/probetermin";
}
