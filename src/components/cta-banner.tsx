import Image from "next/image";
import { ArrowRight, CalendarClock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ImpulsMotiv } from "@/components/ui/impuls-motiv";

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
 * Über dem Knopf stand eine Zeit lang der nächste freie Termin. Die
 * Studios planen ihr Team aber nach den Anfragen, nicht nach festen
 * Terminen - deshalb steht dort jetzt, wie es läuft: Wunschzeit nennen,
 * Rückmeldung bekommen.
 */
export function CtaBanner() {
  return (
    <section className="on-ink relative isolate overflow-hidden pt-24 pb-24 sm:pt-28 md:pt-36">
      {/* Das Team im Hintergrund, stark gedämpft: Gesichter statt Leere,
          ohne dass der Text dagegen ankämpfen muss. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image
          src="/bilder/studio/team-jubel.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_30%] opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--ink)] via-[var(--ink)]/60 to-[var(--ink)]" />
      </div>
      {/* Erst ab md: Auf dem Handy nimmt der Text die volle Breite ein, und
          das Motiv läge direkt hinter der Überschrift. */}
      <div
        aria-hidden
        className="zierde-ruht pointer-events-none absolute inset-0 hidden md:block"
      >
        <ImpulsMotiv className="absolute -left-24 top-1/2 w-[360px] -translate-y-1/2 opacity-40" />
        <ImpulsMotiv className="absolute -right-24 top-1/2 w-[360px] -translate-y-1/2 opacity-40" />
      </div>
      {/* Leuchtball und Impulslinie aus der Einladung, hier leiser: Der
          Ball atmet hinter dem Knopf, die Linie läuft blass quer durch. */}
      <div aria-hidden className="aufruf-orb" />
      <svg className="aufruf-impuls" viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 44 H520 l18-30 22 60 18-30 H1200" />
      </svg>

      <Container className="relative">
        <Reveal className="flex flex-col items-center text-center">
          <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Bereit für deine <span className="einladung-leuchten text-accent">erste Einheit?</span>
          </h2>

          <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <CalendarClock size={17} className="text-accent" aria-hidden />
            <span className="text-muted">Nenn uns deine Wunschzeit - wir melden uns mit einem passenden Termin.</span>
          </p>

          <Button href="/probetermin" className="knopf-glanz-dauer group mt-7 px-8 py-3.5">
            Kostenlosen Probetermin buchen
            <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Button>

          {/* Die drei Sätze, die jemand vor dem Klick beantwortet haben
              will - kostet es was, binde ich mich, muss ich was
              mitbringen. Sie stehen anderswo auf der Seite schon, aber
              nicht hier, wo entschieden wird. Alles drei sind Zusagen,
              keine Behauptungen über Wirkung. */}
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
            {[
              "0 € und unverbindlich",
              "Danach die Mitgliedschaft, die zu dir passt",
              "Ausrüstung stellen wir",
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
