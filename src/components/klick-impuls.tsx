"use client";

import { useEffect } from "react";

/** Die Knöpfe, die zum Probetraining führen oder es abschicken. */
const KNOEPFE = ".knopf-glanz, .knopf-glanz-dauer, .einladung-knopf";

/**
 * Ein kurzer Lime-Ring beim Antippen eines Buchungsknopfs (CSS:
 * .klick-impuls in globals.css).
 *
 * Eine Stelle für alle Knöpfe statt eines Effekts in jedem: Die Knöpfe
 * sind teils Links, teils Formularknöpfe, teils vom Server gerendert -
 * hier reicht ein einziger Zuhörer am Dokument.
 *
 * Zeigt dem Daumen auf dem Handy, dass der Tipp angekommen ist, bevor
 * die nächste Seite oder die Bestätigung da ist.
 */
export function KlickImpuls() {
  useEffect(() => {
    const beimTippen = (ereignis: PointerEvent) => {
      const knopf = (ereignis.target as Element | null)?.closest<HTMLElement>(KNOEPFE);
      if (!knopf) return;
      knopf.classList.remove("klick-impuls");
      // Neu anstoßen, falls schon ein Ring läuft.
      void knopf.offsetWidth;
      knopf.classList.add("klick-impuls");
      knopf.addEventListener("animationend", () => knopf.classList.remove("klick-impuls"), { once: true });
    };
    document.addEventListener("pointerdown", beimTippen);
    return () => document.removeEventListener("pointerdown", beimTippen);
  }, []);
  return null;
}
