import type { Sprache } from "@/lib/sprache";
import { lokal } from "@/lib/i18n/lokal";

/**
 * Öffnungszeiten auf Englisch - aus dem deutschen Text.
 *
 * Die Studios tragen ihre Zeiten in einer festen Form ein ("Montag -
 * Freitag: 08:00 - 21:00 Uhr"). Darin ändern sich nur Wochentage, Uhrzeiten
 * und ein paar Wörter - das lässt sich verlässlich übertragen, und das
 * Studio muss bei jeder Änderung der Zeiten nicht zwei Felder pflegen.
 * Wer es anders haben will, trägt im Adminbereich eine englische Fassung
 * ein; die hat Vorrang.
 *
 * Uhrzeiten im Zwölfstundenformat: Auf der englischen Seite stehen auch
 * die Erreichbarkeiten so (@/lib/sprache), und "21:00" ist im englischen
 * Sprachraum ungewohnt.
 */
const WOERTER: [RegExp, string][] = [
  [/\bMontag\b/g, "Monday"],
  [/\bDienstag\b/g, "Tuesday"],
  [/\bMittwoch\b/g, "Wednesday"],
  [/\bDonnerstag\b/g, "Thursday"],
  [/\bFreitag\b/g, "Friday"],
  [/\bSamstag\b/g, "Saturday"],
  [/\bSonntag\b/g, "Sunday"],
  [/\bFeiertage?n?\b/g, "Public holidays"],
  [/\bMo\b\.?/g, "Mon"],
  [/\bDi\b\.?/g, "Tue"],
  [/\bMi\b\.?/g, "Wed"],
  [/\bDo\b\.?/g, "Thu"],
  [/\bFr\b\.?/g, "Fri"],
  [/\bSa\b\.?/g, "Sat"],
  [/\bSo\b\.?/g, "Sun"],
  [/\bgeschlossen\b/gi, "closed"],
  [/\bnach Vereinbarung\b/gi, "by appointment"],
  [/\bund\b/g, "and"],
  [/\bbis\b/g, "to"],
  [/\s*Uhr\b/g, ""],
];

function uhrzeit(stunde: number, minute: number): string {
  const h = stunde % 12 === 0 ? 12 : stunde % 12;
  const teil = stunde < 12 || stunde === 24 ? "am" : "pm";
  return minute ? `${h}:${String(minute).padStart(2, "0")} ${teil}` : `${h} ${teil}`;
}

export function oeffnungszeitenAufEnglisch(text: string): string {
  let ergebnis = text.replace(/\b([01]?\d|2[0-4])[:.]([0-5]\d)\b/g, (_, h, m) => uhrzeit(Number(h), Number(m)));
  for (const [muster, ersatz] of WOERTER) ergebnis = ergebnis.replace(muster, ersatz);
  return ergebnis;
}

/** Die Öffnungszeiten eines Studios in der gewünschten Sprache. */
export function oeffnungszeiten(
  sprache: Sprache,
  studio: { openingHours: string; openingHoursEn?: string | null },
): string {
  if (sprache !== "en") return studio.openingHours;
  return lokal(sprache, oeffnungszeitenAufEnglisch(studio.openingHours), studio.openingHoursEn);
}
