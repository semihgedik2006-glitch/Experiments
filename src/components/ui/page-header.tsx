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
    <section className="border-b border-border py-16 sm:py-20 md:py-28">
      <Container>
        {kicker && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
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
