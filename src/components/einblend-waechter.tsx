"use client";

import { useEffect } from "react";

/**
 * Steuert das Einblenden beim Hinscrollen (Reveal, Stagger, WortReveal,
 * KickerStrich).
 *
 * Der Server liefert alles sichtbar aus. Nach dem Laden bekommt nur, was
 * noch unterhalb des Bildschirms liegt, .einblenden-wartet (versteckt) und
 * wird beobachtet. Kommt es ins Bild, fällt die Klasse weg und CSS blendet
 * es einmal ein. Was beim Laden schon zu sehen ist, wird nie versteckt -
 * so hängt der erste Bildschirm nicht am JavaScript.
 *
 * Neue Abschnitte (Seitenwechsel, Umbau nach dem Ziel) nimmt ein
 * MutationObserver mit auf. Bei "Bewegung reduzieren" passiert nichts.
 */
const AUSWAHL = "[data-einblenden]";
const UNTERE_KANTE = 0.88;

export function EinblendWaechter() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const zeigen = (el: Element) => {
      if (el.getAttribute("data-einblenden") === "gruppe") {
        el.querySelectorAll<HTMLElement>(".einblenden-kind").forEach((kind, i) => {
          kind.style.setProperty("--einblend-verzug", `${i * 0.06}s`);
        });
      }
      el.classList.add("einblenden-auf");
      el.classList.remove("einblenden-wartet");
      window.setTimeout(() => el.classList.remove("einblenden-auf"), 1600);
    };

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (!e.isIntersecting) continue;
          beobachter.unobserve(e.target);
          zeigen(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    const bekannt = new WeakSet<Element>();
    const aufnehmen = () => {
      const neu: Element[] = [];
      document.querySelectorAll(AUSWAHL).forEach((el) => {
        if (bekannt.has(el)) return;
        bekannt.add(el);
        neu.push(el);
      });
      if (!neu.length) return;
      const grenze = window.innerHeight * UNTERE_KANTE;
      const unten = neu.filter((el) => el.getBoundingClientRect().top > grenze);
      for (const el of unten) {
        el.classList.add("einblenden-wartet");
        beobachter.observe(el);
      }
    };
    aufnehmen();

    let geplant = 0;
    const veraenderungen = new MutationObserver(() => {
      if (geplant) return;
      geplant = window.requestAnimationFrame(() => {
        geplant = 0;
        aufnehmen();
      });
    });
    veraenderungen.observe(document.body, { childList: true, subtree: true });

    return () => {
      beobachter.disconnect();
      veraenderungen.disconnect();
      window.cancelAnimationFrame(geplant);
    };
  }, []);

  return null;
}
