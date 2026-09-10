/**
 * Der Kalender über alle Standorte.
 *
 * Bis hierher gab es zwei Listen: die Buchungsanfragen (nach Eingang
 * sortiert) und die Verfügbarkeit (eine Woche, alle Studios übereinander in
 * denselben sieben Spalten). Beide beantworten die Frage nicht, die morgens
 * um acht ansteht: Was ist heute los - und wo?
 *
 * Deshalb drei Ansichten auf denselben Daten:
 *
 * TAG - alle Termine dieses Tages, nach Uhrzeit gebündelt, mit Namen und
 * Telefonnummer. Das ist die Ansicht zum Ausdrucken oder Danebenlegen.
 *
 * WOCHE - Standorte als Zeilen, Tage als Spalten. Hier fällt auf, wo eine
 * Woche leer bleibt und wo sie überläuft. Genau das geht in der
 * Verfügbarkeitsansicht unter, weil dort alle vierzehn Standorte in
 * dieselbe Tagesspalte fallen.
 *
 * MONAT - ein Gitter mit einer Zahl je Tag. Kein Detail, sondern die Form
 * des Monats: wo Lücken sind und wo es eng wird.
 *
 * Alle drei rechnen in PLÄTZEN, nicht in Buchungen - wer zu zweit kommt,
 * belegt zwei (siehe kapazitaet.ts).
 */

import { belegtePlaetze, type BuchungFuerZaehlung } from "@/lib/kapazitaet";
import { tagesSchluessel } from "@/lib/woche";

export type KalenderModus = "tag" | "woche" | "monat";

const MODI: readonly KalenderModus[] = ["tag", "woche", "monat"];

/**
 * Der Modus aus der Adresse. Alles Unbekannte ergibt den Tag - eine
 * verunglückte Adresse soll die Ansicht zeigen, die am häufigsten gebraucht
 * wird, und nicht eine leere Seite.
 */
export function modusAusText(text: string): KalenderModus {
  return (MODI as readonly string[]).includes(text) ? (text as KalenderModus) : "tag";
}

/** Ein Termin, so weit der Kalender ihn zum Zählen braucht. */
export type KalenderSlot = {
  studioId: string;
  date: Date;
  capacity: number;
  bookings: BuchungFuerZaehlung[];
};

export type Belegung = {
  /** Anzahl der Termine. */
  termine: number;
  /** Plätze insgesamt. */
  plaetze: number;
  /** Davon belegt. */
  belegt: number;
};

export const OHNE_TERMIN: Belegung = { termine: 0, plaetze: 0, belegt: 0 };

/**
 * Zählt Termine zu einem Schlüssel zusammen.
 *
 * Der Schlüssel kommt von außen, weil die Wochenansicht nach Studio UND
 * Tag bündelt und die Monatsansicht nur nach Tag. Zwei fast gleiche
 * Schleifen nebeneinander wären die Alternative gewesen - und genau dort
 * entstehen die Fälle, in denen die eine Ansicht Buchungen zählt und die
 * andere Plätze.
 */
export function belegungSammeln<T extends KalenderSlot>(
  slots: T[],
  schluessel: (slot: T) => string,
): Map<string, Belegung> {
  const gesammelt = new Map<string, Belegung>();

  for (const slot of slots) {
    const key = schluessel(slot);
    const bisher = gesammelt.get(key) ?? { ...OHNE_TERMIN };
    bisher.termine += 1;
    bisher.plaetze += slot.capacity;
    bisher.belegt += belegtePlaetze(slot.bookings);
    gesammelt.set(key, bisher);
  }

  return gesammelt;
}

/** Schlüssel für die Wochenansicht: ein Standort an einem Tag. */
export function studioTagSchluessel(studioId: string, datum: Date): string {
  return `${studioId}|${tagesSchluessel(datum)}`;
}

/** Kein Platz mehr frei. Ein Tag ohne Termine ist nicht voll, sondern leer. */
export function istVoll(belegung: Belegung): boolean {
  return belegung.plaetze > 0 && belegung.belegt >= belegung.plaetze;
}
