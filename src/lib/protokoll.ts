import "server-only";
import { prisma } from "@/lib/prisma";
import { aktuellerAdmin } from "@/lib/admin-rechte";
import type { ProtokollArt } from "@/generated/prisma/enums";

/**
 * Wer hat wann was geändert.
 *
 * Seit es mehrere Zugänge gibt, ist "wer hat diese Buchung storniert?"
 * eine Frage, die niemand beantworten konnte. Bei vierzehn Standorten mit
 * je einem Team wird daraus schnell ein Streit darüber, ob überhaupt
 * jemand etwas geändert hat.
 *
 * Drei Entscheidungen, die hier bewusst so getroffen sind:
 *
 * ES WIRFT NIE. Ein Protokoll, das eine Stornierung verhindert, weil die
 * Protokollzeile nicht geschrieben werden konnte, ist schlimmer als gar
 * keines. Geht es schief, landet das im Serverprotokoll und der Vorgang
 * läuft weiter.
 *
 * ES PROTOKOLLIERT KEIN LESEN. Wer eine Liste öffnet, ändert nichts - und
 * ein Protokoll, in dem jeder Seitenaufruf steht, begräbt genau die
 * Einträge, für die es gedacht ist.
 *
 * ES SPEICHERT KEINE INHALTE. Festgehalten wird, WORUM es ging, nicht
 * WAS drinstand. Ein Abzug der Datenbank enthält damit keine zweite Kopie
 * jeder je geschriebenen Nachricht.
 */

export type ProtokollEintrag = {
  art: ProtokollArt;
  /** "Buchung", "Termin", "Studio", "Zugang", "Newsletter", ... */
  bereich: string;
  /** Worum es ging, in Klartext: "Anfrage von Maria Schmidt". */
  betreff: string;
  /** Was genau passiert ist, wenn der Betreff es nicht sagt. */
  detail?: string | null;
  /** Der betroffene Standort, falls es einen gibt. */
  studioId?: string | null;
};

/** Wie lange Einträge aufgehoben werden - siehe den täglichen Lauf. */
export const PROTOKOLL_TAGE = 180;

/**
 * Einen Vorgang festhalten.
 *
 * Wer gehandelt hat, wird hier selbst ermittelt und nicht übergeben: Ein
 * Aufrufer, der den Namen mitschickt, kann auch einen falschen
 * mitschicken - und dann protokolliert das Protokoll die Unwahrheit.
 */
export async function protokollieren(eintrag: ProtokollEintrag): Promise<void> {
  try {
    const admin = await aktuellerAdmin();

    await prisma.protokoll.create({
      data: {
        // Ohne angemeldeten Zugang läuft der Vorgang aus einem
        // Zeitplan - das ist eine ehrliche Angabe und kein Platzhalter.
        wer: admin?.email ?? "automatischer Lauf",
        art: eintrag.art,
        bereich: eintrag.bereich.slice(0, 60),
        betreff: eintrag.betreff.slice(0, 200),
        detail: eintrag.detail?.slice(0, 300) ?? null,
        studioId: eintrag.studioId ?? null,
      },
    });
  } catch (error) {
    console.error("Protokollzeile konnte nicht geschrieben werden:", error);
  }
}

/** Die Bereiche, die tatsächlich vorkommen - für die Filterreihe. */
export const BEREICHE = [
  "Buchung",
  "Termin",
  "Studio",
  "Trainer",
  "Zugang",
  "Newsletter",
  "Preise",
  "Inhalte",
  "Warteliste",
  "Empfehlung",
] as const;

export const ART_TEXT: Record<ProtokollArt, string> = {
  ANGELEGT: "angelegt",
  GEAENDERT: "geändert",
  GELOESCHT: "gelöscht",
  VERSENDET: "versendet",
  STATUS: "Status geändert",
};

export const ART_TON = {
  ANGELEGT: "ok",
  GEAENDERT: "idle",
  GELOESCHT: "off",
  VERSENDET: "open",
  STATUS: "open",
} as const;

export const ART_WERTE = [
  "ANGELEGT",
  "GEAENDERT",
  "GELOESCHT",
  "VERSENDET",
  "STATUS",
] as const;

/** Nur bekannte Werte aus der Adresszeile durchlassen. */
export function artAusText(text: string): ProtokollArt | "" {
  return (ART_WERTE as readonly string[]).includes(text) ? (text as ProtokollArt) : "";
}
