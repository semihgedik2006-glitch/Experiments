import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { anfangsbuchstabe, stimmenHolen } from "@/lib/kundenstimmen";

/**
 * Die drei ersten Kundenstimmen auf der Startseite.
 *
 * Vorher kamen sie aus einer Liste erfundener Zitate im Quelltext. Die
 * war als Platzhalter fürs Layout gemeint - stand aber auf der
 * Startseite, mit Namen, Alter und fünf Sternen. Jetzt kommen sie aus
 * dem Adminbereich, und wenn dort nichts freigegeben ist, fehlt der
 * Abschnitt ganz.
 *
 * Die Sterne sind mit weggefallen. Sie waren das Unehrlichste an der
 * alten Darstellung: fünf von fünf, sechsmal, ohne dass irgendwo eine
 * Bewertung abgegeben worden wäre. Wer Sterne will, findet sie bei
 * Google - dafür gibt es den Bewertungshinweis.
 */
export async function TestimonialsTeaser() {
  const stimmen = await stimmenHolen(3);
  if (stimmen.length === 0) return null;

  return (
    <section className="on-ink py-20 sm:py-24 md:py-32">
      <Container>
        <SectionHeader
          kicker="Erfahrungen"
          title="Das sagen unsere Mitglieder"
          intro="Unterschiedliche Ziele, ein gemeinsamer Nenner: 20 Minuten pro Woche, die wirken."
          className="mb-16"
          action={
            <Link
              href="/erfolgsgeschichten"
              className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline md:flex"
            >
              Alle Geschichten <ArrowRight size={14} />
            </Link>
          }
        />

        {/* Bei ein oder zwei Stimmen kein dreispaltiges Raster: Die
            Karten stünden sonst links und rechts bliebe eine leere
            Fläche, die aussieht, als fehle dort etwas. */}
        <Stagger
          className={`grid gap-6 ${
            stimmen.length === 1
              ? "max-w-xl"
              : stimmen.length === 2
                ? "sm:grid-cols-2"
                : "md:grid-cols-3"
          }`}
        >
          {stimmen.map((stimme) => (
            <StaggerItem key={stimme.id}>
              <figure className="flex h-full flex-col card p-7">
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                  &bdquo;{stimme.text}&ldquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/15 text-sm font-bold text-accent"
                  >
                    {anfangsbuchstabe(stimme.name)}
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">{stimme.name}</span>
                    {stimme.ziel && <span className="text-muted"> &middot; {stimme.ziel}</span>}
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
