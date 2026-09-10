import { randomBytes } from "node:crypto";
import { formatDate } from "@/lib/format";
import type { TerminAngaben } from "@/lib/email";

/**
 * Übersetzt eine Buchung aus der Datenbank in die Angaben, die alle
 * E-Mails brauchen. An einer Stelle, damit Bestätigung, Erinnerung und
 * Absage denselben Termin gleich beschreiben.
 */
type Ort = { name: string; street: string; postalCode: string; city: string };

export type BuchungMitTermin = {
  id: string;
  name: string;
  email: string;
  manageToken: string | null;
  /** Der Standort an der Anfrage selbst. Optional, damit Aufrufe ohne
      diesen Bezug weiter gültig sind - etwa an alten Datensätzen. */
  studio?: Ort | null;
  slot: {
    date: Date;
    startTime: string;
    endTime: string;
    studio: Ort;
  } | null;
};

export function terminAngaben(buchung: BuchungMitTermin): TerminAngaben {
  const slot = buchung.slot;

  // Der Standort an der Anfrage geht vor. Bei einer Anfrage ohne feste
  // Zeit ist er der einzige - vorher stand in deren Bestätigungsmail
  // weder Studioname noch Adresse. Steht ein Termin dran, sind beide
  // ohnehin derselbe: Beim Anlegen und beim Verschieben wird geprüft,
  // dass Termin und Standort zusammengehören.
  const ort = buchung.studio ?? slot?.studio ?? null;

  return {
    bookingId: buchung.id,
    email: buchung.email,
    name: buchung.name,
    dateLabel: slot ? formatDate(slot.date) : null,
    startTime: slot?.startTime ?? null,
    endTime: slot?.endTime ?? null,
    studioName: ort?.name ?? null,
    studioAdresse: ort ? `${ort.street}, ${ort.postalCode} ${ort.city}` : null,
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
