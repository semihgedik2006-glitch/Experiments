import { CalendarClock, MapPin, Clock3 } from "lucide-react";
import { beweiseHolen, freieTermineJeStudio } from "@/lib/beweise";
import { getStudios, getUpcomingSlots } from "@/lib/data";
import { formatDateShort } from "@/lib/format";

/**
 * Drei Tatsachen in einer Zeile.
 *
 * Für die Seiten, auf denen jemand landet und gleich entscheiden soll -
 * die Buchungsseite, die Kampagnenseiten aus bezahlter Werbung und die
 * vierzehn Standortseiten. Dort stand bisher, was das Training bringt;
 * nicht, ob und wann man hinkommt. Genau das ist aber die Frage, die
 * zwischen "interessant" und "ich trag mich ein" steht.
 *
 * Alle Angaben kommen aus der Datenbank. Fehlt eine, entfällt sie.
 * Bleibt über alle Standorte hinweg nur eine übrig, erscheint die Leiste
 * gar nicht - "irgendwo ist etwas frei" ist keine Auskunft. Auf einer
 * Standortseite genügt dagegen eine einzelne Angabe, weil sie sich auf
 * genau diesen Ort bezieht.
 *
 * Bewusst keine Verknappung ("nur noch 3 Plätze!"): Die Zahl stimmt so,
 * wie sie ist, und wirkt gerade deshalb. Sobald daraus ein Druckmittel
 * wird, glaubt sie niemand mehr - und bei zwanzig freien Terminen wäre
 * sie auch albern.
 */
export async function BeweisLeiste({
  className = "",
  /**
   * Auf einen Standort eingeschränkt - für die vierzehn Standortseiten.
   * Dort ist "irgendwo bei uns ist etwas frei" die falsche Auskunft:
   * Wer nach "EMS Hürth" sucht, will wissen, was in Hürth frei ist.
   */
  studioId,
}: {
  className?: string;
  studioId?: string;
}) {
  const [beweise, alleSlots, studios, jeStudio] = await Promise.all([
    beweiseHolen(),
    getUpcomingSlots(studioId),
    getStudios(),
    studioId ? freieTermineJeStudio() : Promise.resolve(null),
  ]);

  const naechster = alleSlots[0];
  const studioName = naechster
    ? (studios.find((s) => s.id === naechster.studioId)?.name ?? null)
    : null;

  const freieTermine = studioId
    ? (jeStudio?.get(studioId) ?? null)
    : beweise.freieTermine7Tage;

  const punkte: { icon: typeof MapPin; text: React.ReactNode }[] = [];

  if (naechster) {
    punkte.push({
      icon: CalendarClock,
      text: (
        <>
          <span className="text-muted">Nächster freier Termin: </span>
          <span className="font-semibold">
            {formatDateShort(naechster.date)} um {naechster.startTime} Uhr
          </span>
          {/* Auf einer Standortseite steht der Name des Studios schon in
              der Überschrift - ihn hier zu wiederholen wäre Füllmaterial. */}
          {!studioId && studioName && <span className="text-muted"> · {studioName}</span>}
        </>
      ),
    });
  }

  if (freieTermine) {
    punkte.push({
      icon: Clock3,
      text: (
        <>
          <span className="font-semibold">{freieTermine}</span>
          <span className="text-muted">
            {freieTermine === 1 ? " freier Termin" : " freie Termine"}
            {studioId ? " hier" : ""} in den nächsten 7 Tagen
          </span>
        </>
      ),
    });
  }

  if (!studioId && beweise.standorte > 1) {
    punkte.push({
      icon: MapPin,
      text: (
        <>
          <span className="font-semibold">{beweise.standorte} Studios</span>
          <span className="text-muted">
            {beweise.orte > 1 ? ` in ${beweise.orte} Orten rund um Köln` : " rund um Köln"}
          </span>
        </>
      ),
    });
  }

  // Auf der Standortseite bleiben höchstens zwei Angaben übrig - dort
  // ist auch eine allein noch eine Auskunft, weil sie sich auf genau
  // diesen Ort bezieht.
  if (punkte.length < (studioId ? 1 : 2)) return null;

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
