/**
 * Wie ein Buchungsstatus heißt und wie er aussieht.
 *
 * Die drei Werte standen bis hierher an drei Stellen: in der Buchungsliste,
 * im Tabellenexport und - beim Bauen des Kalenders - beinahe ein viertes
 * Mal. Solange alle dieselben Wörter benutzen, fällt das nicht auf; sobald
 * jemand an einer Stelle "Abgesagt" statt "Storniert" schreibt, sieht der
 * Adminbereich aus, als kämen die Angaben aus zwei Systemen.
 */

import type { BookingStatus } from "@/generated/prisma/enums";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Offen",
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
};

/**
 * Statusfarbe. Die Töne selbst stehen in globals.css, damit "offen" im
 * ganzen Adminbereich gleich aussieht.
 */
export const STATUS_TON = {
  PENDING: "open",
  CONFIRMED: "ok",
  CANCELLED: "off",
} as const;

export const STATUS_WERTE = ["PENDING", "CONFIRMED", "CANCELLED"] as const;

/**
 * Nur bekannte Werte aus der Adresszeile durchlassen. Sonst ergibt
 * ?status=XYZ eine leere Liste, ohne dass erkennbar wäre warum.
 */
export function statusAusText(text: string): BookingStatus | "" {
  return (STATUS_WERTE as readonly string[]).includes(text) ? (text as BookingStatus) : "";
}
