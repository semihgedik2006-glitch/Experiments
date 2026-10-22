import type { ReactNode } from "react";
import { ZielWelt } from "@/components/home/ziel-welt";
import { Individuell } from "@/components/home/individuell";
import { ZeitProblem } from "@/components/home/zeit-problem";
import { UspGrid } from "@/components/home/usp-grid";
import { Netzwerk } from "@/components/home/netzwerk";
import { StudioTeaser } from "@/components/home/studio-teaser";
import { TestimonialsTeaser } from "@/components/home/testimonials-teaser";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { TrustSection } from "@/components/trust-section";
import { FaqSection } from "@/components/faq-section";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { siteConfig } from "@/lib/site-config";
import type { Toggles } from "@/lib/site-toggles";
import type { AbschnittKey } from "@/lib/ziel-inhalte";

/**
 * Die Abschnitte, aus denen Startseite und Zielseiten bestehen - an einer
 * Stelle gebaut, damit beide nicht auseinanderlaufen. Welche davon in
 * welcher Reihenfolge erscheinen, entscheidet ZielAbschnitte.
 *
 * Die Zielseiten lassen Studioliste und Instagram weg (instagram: null,
 * studio: false): Beides wäre auf jeder Zielseite gleich und ist einen
 * Klick entfernt.
 */
export function zielAbschnitteBauen({
  anzahlStudios,
  toggles,
  zeitspanne,
  auswahl,
  instagram,
  studioListe,
}: {
  anzahlStudios: number;
  toggles: Toggles;
  /** "07:00 bis 21:00 Uhr", sofern aus den Terminen ableitbar. */
  zeitspanne: string | null;
  /** Ob "Erkennst du dich wieder?" die Zielauswahl zeigt. */
  auswahl: boolean;
  /** Die Instagram-Wand, oder null, wenn sie entfallen soll. */
  instagram: ReactNode;
  /** Ob die Studioliste erscheint (zusätzlich zum Schalter im Adminbereich). */
  studioListe: boolean;
}): Partial<Record<AbschnittKey, ReactNode>> {
  return {
    zielwelt: <ZielWelt auswahl={auswahl} />,
    individuell: <Individuell />,
    zeit: <ZeitProblem />,
    vorteile: <UspGrid standorte={anzahlStudios} zeitspanne={zeitspanne} />,
    netzwerk:
      anzahlStudios > 0 ? (
        <Netzwerk gesamt={siteConfig.netzwerk.studiosGesamt} eigene={anzahlStudios} />
      ) : null,
    studio: studioListe && toggles.studio ? <StudioTeaser /> : null,
    erfolge: toggles.erfolgsgeschichten ? <TestimonialsTeaser /> : null,
    vertrauen: <TrustSection />,
    blog: toggles.blog ? <BlogTeaser /> : null,
    instagram,
    faq: (
      <>
        <ImpulsTrenner variante="c" className="mx-auto max-w-6xl px-6" />
        <FaqSection />
      </>
    ),
  };
}

/** "07:00 bis 21:00 Uhr" aus den frühesten und spätesten Terminen. */
export function zeitspanneAus(frueheste: string | null, spaeteste: string | null): string | null {
  return frueheste && spaeteste ? `${frueheste} bis ${spaeteste} Uhr` : null;
}

