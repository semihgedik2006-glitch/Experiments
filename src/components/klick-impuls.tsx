"use client";

import { useEffect } from "react";
import { EINSTIEG_KNOEPFE, einstiegMerken } from "@/lib/einstieg";

/** Die Knöpfe, die zum Probetraining führen oder es abschicken. */
const KNOEPFE = ".knopf-glanz, .knopf-glanz-dauer, .einladung-knopf";

/**
 * Ein kurzer Lime-Ring beim Antippen eines Buchungsknopfs (CSS:
 * .klick-impuls in globals.css).
 *
 * Derselbe Baustein merkt sich, welcher Buchungsknopf angeklickt wurde
 * (@/lib/einstieg) - deshalb steht er auf allen Seiten mit Formular.
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
    // Nebenbei: welcher Knopf zur Anfrage führt (@/lib/einstieg). Über
    // "click", damit auch die Eingabetaste zählt.
    const beimKlick = (ereignis: MouseEvent) => {
      const einstieg = (ereignis.target as Element | null)?.closest(EINSTIEG_KNOEPFE);
      if (einstieg) einstiegMerken(einstieg);
    };
    document.addEventListener("pointerdown", beimTippen);
    document.addEventListener("click", beimKlick, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", beimTippen);
      document.removeEventListener("click", beimKlick, { capture: true });
    };
  }, []);
  return null;
}
