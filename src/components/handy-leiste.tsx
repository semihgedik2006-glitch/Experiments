"use client";

import { useEffect, useState } from "react";
import Link from "@/components/sprach-link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Phone } from "lucide-react";
import { schonGebucht, seiteAusgenommen } from "@/lib/einladung";
import { siteConfig } from "@/lib/site-config";
import { useSprache } from "@/lib/i18n/use-sprache";
import { nachDe } from "@/lib/i18n/pfade";

/**
 * Die feste Leiste unten auf dem Handy: ein Knopf zum Probetraining und
 * einer zum Anrufen.
 *
 * Auf dem Handy liegt der nächste Knopf zum Probetraining oft mehrere
 * Bildschirme entfernt - die Leiste hält ihn im Daumenbereich. Sie kommt
 * erst nach dem ersten Bildschirm (oben steht der Knopf ohnehin im Hero)
 * und geht wieder, sobald ein Anfrageformular oder die Fußzeile im Bild
 * ist: Dann wäre sie doppelt oder läge über Impressum und Kontakt.
 *
 * Kein Termin darin - die Studios planen nach Wunschzeiten (siehe
 * @/lib/wunschzeit).
 */
export function HandyLeiste() {
  const pfad = usePathname();
  const en = useSprache() === "en";
  const still = useReducedMotion();
  const [gescrollt, setGescrollt] = useState(false);
  const [verdeckt, setVerdeckt] = useState(false);
  const [gebucht, setGebucht] = useState(false);
  const [ziel, setZiel] = useState("/probetermin");

  const aus = seiteAusgenommen(pfad) || nachDe(pfad) === "/ziel-check";

  useEffect(() => {
    if (aus) return;
    const beimScrollen = () => {
      setGescrollt(window.scrollY > window.innerHeight * 0.8);
      // Wer auf dieser Seite gerade angefragt hat, braucht die Leiste nicht mehr.
      setGebucht(schonGebucht());
      // Gibt es auf dieser Seite einen eigenen Abschnitt mit dem Formular
      // (Ziel- und Standortseiten), springt der Knopf dorthin statt auf
      // eine neue Seite - der Standort ist dort schon gewählt.
      setZiel(document.getElementById("termin") ? "#termin" : "/probetermin");
    };
    const erstes = requestAnimationFrame(beimScrollen);
    window.addEventListener("scroll", beimScrollen, { passive: true });

    const sichtbar = new Set<Element>();
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) sichtbar.add(e.target);
        else sichtbar.delete(e.target);
      }
      setVerdeckt(sichtbar.size > 0);
    });
    const ziele = [
      ...document.querySelectorAll("footer"),
      ...[...document.querySelectorAll('input[name="terminWunsch"]')].map((feld) => feld.closest("form") ?? feld),
    ];
    ziele.forEach((el) => beobachter.observe(el));

    return () => {
      cancelAnimationFrame(erstes);
      window.removeEventListener("scroll", beimScrollen);
      beobachter.disconnect();
    };
  }, [aus, pfad]);

  const zeigen = !aus && !gebucht && gescrollt && !verdeckt;
  const telefon = siteConfig.contact.phone.replace(/\s/g, "");

  return (
    <AnimatePresence>
      {zeigen && (
        <motion.div
          initial={still ? { opacity: 0 } : { y: "110%" }}
          animate={still ? { opacity: 1 } : { y: 0 }}
          exit={still ? { opacity: 0 } : { y: "110%" }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-surface-raised/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden"
        >
          <div className="flex items-center gap-2">
            <Link
              href={ziel}
              data-einstieg="Handy-Leiste"
              className="knopf-glanz flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-on-lime"
            >
              {en ? "Free trial session" : "Kostenloses Probetraining"}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <a
              href={`tel:${telefon}`}
              aria-label={en ? "Call us" : "Anrufen"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-accent"
            >
              <Phone size={18} aria-hidden />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
