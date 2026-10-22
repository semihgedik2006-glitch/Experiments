import type { Metadata } from "next";
import { ZielCheck } from "@/components/ziel/ziel-check";
import { FENSTER } from "@/lib/ziel-check";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getStudios } from "@/lib/data";

/**
 * Der Ziel-Check: drei Fragen, danach "Dein Startplan".
 *
 * Für alle, die noch nicht wissen, ob EMS zu ihnen passt - und als Ziel
 * für Anzeigen und Beiträge ("Mach den 30-Sekunden-Check"). Die Antworten
 * bleiben im Browser; erst wer am Ende ein Probetraining anfragt, schickt
 * etwas ab - über das Formular unter dem Startplan.
 *
 * BEWUSST KEINE GESUNDHEITSFRAGEN (siehe @/lib/ziel): gefragt wird nach
 * Ziel, Zeitfenster und Trainingserfahrung - nicht nach Beschwerden.
 */

export const metadata: Metadata = {
  title: "Ziel-Check: Passt EMS zu dir?",
  description:
    "Drei kurze Fragen zu deinem Ziel, deiner Zeit und deiner Erfahrung - danach siehst du deinen persönlichen EMS-Startplan und fragst mit einem Klick ein kostenloses Probetraining an.",
  alternates: { canonical: "/ziel-check" },
};

export default async function ZielCheckSeite() {
  const studios = await getStudios().catch(() => []);
  return <ZielCheck fensterListe={FENSTER} formular={<BookingFlow studios={studios} />} />;
}
