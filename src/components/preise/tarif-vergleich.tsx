import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Reveal } from "@/components/ui/reveal";

export type TarifAnzeige = {
  id: string;
  name: string;
  untertitel: string | null;
  preis: string | null;
  preisZusatz: string | null;
  leistungen: string[];
  empfohlen: boolean;
  hinweis: string | null;
};

/**
 * Die Tarife nebeneinander.
 *
 * Nebeneinander und nicht untereinander: Der Sinn einer Preisübersicht ist
 * der Vergleich, und untereinander vergleicht man nicht, sondern liest
 * nacheinander. Ab drei Tarifen bricht das Raster auf dem Handy trotzdem
 * um - drei Spalten auf 360 Pixeln wären 120 Pixel je Tarif.
 *
 * Der empfohlene Tarif steht in der Mitte, wenn es drei sind, und ist
 * hervorgehoben. Das ist eine Empfehlung und keine Falle: Er ist nicht
 * automatisch der teuerste, sondern der, den das Studio im Adminbereich
 * dafür ausgewählt hat.
 */
export function TarifVergleich({
  tarife,
  hinweis,
}: {
  tarife: TarifAnzeige[];
  /** Der Pflichthinweis unter der Übersicht. */
  hinweis: string;
}) {
  // Kein Tarif eingetragen, kein Abschnitt. Die Preisseite erklärt dann
  // weiterhin, warum dort keine Preisliste steht - und das ist eine
  // Haltung, keine Lücke.
  if (tarife.length === 0) return null;

  const spalten =
    tarife.length >= 3 ? "lg:grid-cols-3" : tarife.length === 2 ? "sm:grid-cols-2" : "";

  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <SectionHeader
          kicker="Tarife"
          title="Was das Training kostet"
          intro="Die Übersicht zeigt, was in welchem Tarif steckt. Welcher zu dir passt, klären wir beim Probetermin - dort bekommst du das Angebot schriftlich."
          align="center"
          className="mb-14"
        />

        <Stagger className={`mx-auto grid max-w-5xl gap-6 ${spalten}`}>
          {tarife.map((tarif) => (
            <StaggerItem key={tarif.id} className="h-full">
              <div
                className={`karte-hebt flex h-full flex-col rounded-2xl border bg-surface-raised p-7 ${
                  tarif.empfohlen ? "border-lime" : "border-border"
                }`}
              >
                {/* Die Marke steht IM Kartenfluss und nicht als Fähnchen
                    über dem Rand: Ein überstehendes Fähnchen schneidet auf
                    dem Handy am Rand ab oder schiebt die Karte daneben
                    nach unten. */}
                {tarif.empfohlen && (
                  <span className="mb-3 self-start rounded-full bg-lime px-3 py-1 text-xs font-semibold text-on-lime">
                    Unsere Empfehlung
                  </span>
                )}

                <h3 className="text-xl font-bold tracking-tight">{tarif.name}</h3>
                {tarif.untertitel && (
                  <p className="mt-1 text-sm text-muted">{tarif.untertitel}</p>
                )}

                {tarif.preis && (
                  <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                    <span className="text-3xl font-black tracking-tight">{tarif.preis}</span>
                    {tarif.preisZusatz && (
                      <span className="text-sm text-muted">{tarif.preisZusatz}</span>
                    )}
                  </p>
                )}

                {tarif.leistungen.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {tarif.leistungen.map((leistung) => (
                      <li key={leistung} className="flex items-start gap-2.5 text-sm">
                        <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                        {leistung}
                      </li>
                    ))}
                  </ul>
                )}

                {/* mt-auto: Die Knöpfe aller Karten stehen auf einer Linie,
                    auch wenn ein Tarif zwei Leistungen mehr hat. */}
                <div className="mt-auto pt-7">
                  {tarif.hinweis && (
                    <p className="mb-4 text-xs leading-relaxed text-muted">{tarif.hinweis}</p>
                  )}
                  <Button
                    href="/probetermin"
                    variant={tarif.empfohlen ? "primary" : "secondary"}
                    className="w-full"
                  >
                    Probetermin buchen
                  </Button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Der Pflichthinweis. Steht immer unter der Übersicht, sobald
            Preise genannt werden - siehe src/lib/site-texte.ts. */}
        {hinweis.trim() && (
          <Reveal className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted">
            <p>{hinweis}</p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
