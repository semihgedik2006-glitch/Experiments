import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { testimonials } from "@/lib/testimonials-data";

export function TestimonialsTeaser() {
  const featured = testimonials.slice(0, 3);

  return (
    <section className="border-t border-border py-20 sm:py-24 md:py-32">
      <Container>
        <SectionHeader
          kicker="Erfahrungen"
          title="Das sagen unsere Mitglieder"
          intro="Unterschiedliche Ziele, ein gemeinsamer Nenner: 20 Minuten pro Woche, die wirken."
          className="mb-16"
          action={
            <Link
              href="/erfolgsgeschichten"
              className="hidden items-center gap-1 text-sm font-medium text-lime hover:underline md:flex"
            >
              Alle Geschichten <ArrowRight size={14} />
            </Link>
          }
        />

        <Stagger className="grid gap-6 md:grid-cols-3">
          {featured.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface-raised p-7">
                <div className="flex gap-1 text-lime" aria-label={`${t.rating} von 5 Sternen`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  &bdquo;{t.quote}&ldquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/15 text-sm font-bold text-lime">
                    {t.name.charAt(0)}
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-muted"> &middot; {t.goal}</span>
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
