import { randomInt } from "crypto";
import type { GutscheinStatus } from "@/generated/prisma/enums";

/**
 * Gutscheine - was es gibt, wie der Code aussieht, wie lange er gilt.
 *
 * Zwei Arten:
 *
 * WERT - ein Betrag, einlösbar für alles im Studio. Die Beträge sind
 * feste Stufen statt eines freien Feldes: Wer verschenkt, will nicht
 * rechnen, und im Studio soll niemand einen Gutschein über 37 € erklären.
 *
 * STARTPAKET - das Startpaket aus dem Anmeldeformular (Trainingsplanung,
 * Chipkarte, Verwaltung) geschenkt. Es ist die größte Einmalzahlung beim
 * Einstieg; wer es geschenkt bekommt, hat einen Grund weniger zu zögern.
 * Der Wert steht hier und nicht in der Datenbank, damit eine Preisänderung
 * an einer Stelle passiert - bereits ausgestellte Gutscheine behalten ihren
 * Betrag, weil er am Gutschein gespeichert ist.
 */

export const WERT_STUFEN = [25, 50, 100] as const;

export const STARTPAKET_WERT = 99.9;

export type GutscheinArt = "wert" | "startpaket";

export function artText(art: string, betrag: number): string {
  if (art === "startpaket") return "Startpaket geschenkt";
  return `Wertgutschein über ${betrag} €`;
}

/** Der Betrag für die Anzeige: "99,90 €" oder "50 €". */
export function betragText(art: string, betrag: number): string {
  if (art === "startpaket") return `${STARTPAKET_WERT.toFixed(2).replace(".", ",")} €`;
  return `${betrag} €`;
}

/**
 * Ein Code wie "KF-7K2M-Q9P4".
 *
 * Ohne 0/O, 1/I/L und 5/S: Der Code wird am Tresen vorgelesen oder von
 * einem Zettel abgetippt, und genau diese Zeichen werden verwechselt.
 * 29 Zeichen hoch acht Stellen sind rund 500 Milliarden Möglichkeiten -
 * genug, dass niemand einen gültigen Code errät.
 */
const ZEICHEN = "ABCDEFGHJKMNPQRTUVWXYZ2346789";

export function neuerGutscheinCode(): string {
  const teil = () =>
    Array.from({ length: 4 }, () => ZEICHEN[randomInt(ZEICHEN.length)]).join("");
  return `KF-${teil()}-${teil()}`;
}

/** Was jemand eintippt - klein, mit Leerzeichen - in die gespeicherte Form. */
export function gutscheinCodeNormalisieren(roh: string): string {
  const rein = roh.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (rein.length !== 10 || !rein.startsWith("KF")) return roh.trim().toUpperCase();
  return `KF-${rein.slice(2, 6)}-${rein.slice(6)}`;
}

/**
 * Gültig bis zum Ende des dritten Jahres nach dem Ausstellen.
 *
 * Das ist die gesetzliche Verjährung (§§ 195, 199 BGB). Eine kürzere
 * Frist auf einen Wertgutschein zu drucken, ist in der Regel unwirksam -
 * und am Tresen ein Streit, den man nicht gewinnt.
 */
export function gueltigBisAb(ausgestellt: Date): Date {
  return new Date(Date.UTC(ausgestellt.getUTCFullYear() + 3, 11, 31, 23, 59, 59));
}

export const STATUS_TEXT: Record<GutscheinStatus, string> = {
  ANGEFRAGT: "angefragt",
  AUSGESTELLT: "gültig",
  EINGELOEST: "eingelöst",
  STORNIERT: "storniert",
};

export const STATUS_TON = {
  ANGEFRAGT: "open",
  AUSGESTELLT: "ok",
  EINGELOEST: "idle",
  STORNIERT: "off",
} as const;
