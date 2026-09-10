import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { ImpulsMotiv } from "@/components/ui/impuls-motiv";

/**
 * Einheitlicher Seitenkopf für alle Unterseiten.
 *
 * Gegenstück zum SectionHeader: Vorher hatte jede Unterseite ihren eigenen
 * Kopfbereich mit leicht abweichenden Größen und Abständen.
 *
 * ZWEI ÄNDERUNGEN, beide aus derselben Beobachtung:
 *
 * Der Kopf stand still. Die Startseite baut sich auf - Kennzeichnung,
 * Überschrift, Absatz, Knöpfe, jedes mit etwas Versatz -, jede Unterseite
 * war dagegen von der ersten Millisekunde an fertig da. Der Unterschied
 * fällt beim Wechsel von der Startseite auf eine Unterseite sofort auf: Es
 * fühlt sich an, als wäre man auf einer anderen Website gelandet. Jetzt
 * steigen Kennzeichnung, Überschrift und Absatz nacheinander herauf,
 * dieselbe Bewegung und dieselbe Kurve wie im Hero.
 *
 * Und die rechte Hälfte war leer. Bei 1440 Pixeln Breite ist das die
 * halbe erste Bildschirmseite ohne Inhalt - dadurch las sich jede
 * Unterseite wie ein Textdokument. Dort steht jetzt das Impuls-Motiv der
 * Startseite in einer ruhigen Fassung: dasselbe Zeichen, damit die Seiten
 * zusammengehören, aber zurückgenommen genug, dass die Überschrift der
 * Blickfang bleibt.
 *
 * Die Bewegung läuft über CSS-Klassen und nicht über eine Bibliothek. Der
 * Seitenkopf ist auf jeder Unterseite das erste, was gezeichnet wird -
 * über JavaScript gesteuert stünde er bis zur Hydration unsichtbar da, und
 * genau diese Zeit misst Google als Ladezeit. Als reines CSS läuft er
 * sofort, ohne dass eine Zeile JavaScript geladen sein muss.
 */
export function PageHeader({
  kicker,
  title,
  intro,
  children,
  /**
   * Das Motiv weglassen. Für Seiten, auf denen rechts bereits etwas steht
   * oder auf denen Zierde fehl am Platz ist - Impressum, Datenschutz, und
   * die persönliche Terminseite eines Gastes.
   */
  ohneMotiv = false,
}: {
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  ohneMotiv?: boolean;
}) {
  return (
    // Der Kopf war bisher ein schmales Band mit Trennlinie und wirkte neben
    // der Startseite beliebig. Mit dem Schimmer im Hintergrund und mehr Luft
    // beginnt jede Unterseite jetzt erkennbar als eigene Seite.
    <section className="relative overflow-hidden border-b border-border bg-surface py-20 sm:py-24 md:py-32">
      <div aria-hidden className="soft-glow pointer-events-none absolute inset-0" />

      {/* Erst ab lg: Darunter hat der Text die volle Breite, und das Motiv
          läge hinter der Überschrift statt neben ihr. Rechts angeschnitten,
          damit es sich nicht als eigenständiges Bild anbietet - es ist
          Hintergrund, kein Inhalt. */}
      {!ohneMotiv && (
        <div
          aria-hidden
          className="zierde-ruht pointer-events-none absolute -right-16 top-1/2 hidden w-[420px] -translate-y-1/2 opacity-[0.55] lg:block xl:right-4"
        >
          <ImpulsMotiv className="w-full" />
        </div>
      )}

      <Container className="relative">
        {kicker && (
          <span
            className="hero-anim flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent"
            style={{ "--hero-delay": "0.05s" } as React.CSSProperties}
          >
            <span aria-hidden className="strich-waechst h-px w-8 bg-accent/50" style={{ "--hero-delay": "0.18s" } as React.CSSProperties} />
            {kicker}
          </span>
        )}
        <h1
          className={`hero-anim ${kicker ? "mt-4" : ""} max-w-4xl text-balance hyphens-auto break-words text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl`}
          style={{ "--hero-delay": "0.14s" } as React.CSSProperties}
        >
          {title}
        </h1>
        {intro && (
          <p
            className="hero-anim mt-6 max-w-2xl text-lg leading-relaxed text-muted"
            style={{ "--hero-delay": "0.26s" } as React.CSSProperties}
          >
            {intro}
          </p>
        )}
        {children && (
          <div
            className="hero-anim"
            style={{ "--hero-delay": "0.36s" } as React.CSSProperties}
          >
            {children}
          </div>
        )}
      </Container>
    </section>
  );
}
