import type { Metadata } from "next";
import { ZielCheck, type FensterTermin } from "@/components/ziel/ziel-check";
import { getStudios, getUpcomingSlots } from "@/lib/data";
import { formatDateShort } from "@/lib/format";
import { FENSTER, fensterVon } from "@/lib/ziel-check";

/**
 * Der Ziel-Check: drei Fragen, danach "Dein Startplan".
 *
 * Für alle, die noch nicht wissen, ob EMS zu ihnen passt - und als Ziel
 * für Anzeigen und Beiträge ("Mach den 30-Sekunden-Check"). Die Antworten
 * bleiben im Browser; erst wer am Ende ein Probetraining anfragt, schickt
 * etwas ab, und dann nur das Ziel.
 *
 * BEWUSST KEINE GESUNDHEITSFRAGEN (siehe @/lib/ziel): gefragt wird nach
 * Ziel, Zeitfenster und Trainingserfahrung - nicht nach Beschwerden.
 */

export const metadata: Metadata = {
  title: "Ziel-Check: Passt EMS zu dir?",
  description:
    "Drei kurze Fragen zu deinem Ziel, deiner Zeit und deiner Erfahrung - danach siehst du deinen persönlichen EMS-Startplan und den nächsten freien Termin.",
  alternates: { canonical: "/ziel-check" },
};

export default async function ZielCheckSeite() {
  const [studios, slots] = await Promise.all([getStudios(), getUpcomingSlots()]);
  const jetzt = new Date();

  // Der nächste freie Termin je Zeitfenster - echte Daten, damit der
  // Startplan nicht "z. B. donnerstags" sagt, sondern einen Tag nennt.
  const termine: Partial<Record<string, FensterTermin>> = {};
  for (const slot of slots) {
    const beginn = new Date(slot.date);
    const [h, m] = slot.startTime.split(":").map(Number);
    beginn.setHours(h, m, 0, 0);
    if (beginn < jetzt) continue;
    const fenster = fensterVon(slot.startTime);
    const eintrag = {
      label: `${formatDateShort(slot.date)} um ${slot.startTime} Uhr`,
      studio: studios.find((s) => s.id === slot.studioId)?.name ?? "",
    };
    if (!termine[fenster]) termine[fenster] = eintrag;
    if (!termine.flexibel) termine.flexibel = eintrag;
  }

  return <ZielCheck termine={termine} fensterListe={FENSTER} />;
}
