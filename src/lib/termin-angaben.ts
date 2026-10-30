import { randomBytes } from "node:crypto";
import { formatDate } from "@/lib/format";
import type { TerminAngaben } from "@/lib/email";
import type { Sprache } from "@/lib/sprache";

/**
 * Übersetzt eine Buchung aus der Datenbank in die Angaben, die alle
 * E-Mails brauchen. An einer Stelle, damit Bestätigung, Erinnerung und
 * Absage denselben Termin gleich beschreiben.
 */
type Ort = { name: string; street: string; postalCode: string; city: string; email?: string | null };

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
  /** Der vom Studio eingetragene Termin, wenn es keinen festen Platz gibt
      (Wunschzeiten). Optional, damit ältere Aufrufe gültig bleiben. */
  terminTag?: Date | null;
  terminUhrzeit?: string | null;
  /** Sprache der Anfrage ("de"/"en"). Fehlt sie, geht alles auf Deutsch raus. */
  sprache?: string | null;
};

export function terminAngaben(buchung: BuchungMitTermin): TerminAngaben {
  const slot = buchung.slot;

  // Der Standort an der Anfrage geht vor. Bei einer Anfrage ohne feste
  // Zeit ist er der einzige - vorher stand in deren Bestätigungsmail
  // weder Studioname noch Adresse. Steht ein Termin dran, sind beide
  // ohnehin derselbe: Beim Anlegen und beim Verschieben wird geprüft,
  // dass Termin und Standort zusammengehören.
  const ort = buchung.studio ?? slot?.studio ?? null;
  const sprache: Sprache = buchung.sprache === "en" ? "en" : "de";

  return {
    bookingId: buchung.id,
    email: buchung.email,
    name: buchung.name,
    dateLabel: slot
      ? formatDate(slot.date, sprache)
      : buchung.terminTag
        ? formatDate(buchung.terminTag, sprache)
        : null,
    startTime: slot?.startTime ?? (buchung.terminTag ? buchung.terminUhrzeit ?? null : null),
    // Ohne festen Platz kein festes Ende - der Kalendereintrag rechnet
    // dann selbst eine Stunde dazu.
    endTime: slot?.endTime ?? null,
    studioName: ort?.name ?? null,
    studioAdresse: ort ? `${ort.street}, ${ort.postalCode} ${ort.city}` : null,
    datum: slot?.date ?? buchung.terminTag ?? null,
    manageToken: buchung.manageToken,
    // Fehlt sie (Studio ohne eigene Adresse, oder die Abfrage hat sie
    // nicht mitgeladen), greift beim Versand die Sammeladresse.
    antwortAn: ort?.email?.trim() || null,
    sprache,
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
