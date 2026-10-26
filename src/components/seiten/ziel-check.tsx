import type { Metadata } from "next";
import { ZielCheck } from "@/components/ziel/ziel-check";
import { fensterListe } from "@/lib/ziel-check";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getStudios } from "@/lib/data";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";

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

export function zielCheckMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(
    sprache,
    "/ziel-check",
    sprache === "en"
      ? {
          title: "Goal check: is EMS right for you?",
          description:
            "Three quick questions about your goal, time and experience - then your personal EMS starting plan and the free trial session.",
        }
      : {
          title: "Ziel-Check: Passt EMS zu dir?",
          description:
            "Drei kurze Fragen zu Ziel, Zeit und Erfahrung - danach dein persönlicher EMS-Startplan und das kostenlose Probetraining.",
        },
  );
}

export async function ZielCheckSeite({ sprache }: { sprache: Sprache }) {
  const studios = await getStudios().catch(() => []);
  return (
    <ZielCheck
      fensterListe={fensterListe(sprache)}
      formular={<BookingFlow studios={studios} sprache={sprache} />}
    />
  );
}
