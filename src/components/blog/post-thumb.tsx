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
  // Auf einen Bereich um die Markenfarbe herum begrenzen (Grün bis Blaugrün),
  // damit die Karten nicht wie ein Farbkasten wirken.
  return 70 + (hash % 110);
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

  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 88%), hsl(${hue + 25} 45% 78%))`,
      }}
    >
      {/* Feines Raster, das dem Verlauf etwas Struktur gibt. */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          color: `hsl(${hue} 40% 35%)`,
        }}
      />
      <span
        className="absolute bottom-3 right-4 text-5xl font-black leading-none opacity-25"
        style={{ color: `hsl(${hue} 45% 30%)` }}
      >
        {title.trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
