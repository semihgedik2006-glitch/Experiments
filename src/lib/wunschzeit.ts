import type { Sprache } from "@/lib/sprache";

/**
 * Wann es jemandem passt - als Wunsch, nicht als fester Termin.
 *
 * Vorher wählte man im Formular einen konkreten freien Termin aus den im
 * Adminbereich angelegten Zeiten. Das passt nicht zur Planung der Studios:
 * Das Team wird nach den Anfragen eingeteilt, nicht umgekehrt. Deshalb
 * fragt das Formular jetzt Wochentage und Tageszeit ab, und das Studio
 * meldet sich mit einem Termin, der zu beidem passt.
 *
 * Gespeichert wird der Wunsch als lesbarer Text in Booking.terminWunsch
 * ("Mo, Mi · Nach Feierabend") - so steht er unverändert in der Mail ans
 * Studio und im Adminbereich, ohne dass eine Auswertung ihn erst
 * übersetzen muss.
 */

export const WOCHENTAGE = [
  { wert: "mo", de: "Mo", en: "Mon" },
  { wert: "di", de: "Di", en: "Tue" },
  { wert: "mi", de: "Mi", en: "Wed" },
  { wert: "do", de: "Do", en: "Thu" },
  { wert: "fr", de: "Fr", en: "Fri" },
  { wert: "sa", de: "Sa", en: "Sat" },
] as const;

export const TAGESZEITEN = [
  { wert: "morgens", de: "Morgens", en: "Morning", spanne: "vor 12 Uhr" },
  { wert: "mittags", de: "Mittags", en: "Midday", spanne: "12 - 15 Uhr" },
  { wert: "nachmittags", de: "Nachmittags", en: "Afternoon", spanne: "15 - 17 Uhr" },
  { wert: "abends", de: "Nach Feierabend", en: "After work", spanne: "ab 17 Uhr" },
] as const;

export type TageszeitWert = (typeof TAGESZEITEN)[number]["wert"];

/** Speicherschlüssel, über den der Ziel-Check seine Tageszeit ans Formular gibt. */
export const TAGESZEIT_SPEICHER = "kf-tageszeit";

export function istTageszeit(wert: string): wert is TageszeitWert {
  return TAGESZEITEN.some((t) => t.wert === wert);
}

/**
 * Der Wunsch als Text für Datenbank, Mail und Adminbereich - immer auf
 * Deutsch, weil das Studio ihn liest. Leer, wenn nichts gewählt ist.
 */
export function wunschzeitText(tage: string[], zeiten: string[]): string {
  const t = WOCHENTAGE.filter((w) => tage.includes(w.wert)).map((w) => w.de);
  const z = TAGESZEITEN.filter((w) => zeiten.includes(w.wert)).map((w) => w.de);
  const teile = [t.length ? t.join(", ") : "", z.length ? z.join(", ") : ""].filter(Boolean);
  return teile.join(" · ");
}

export function wochentagLabel(sprache: Sprache, wert: string) {
  const w = WOCHENTAGE.find((x) => x.wert === wert);
  return w ? w[sprache] : wert;
}

export function tageszeitLabel(sprache: Sprache, wert: string) {
  const w = TAGESZEITEN.find((x) => x.wert === wert);
  return w ? w[sprache] : wert;
}
