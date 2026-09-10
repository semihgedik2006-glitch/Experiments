import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ImpulsMotiv } from "@/components/ui/impuls-motiv";

/**
 * Der Aufruf am Seitenende.
 *
 * Er steht auf jeder einzelnen Seite - und war ein dunkler Kasten mit drei
 * Zeilen Text darin. Genau die Stelle, an der jemand nach dem Lesen
 * entscheidet, ob er bucht, war damit das ruhigste Element der Seite.
 *
 * Jetzt liegt das Impuls-Motiv dahinter, sehr blass und beidseitig
 * angeschnitten. Es ist dasselbe Zeichen wie auf der Startseite und in
 * jedem Seitenkopf: Wer bis hierher gescrollt hat, hat es dreimal gesehen -
 * beim vierten Mal gehört es zur Marke.
 *
 * Zwei statt eines Motivs, links und rechts, damit die Mitte frei bleibt.
 * Dort steht die Überschrift, und die soll gewinnen.
 */
export function CtaBanner() {
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
          <p className="mt-4 max-w-md text-muted">
            Sichere dir jetzt deinen kostenlosen und unverbindlichen Probetermin.
          </p>
          <Button href="/probetermin" className="mt-8">
            Probetermin buchen
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
