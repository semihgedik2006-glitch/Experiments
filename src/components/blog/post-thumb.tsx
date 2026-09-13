/**
 * Kartenkopf für Blogbeiträge.
 *
 * Ist ein Titelbild hinterlegt, wird es angezeigt - das Feld existierte
 * bereits in der Datenbank und im Admin, wurde aber nirgends ausgegeben.
 *
 * Ohne Bild stand hier bisher ein einzelner großer Buchstabe auf einem
 * Farbverlauf. Nebeneinander ergaben fünf solche Karten fünf fast gleiche
 * blassgrüne Rechtecke mit je einem zufälligen Buchstaben darin - der
 * Eindruck war "hier fehlt ein Bild", und der Buchstabe sagte über den
 * Beitrag nichts aus.
 *
 * Jetzt liegt dort der Impuls: dieselbe Linie wie in den Trennern und im
 * Seitenkopf. Sie ist das Zeichen der Marke, sie taucht auf jeder Seite
 * auf, und sie macht aus der Fläche einen Kartenkopf statt einer Lücke.
 * Unterschiedlich sind die Karten trotzdem - Ausschlag und Position des
 * Ausschlags kommen aus dem Slug, und zwar deutlicher, als sich das über
 * Farbe machen ließe: Der Farbbereich muss im warmen Markenbereich
 * bleiben, damit die Karten zur sandfarbenen Fläche gehören.
 */

/** Einfacher, stabiler Hash - gleicher Slug ergibt immer dasselbe Bild. */
function hashFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 100000;
  }
  return hash;
}

/**
 * Der Impulspfad für diesen Beitrag.
 *
 * Gleiche Bauart wie der Trenner zwischen zwei Abschnitten: eine ruhige
 * Linie, aus der an einer Stelle ein Ausschlag herausfährt. Wo er sitzt
 * und wie hoch er ausfällt, entscheidet der Slug - damit stehen im
 * Raster fünf erkennbar verschiedene Köpfe statt fünfmal desselben.
 */
function impulsPfad(hash: number): string {
  // Zwischen 28 % und 72 % der Breite: an den Rändern würde der Ausschlag
  // halb abgeschnitten, und in der Mitte säße er bei jedem Beitrag gleich.
  const x = 280 + (hash % 440);
  // Der Ausschlag darf nicht an den oberen Rand stoßen.
  const hoch = 16 + (Math.floor(hash / 7) % 14);

  return (
    `M 0 60 H ${x - 48} ` +
    `L ${x - 34} ${60 - hoch} ` +
    `L ${x - 16} ${60 + hoch} ` +
    `L ${x} 60 ` +
    `L ${x + 16} ${60 - Math.round(hoch * 0.55)} ` +
    `L ${x + 30} ${60 + Math.round(hoch * 0.4)} ` +
    `L ${x + 44} 60 ` +
    `H 1000`
  );
}

export function PostThumb({
  slug,
  title,
  coverImage,
  className = "h-40",
}: {
  slug: string;
  title: string;
  coverImage?: string | null;
  className?: string;
}) {
  if (coverImage) {
    return (
      <div className={`overflow-hidden bg-surface ${className}`}>
        {/* Bewusst ein einfaches img-Element: Die Adresse pflegt das Studio
            frei im Admin, sie muss nicht vorab konfiguriert werden. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  const hash = hashFromSlug(slug);

  // Nur der Farbton kommt aus dem Slug; Helligkeit und Sättigung legt CSS
  // fest. Nur so kann die Karte in der dunklen Ansicht abdunkeln - vorher
  // leuchteten die hellen Verläufe dort als grelle Blöcke heraus.
  //
  // Der Bereich bleibt eng (Oliv über Gelbgrün bis Sand): Er soll zur
  // sandfarbenen Grundfläche gehören. Unterscheidbar sind die Karten über
  // die Linie, nicht über die Farbe.
  const hue = 48 + (hash % 42);

  return (
    <div
      aria-hidden
      className={`post-thumb relative overflow-hidden ${className}`}
      style={{ "--thumb-hue": hue } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 1000 120"
        // Verzerren ist hier richtig: Die Linie soll die volle Breite
        // einnehmen, und der Ausschlag ist kein Kreis, dem das schaden
        // könnte.
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={impulsPfad(hash)}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="post-thumb-impuls"
        />
      </svg>
    </div>
  );
}
