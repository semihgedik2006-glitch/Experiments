"use client";

import { useEffect } from "react";

/**
 * Hält Dauer-Animationen an, solange sie nicht im Bild sind.
 *
 * Die Zierde der Seite (Impulse, Wellen, Szenen, die Einladung) läuft in
 * Schleifen per CSS. Der Browser rechnet solche Animationen weiter, auch
 * wenn sie zehn Bildschirme weiter oben stehen - auf dem Handy kostet das
 * spürbar Rechenzeit, beim Laden wie beim Scrollen.
 *
 * Ein einziger Beobachter für die ganze Seite: Was aus dem Bild ist, bekommt
 * .bewegung-aus (globals.css: animation-play-state: paused). Beim
 * Zurückscrollen läuft die Bewegung dort weiter, wo sie stand.
 *
 * Neu hinzukommende Zierde - etwa wenn sich die Startseite nach dem Ziel
 * umbaut - wird über einen MutationObserver mit aufgenommen.
 */
const ZIERDE = [
  ".impuls-welle",
  ".puls-welle",
  ".impuls-aussenring",
  ".impuls-bogen-rechts",
  ".impuls-bogen-links",
  ".impuls-kurve",
  ".figur-punkt",
  ".figur-welle",
  ".figur-schein",
  ".streu-punkt",
  ".streu-welle",
  ".trenner-impuls",
  ".aufruf-orb",
  ".weg-hier",
  "[class*='szene-']",
  "[class*='einladung-']",
].join(",");

export function BewegungsWaechter() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) e.target.classList.toggle("bewegung-aus", !e.isIntersecting);
      },
      // Etwas Vorlauf, damit die Bewegung schon läuft, wenn sie ins Bild kommt.
      { rootMargin: "200px 0px" },
    );

    const bekannt = new WeakSet<Element>();
    const aufnehmen = (wurzel: ParentNode) => {
      wurzel.querySelectorAll(ZIERDE).forEach((el) => {
        if (bekannt.has(el)) return;
        bekannt.add(el);
        beobachter.observe(el);
      });
    };
    aufnehmen(document);

    // Gebündelt: Ein Umbau der Seite löst viele Änderungen auf einmal aus.
    let geplant = 0;
    const veraenderungen = new MutationObserver(() => {
      if (geplant) return;
      geplant = window.setTimeout(() => {
        geplant = 0;
        aufnehmen(document);
      }, 300);
    });
    veraenderungen.observe(document.body, { childList: true, subtree: true });

    return () => {
      beobachter.disconnect();
      veraenderungen.disconnect();
      window.clearTimeout(geplant);
    };
  }, []);

  return null;
}
