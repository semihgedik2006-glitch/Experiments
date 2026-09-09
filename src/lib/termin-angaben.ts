import { randomBytes } from "node:crypto";
import { formatDate } from "@/lib/format";
import type { TerminAngaben } from "@/lib/email";

/**
 * Übersetzt eine Buchung aus der Datenbank in die Angaben, die alle
 * E-Mails brauchen. An einer Stelle, damit Bestätigung, Erinnerung und
 * Absage denselben Termin gleich beschreiben.
 */
export type BuchungMitTermin = {
  id: string;
  name: string;
  email: string;
  manageToken: string | null;
  slot: {
    date: Date;
    startTime: string;
    endTime: string;
    studio: { name: string; street: string; postalCode: string; city: string };
  } | null;
};

export function terminAngaben(buchung: BuchungMitTermin): TerminAngaben {
  const slot = buchung.slot;

  return {
    bookingId: buchung.id,
    email: buchung.email,
    name: buchung.name,
    dateLabel: slot ? formatDate(slot.date) : null,
    startTime: slot?.startTime ?? null,
    endTime: slot?.endTime ?? null,
    studioName: slot?.studio.name ?? null,
    studioAdresse: slot
      ? `${slot.studio.street}, ${slot.studio.postalCode} ${slot.studio.city}`
      : null,
    datum: slot?.date ?? null,
    manageToken: buchung.manageToken,
  };
}

/**
 * Schlüssel für den persönlichen Link.
 *
 * 32 Byte aus der Zufallsquelle des Betriebssystems, als Hex. Kürzer wäre
 * bequemer, aber wer den Schlüssel errät, sieht Name, Telefonnummer und
 * Termin einer fremden Person und kann sie absagen - hier ist Raten
 * ausgeschlossen der richtige Maßstab, nicht ein hübscher Link.
 */
export function neuerVerwaltungsSchluessel(): string {
  return randomBytes(32).toString("hex");
}
