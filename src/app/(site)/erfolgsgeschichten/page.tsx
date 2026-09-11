import type { Metadata } from "next";
import { isVisible } from "@/lib/site-toggles";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { anfangsbuchstabe, stimmenHolen } from "@/lib/kundenstimmen";
import { VerwandlungenWand } from "@/components/verwandlungen-wand";

export const metadata: Metadata = {
  // Kanonische Adresse: Sonst kann Google dieselbe Seite unter mehreren
  // Adressen als mehrere Seiten werten und die Bewertung aufteilen.
  alternates: { canonical: "/erfolgsgeschichten" },
  title: "Erfolgsgeschichten",
  description:
    "Echte Menschen, echte Ergebnisse: So hat EMS-Training bei Körperformen das Leben unserer Mitglieder verändert.",
};

export default async function ErfolgsgeschichtenPage() {
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("erfolgsgeschichten"))) return notFound();

  const stimmen = await stimmenHolen();

  return (
    <>
      <PageHeader
        kicker="Erfahrungen"
        title={<>Erfolgs<span className="text-accent">geschichten</span></>}
        intro="Unsere Mitglieder kommen mit ganz unterschiedlichen Zielen - vom schmerzfreien Rücken bis zur Strandfigur. Das sagen sie über ihr Training bei Körperformen."
      />

      {/* Der Abschnitt fehlt, solange keine Stimme freigegeben ist. Die
          Seite besteht dann nur aus Kopf, Bildpaaren und dem Schluss -
          und das ist richtig so: Eine Überschrift "Erfahrungen" über
          einer leeren Fläche wäre schlechter als gar nichts. */}
      {stimmen.length > 0 && (
        <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
          <ImpulsStreu anordnung="weit" />
          <Container className="relative">
            <Stagger
              className={`grid gap-6 ${
                stimmen.length === 1
                  ? "max-w-xl"
                  : stimmen.length === 2
                    ? "md:grid-cols-2"
                    : "md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {stimmen.map((stimme) => (
                <StaggerItem key={stimme.id}>
                  <figure className="karte-hebt flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
                    <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                      &bdquo;{stimme.text}&ldquo;
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                      <span
                        aria-hidden
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/15 text-sm font-bold text-accent"
                      >
                        {anfangsbuchstabe(stimme.name)}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{stimme.name}</span>
                        {(stimme.ziel || stimme.monate) && (
                          <span className="block text-xs text-muted">
                            {stimme.ziel && `Ziel: ${stimme.ziel}`}
                            {stimme.ziel && stimme.monate ? " · " : ""}
                            {stimme.monate &&
                              `dabei seit ${stimme.monate} ${
                                stimme.monate === 1 ? "Monat" : "Monaten"
                              }`}
                          </span>
                        )}
                      </span>
                    </figcaption>
                  </figure>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      {/* Die Bilder stehen nach den Zitaten: Wer bis hierher gelesen hat,
          hat schon Worte gehört - das Bildpaar bestätigt sie dann, statt
          allein am Anfang eine Behauptung aufzustellen. Der Abschnitt
          fehlt ganz, solange kein freigegebener Eintrag vorliegt. */}
      <VerwandlungenWand />

      <section className="on-ink py-20 sm:py-24 md:py-32">
        <Container className="flex flex-col items-center text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Schreib deine eigene Geschichte
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              Der erste Schritt kostet nichts: ein unverbindliches
              Probetraining mit persönlicher Beratung.
            </p>
            <div className="mt-8">
              <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
