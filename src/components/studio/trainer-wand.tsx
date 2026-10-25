import { Container } from "@/components/ui/container";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { TrainerBild } from "@/components/studio/trainer-bild";
import type { Sprache } from "@/lib/sprache";

export type TrainerAnzeige = {
  id: string;
  name: string;
  rolle: string | null;
  qualifikation: string | null;
  text: string | null;
  fotoUrl: string | null;
};

/**
 * Wer im Studio betreut.
 *
 * Der Abschnitt steht bewusst VOR der Terminbuchung und nicht danach: Er
 * beantwortet die Frage, die unmittelbar vor dem Klick auf "Termin"
 * aufkommt - wer erwartet mich da eigentlich? Unter dem Formular käme die
 * Antwort für den, der sie braucht, zu spät.
 *
 * Ein Raster und keine Liste: Zwei bis vier Menschen nebeneinander sind
 * ein Team, untereinander wären sie eine Aufzählung.
 */
export function TrainerWand({
  ort,
  trainer,
  sprache = "de",
}: {
  /** Die Texte der Profile kommen schon in dieser Sprache (lokal()). */
  sprache?: Sprache;
  /** Ortsname für die Überschrift: "in Hürth". */
  ort: string;
  trainer: TrainerAnzeige[];
}) {
  // Kein einziges Profil - dann auch keine Überschrift. Eine leere
  // Teamvorstellung sagt etwas anderes aus, als sie soll.
  if (trainer.length === 0) return null;
  const en = sprache === "en";

  return (
    <section className="relative overflow-hidden border-t border-border bg-surface py-20">
      <ImpulsStreu anordnung="rand" />
      <Container className="relative">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {en ? `Who looks after you in ${ort}` : `Wer dich in ${ort} betreut`}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          {en
            ? trainer.length === 1
              ? "At your trial session you are not on your own - one person is with you for the whole twenty minutes."
              : "At your trial session you are not on your own - one of them is with you for the whole twenty minutes."
            : trainer.length === 1
              ? "Beim Probetraining bist du nicht allein auf der Fläche - eine Person begleitet dich die ganzen zwanzig Minuten."
              : "Beim Probetraining bist du nicht allein auf der Fläche - eine von ihnen begleitet dich die ganzen zwanzig Minuten."}
        </p>

        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainer.map((person) => (
            <StaggerItem key={person.id} className="h-full">
              <article className="karte-hebt karte-glanz flex h-full flex-col items-center rounded-2xl border border-border bg-surface-raised p-6 text-center">
                <TrainerBild name={person.name} fotoUrl={person.fotoUrl} />
                <h3 className="mt-4 font-semibold">{person.name}</h3>
                {person.rolle && (
                  <p className="mt-0.5 text-sm text-accent">{person.rolle}</p>
                )}
                {person.text && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{person.text}</p>
                )}
                {/* Die Qualifikation steht unten und kleiner: Sie ist der
                    Beleg, nicht die Einladung. Wer sie sucht, findet sie -
                    wer sie nicht sucht, liest zuerst den Menschen. */}
                {person.qualifikation && (
                  <p className="mt-auto pt-4 text-xs text-muted">{person.qualifikation}</p>
                )}
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
