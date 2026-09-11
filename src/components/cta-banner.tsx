import { CalendarClock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ImpulsMotiv } from "@/components/ui/impuls-motiv";
import { beweiseHolen } from "@/lib/beweise";
import { getUpcomingSlots, getStudios } from "@/lib/data";
import { formatDateShort } from "@/lib/format";

/**
 * Der Aufruf am Seitenende.
 *
 * Er schließt die Startseite ab - und war ein dunkler Kasten mit drei
 * Zeilen Text darin. Genau die Stelle, an der jemand nach dem Lesen
 * entscheidet, ob er bucht, war damit das ruhigste Element der Seite.
 *
 * Jetzt liegt das Impuls-Motiv dahinter, sehr blass und beidseitig
 * angeschnitten. Es ist dasselbe Zeichen wie auf der Startseite und in
 * jedem Seitenkopf: Wer bis hierher gescrollt hat, hat es dreimal gesehen -
 * beim vierten Mal gehört es zur Marke.
 *
 * NEU: Über dem Knopf steht, wann der nächste Termin tatsächlich frei
 * ist. Vorher stand dort "Sichere dir jetzt deinen kostenlosen
 * Probetermin" - ein Satz, der auf jeder Fitnessseite steht und deshalb
 * keine Entscheidung auslöst. "Nächster freier Termin: Do., 18.09. um
 * 07:00 in Hürth" ist derselbe Aufruf, nur als Verabredung. Die Angabe
 * kommt aus den echten Terminen; gibt es keinen, entfällt sie ersatzlos.
 */
export async function CtaBanner() {
  const [slots, studios, beweise] = await Promise.all([
    getUpcomingSlots(),
    getStudios(),
    beweiseHolen(),
  ]);

  const naechster = slots[0];
  const studioName = naechster
    ? (studios.find((s) => s.id === naechster.studioId)?.name ?? null)
    : null;

  return (
    <section className="on-ink relative overflow-hidden pt-24 pb-24 sm:pt-28 md:pt-36">
      {/* Erst ab md: Auf dem Handy nimmt der Text die volle Breite ein, und
          das Motiv läge direkt hinter der Überschrift. */}
      <div
        aria-hidden
        className="zierde-ruht pointer-events-none absolute inset-0 hidden md:block"
      >
        <ImpulsMotiv className="absolute -left-24 top-1/2 w-[360px] -translate-y-1/2 opacity-40" />
        <ImpulsMotiv className="absolute -right-24 top-1/2 w-[360px] -translate-y-1/2 opacity-40" />
      </div>

      <Container className="relative">
        <Reveal className="flex flex-col items-center text-center">
          <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Bereit für deine erste Einheit?
          </h2>

          {naechster ? (
            <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <CalendarClock size={17} className="text-accent" aria-hidden />
              <span className="text-muted">Nächster freier Termin:</span>
              <span className="font-semibold">
                {formatDateShort(naechster.date)} um {naechster.startTime} Uhr
                {studioName && <span className="font-normal text-muted"> · {studioName}</span>}
              </span>
            </p>
          ) : (
            <p className="mt-4 max-w-md text-muted">
              Sichere dir deinen kostenlosen und unverbindlichen Probetermin.
            </p>
          )}

          <Button href="/probetermin" className="mt-7">
            Kostenlosen Probetermin buchen
          </Button>

          {/* Die drei Sätze, die jemand vor dem Klick beantwortet haben
              will - kostet es was, binde ich mich, muss ich was
              mitbringen. Sie stehen anderswo auf der Seite schon, aber
              nicht hier, wo entschieden wird. Alles drei sind Zusagen,
              keine Behauptungen über Wirkung. */}
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
            {[
              "0 € und unverbindlich",
              "Keine Mitgliedschaft, keine Kündigungsfrist",
              beweise.freieTermine7Tage
                ? `${beweise.freieTermine7Tage} freie Termine in den nächsten 7 Tagen`
                : "Ausrüstung stellen wir",
            ].map((punkt) => (
              <li key={punkt} className="flex items-center gap-1.5">
                <Check size={13} className="shrink-0 text-accent" aria-hidden />
                {punkt}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
