import { formatDateShort } from "@/lib/format";

/**
 * Termine für das Buchungsformular nach Tagen bündeln.
 *
 * Bis hierher stand diese Schleife dreimal fast gleich in drei Seiten:
 * /probetermin, /studio/[slug] und /aktion/[slug]. Als die Zahl der freien
 * Plätze dazukam, hätte man sie dreimal ändern müssen - und beim dritten
 * Mal hätte jemand eine Stelle übersehen.
 *
 * Die freien Plätze wandern mit ins Formular: Ein Termin ohne freien Platz
 * verschwindet nicht mehr, sondern wird als belegt angeboten - das ist der
 * Einstieg in die Warteliste.
 */

export type TerminZeit = {
  id: string;
  startTime: string;
  endTime: string;
  frei: number;
};

export type TerminTag = {
  dateKey: string;
  dateLabel: string;
  slots: TerminZeit[];
};

type SlotMitBelegung = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  frei: number;
};

/**
 * Erwartet nach Datum und Uhrzeit sortierte Termine.
 *
 * Die Sprache bestimmt nur die Beschriftung des Tages. Sie steht hier und
 * nicht im Browser, weil die Beschriftung schon beim Erzeugen der Seite
 * feststeht - sie erst im Browser zu bilden hieße, dass sie beim ersten
 * Bild noch fehlt.
 */
export function tageAusSlots(
  slots: SlotMitBelegung[],
  sprache: "de" | "en" = "de",
): TerminTag[] {
  const tage: TerminTag[] = [];

  for (const slot of slots) {
    // Ein unbrauchbares Datum würde weiter unten zu "Invalid Date" im
    // Schlüssel führen und alle betroffenen Termine in einen Sammeltag
    // werfen.
    if (Number.isNaN(slot.date.getTime())) continue;

    const dateKey = slot.date.toISOString().slice(0, 10);
    let tag = tage.find((t) => t.dateKey === dateKey);
    if (!tag) {
      tag = { dateKey, dateLabel: formatDateShort(slot.date, sprache), slots: [] };
      tage.push(tag);
    }
    tag.slots.push({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      frei: slot.frei,
    });
  }

  return tage;
}

/** Nach Studio getrennt - für die Seiten mit Studioauswahl. */
export function tageJeStudio(
  slots: (SlotMitBelegung & { studioId: string })[],
  sprache: "de" | "en" = "de",
): Record<string, TerminTag[]> {
  const nachStudio: Record<string, SlotMitBelegung[]> = {};
  for (const slot of slots) (nachStudio[slot.studioId] ??= []).push(slot);

  return Object.fromEntries(
    Object.entries(nachStudio).map(([studioId, eigene]) => [
      studioId,
      tageAusSlots(eigene, sprache),
    ]),
  );
}
