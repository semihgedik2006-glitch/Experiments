import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

/**
 * Einheitlicher Kopf für alle Sektionen: kleiner Akzent-Kicker, große
 * Headline, optionaler Einleitungstext und optionale Aktion rechts.
 *
 * Bewusst eine Komponente statt wiederholtem Markup - vorher hatte jede
 * Sektion ihre eigene Variante, wodurch die Startseite keine erkennbare
 * Hierarchie hatte.
 */
export function SectionHeader({
  kicker,
  title,
  intro,
  action,
  className = "",
  align = "left",
}: {
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <Reveal
      className={`${centered ? "mx-auto max-w-2xl text-center" : "flex flex-wrap items-end justify-between gap-6"} ${className}`}
    >
      <div className={centered ? "" : "max-w-2xl"}>
        {kicker && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {kicker}
          </span>
        )}
        <h2
          className={`${kicker ? "mt-4" : ""} text-balance hyphens-auto break-words text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl`}
        >
          {title}
        </h2>
        {intro && <p className="mt-5 text-base leading-relaxed text-muted">{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
