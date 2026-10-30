import { CalendarClock, MapPin, Clock3 } from "lucide-react";
import { beweiseHolen } from "@/lib/beweise";
import type { Sprache } from "@/lib/sprache";

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
  sprache = "de",
}: {
  className?: string;
  studioId?: string;
  sprache?: Sprache;
}) {
  const en = sprache === "en";
  const beweise = await beweiseHolen();

  // Keine freien Termine mehr: Das Team wird nach den Anfragen eingeteilt
  // (siehe @/lib/wunschzeit). Statt "Nächster freier Termin" steht hier,
  // wie es stattdessen läuft - Wunschzeit nennen, Rückmeldung bekommen.
  const punkte: { icon: typeof MapPin; text: React.ReactNode }[] = [
    {
      icon: CalendarClock,
      text: (
        <>
          <span className="font-semibold">{en ? "Tell us when suits you" : "Wunschzeit nennen"}</span>
          <span className="text-muted">
            {en ? " - we will get back to you with a matching time" : " - wir melden uns mit einem passenden Termin"}
          </span>
        </>
      ),
    },
    {
      icon: Clock3,
      text: (
        <>
          <span className="font-semibold">{en ? "20 minutes" : "20 Minuten"}</span>
          <span className="text-muted">{en ? " of training, free and no strings attached" : " Training, kostenlos und unverbindlich"}</span>
        </>
      ),
    },
  ];

  if (!studioId && beweise.standorte > 1) {
    punkte.push({
      icon: MapPin,
      text: (
        <>
          <span className="font-semibold">
            {beweise.standorte} {en ? "studios" : "Studios"}
          </span>
          <span className="text-muted">
            {en
              ? beweise.orte > 1
                ? ` in ${beweise.orte} towns in and around Cologne`
                : " in and around Cologne"
              : beweise.orte > 1
                ? ` in ${beweise.orte} Orten in Köln und Umgebung`
                : " in Köln und Umgebung"}
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
