import { CalendarClock, MapPin, Clock3 } from "lucide-react";
import { beweiseHolen } from "@/lib/beweise";

/**
 * Drei Tatsachen in einer Zeile.
 *
 * Für die Seiten, auf denen jemand landet und gleich entscheiden soll -
 * die Buchungsseite, die Kampagnenseiten aus bezahlter Werbung und die
 * vierzehn Standortseiten. Dort stand bisher, was das Training bringt;
 * nicht, ob und wann man hinkommt. Genau das ist aber die Frage, die
 * zwischen "interessant" und "ich trag mich ein" steht.
 *
 * Bewusst keine Verknappung ("nur noch 3 Plätze!").
 */
export async function BeweisLeiste({
  className = "",
  /** Auf einen Standort eingeschränkt - für die Standortseiten. */
  studioId,
}: {
  className?: string;
  studioId?: string;
}) {
  const beweise = await beweiseHolen();

  // Keine freien Termine mehr: Das Team wird nach den Anfragen eingeteilt
  // (siehe @/lib/wunschzeit). Statt "Nächster freier Termin" steht hier,
  // wie es stattdessen läuft - Wunschzeit nennen, Rückmeldung bekommen.
  const punkte: { icon: typeof MapPin; text: React.ReactNode }[] = [
    {
      icon: CalendarClock,
      text: (
        <>
          <span className="font-semibold">Wunschzeit nennen</span>
          <span className="text-muted"> - wir melden uns mit einem passenden Termin</span>
        </>
      ),
    },
    {
      icon: Clock3,
      text: (
        <>
          <span className="font-semibold">20 Minuten</span>
          <span className="text-muted"> Training, kostenlos und unverbindlich</span>
        </>
      ),
    },
  ];

  if (!studioId && beweise.standorte > 1) {
    punkte.push({
      icon: MapPin,
      text: (
        <>
          <span className="font-semibold">{beweise.standorte} Studios</span>
          <span className="text-muted">
            {beweise.orte > 1 ? ` in ${beweise.orte} Orten in Köln und Umgebung` : " in Köln und Umgebung"}
          </span>
        </>
      ),
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-2xl border border-lime/40 bg-lime/5 px-5 py-4 text-sm ${className}`}
    >
      {punkte.map((punkt, i) => (
        <span key={i} className="flex items-center gap-2.5">
          <punkt.icon size={16} className="shrink-0 text-accent" aria-hidden />
          <span>{punkt.text}</span>
        </span>
      ))}
    </div>
  );
}
