import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { testimonials } from "@/lib/testimonials-data";

export const metadata: Metadata = {
  title: "Erfolgsgeschichten",
  description:
    "Echte Menschen, echte Ergebnisse: So hat EMS-Training bei Körperformen das Leben unserer Mitglieder verändert.",
};

export default function ErfolgsgeschichtenPage() {
  return (
    <>
      <PageHeader
        kicker="Erfahrungen"
        title={<>Erfolgs<span className="text-lime">geschichten</span></>}
        intro="Unsere Mitglieder kommen mit ganz unterschiedlichen Zielen - vom schmerzfreien Rücken bis zur Strandfigur. Das sagen sie über ihr Training bei Körperformen."
      />

      <section className="py-28 md:py-32">
        <Container>
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
                  <div className="flex gap-1 text-lime" aria-label={`${t.rating} von 5 Sternen`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                    &bdquo;{t.quote}&ldquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/15 text-sm font-bold text-lime">
                      {t.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {t.name}, {t.age}
                      </span>
                      <span className="block text-xs text-muted">
                        Ziel: {t.goal} &middot; dabei seit {t.months} Monaten
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-28 md:py-32">
        <Container className="flex flex-col items-center text-center">
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
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
