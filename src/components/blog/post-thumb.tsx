/**
 * Kartenkopf für Blogbeiträge.
 *
 * Ist ein Titelbild hinterlegt, wird es angezeigt - das Feld existierte
 * bereits in der Datenbank und im Admin, wurde aber nirgends ausgegeben.
 * Ohne Bild entsteht aus dem Slug ein fester Farbverlauf, damit jeder
 * Beitrag ein eigenes, wiedererkennbares Erscheinungsbild hat statt einer
 * leeren weißen Fläche.
 */

/** Einfacher, stabiler Hash - gleicher Slug ergibt immer dieselbe Farbe. */
function hueFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 100000;
  }
  // Auf einen warmen Bereich um die Markenfarbe begrenzen (Oliv über
  // Gelbgrün bis Sand), damit die Karten zur sandfarbenen Grundfläche
  // gehören. Der frühere Bereich reichte bis Blaugrün und wirkte in der
  // warmen Umgebung wie ein Fremdkörper.
  return 48 + (hash % 42);
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

  const hue = hueFromSlug(slug);

  // Nur der Farbton kommt aus dem Slug; Helligkeit und Sättigung legt CSS
  // fest. Nur so kann die Karte in der dunklen Ansicht abdunkeln - vorher
  // leuchteten die hellen Verläufe dort als grelle Blöcke heraus.
  return (
    <div
      aria-hidden
      className={`post-thumb relative overflow-hidden ${className}`}
      style={{ "--thumb-hue": hue } as React.CSSProperties}
    >
      {/* Feines Raster, das dem Verlauf etwas Struktur gibt. */}
      <div className="post-thumb-grid absolute inset-0" />
      <span className="post-thumb-letter absolute bottom-3 right-4 text-5xl font-black leading-none">
        {title.trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
