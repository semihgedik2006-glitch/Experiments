import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

/**
 * Einheitlicher Seitenkopf für alle Unterseiten.
 *
 * Gegenstück zum SectionHeader: Vorher hatte jede Unterseite ihren eigenen
 * Kopfbereich mit leicht abweichenden Größen und Abständen.
 */
export function PageHeader({
  kicker,
  title,
  intro,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    // Der Kopf war bisher ein schmales Band mit Trennlinie und wirkte neben
    // der Startseite beliebig. Mit dem Raster im Hintergrund und mehr Luft
    // beginnt jede Unterseite jetzt erkennbar als eigene Seite.
    <section className="relative overflow-hidden border-b border-border bg-surface py-20 sm:py-24 md:py-32">
      <div aria-hidden className="soft-glow pointer-events-none absolute inset-0" />
      <Container className="relative">
        {kicker && (
          <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span aria-hidden className="h-px w-8 bg-accent/50" />
            {kicker}
          </span>
        )}
        <h1
          className={`${kicker ? "mt-4" : ""} max-w-4xl text-balance hyphens-auto break-words text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl`}
        >
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>
        )}
        {children}
      </Container>
    </section>
  );
}
