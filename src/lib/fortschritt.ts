/**
 * Der Fortschritt einer Anfrage: wie weit ist der Mensch gekommen?
 *
 * Getrennt vom Buchungsstatus (@/lib/buchung-status), an dem Termin,
 * Kalender und Mails hängen. Der Fortschritt beantwortet die Frage, die
 * jedes Studio eigentlich hat: Haben wir ihn erreicht, war er da, ist er
 * geblieben? Aus ihm entsteht in der Auswertung der Weg von der Anfrage
 * zum Mitglied - und damit die Antwort, wo Interessenten verloren gehen.
 */

import type { Fortschritt } from "@/generated/prisma/enums";

/** In der Reihenfolge, in der eine Anfrage sie normalerweise durchläuft. */
export const FORTSCHRITT_WERTE = [
  "NEU",
  "ANGERUFEN",
  "NICHT_ERREICHT",
  "TERMIN_VEREINBART",
  "ERSCHIENEN",
  "NICHT_ERSCHIENEN",
  "MITGLIED",
  "KEIN_INTERESSE",
] as const satisfies readonly Fortschritt[];

export const FORTSCHRITT_LABEL: Record<Fortschritt, string> = {
  NEU: "Neu",
  ANGERUFEN: "Angerufen",
  NICHT_ERREICHT: "Nicht erreicht",
  TERMIN_VEREINBART: "Termin vereinbart",
  ERSCHIENEN: "War da",
  NICHT_ERSCHIENEN: "Nicht erschienen",
  MITGLIED: "Mitglied",
  KEIN_INTERESSE: "Kein Interesse",
};

/** Farbton wie bei den Buchungsstatus (Klassen in globals.css). */
export const FORTSCHRITT_TON: Record<Fortschritt, "open" | "ok" | "off"> = {
  NEU: "open",
  ANGERUFEN: "open",
  NICHT_ERREICHT: "off",
  TERMIN_VEREINBART: "ok",
  ERSCHIENEN: "ok",
  NICHT_ERSCHIENEN: "off",
  MITGLIED: "ok",
  KEIN_INTERESSE: "off",
};

/** Noch niemand hat sich gekümmert - gehört auf die Tagesliste. */
export const UNBEARBEITET: Fortschritt[] = ["NEU", "NICHT_ERREICHT"];

export function fortschrittAusText(text: string): Fortschritt | "" {
  return (FORTSCHRITT_WERTE as readonly string[]).includes(text) ? (text as Fortschritt) : "";
}

/**
 * Die Stufen des Wegs zum Mitglied. Jede Anfrage zählt in jeder Stufe,
 * die sie erreicht hat: wer Mitglied wurde, war auch da, hatte einen
 * Termin und wurde erreicht. "Nicht erschienen" hatte einen Termin, war
 * aber nicht da; "kein Interesse" wurde erreicht, mehr nicht.
 */
export const STUFEN = ["anfragen", "erreicht", "termin", "erschienen", "mitglied"] as const;
export type Stufe = (typeof STUFEN)[number];

export const STUFE_LABEL: Record<Stufe, string> = {
  anfragen: "Anfragen",
  erreicht: "Erreicht",
  termin: "Termin",
  erschienen: "Erschienen",
  mitglied: "Mitglied",
};

const ERREICHTE_STUFE: Record<Fortschritt, number> = {
  NEU: 0,
  NICHT_ERREICHT: 0,
  ANGERUFEN: 1,
  KEIN_INTERESSE: 1,
  TERMIN_VEREINBART: 2,
  NICHT_ERSCHIENEN: 2,
  ERSCHIENEN: 3,
  MITGLIED: 4,
};

export type Trichter = Record<Stufe, number>;

export function leererTrichter(): Trichter {
  return { anfragen: 0, erreicht: 0, termin: 0, erschienen: 0, mitglied: 0 };
}

/** Zählt eine Anfrage in alle Stufen, die sie erreicht hat. */
export function einzaehlen(trichter: Trichter, fortschritt: Fortschritt): void {
  const bis = ERREICHTE_STUFE[fortschritt];
  STUFEN.forEach((stufe, i) => {
    if (i <= bis) trichter[stufe] += 1;
  });
}

/** Anteil in Prozent, gerundet; null, wenn es nichts zu teilen gibt. */
export function anteil(teil: number, ganzes: number): number | null {
  return ganzes > 0 ? Math.round((teil / ganzes) * 100) : null;
}
