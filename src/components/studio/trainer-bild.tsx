/**
 * Das Bild zu einem Trainerprofil - oder ein Ersatz dafür.
 *
 * Ohne Foto stehen hier die Anfangsbuchstaben auf einer Fläche in der
 * Markenfarbe. Der naheliegende Ersatz - eine graue Person als Umriss -
 * wäre schlechter: Er sagt "hier fehlt ein Bild" und wirkt wie ein
 * Ladefehler, während die Initialen wenigstens den Menschen benennen.
 *
 * Der Farbton kommt aus dem Namen, wie beim Blogbild aus dem Slug: Zwei
 * Trainer nebeneinander bekommen so unterschiedliche Flächen, und derselbe
 * Mensch behält seine über alle Seiten hinweg.
 */

/** Bis zu zwei Buchstaben: "Lena Hoffmann" wird zu "LH". */
function initialen(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  if (teile.length === 0) return "?";
  if (teile.length === 1) return teile[0].slice(0, 2).toLocaleUpperCase("de");
  return (teile[0][0] + teile[teile.length - 1][0]).toLocaleUpperCase("de");
}

/** Gleicher Name ergibt immer denselben Farbton - im warmen Markenbereich. */
function farbtonAusName(name: string): number {
  let summe = 0;
  for (let i = 0; i < name.length; i++) summe = (summe * 31 + name.charCodeAt(i)) % 100000;
  return 48 + (summe % 42);
}

const groessen = {
  klein: "h-16 w-16 text-base",
  gross: "h-24 w-24 text-xl sm:h-28 sm:w-28 sm:text-2xl",
} as const;

export function TrainerBild({
  name,
  fotoUrl,
  groesse = "gross",
}: {
  name: string;
  fotoUrl: string | null;
  groesse?: keyof typeof groessen;
}) {
  const klasse = `${groessen[groesse]} shrink-0 overflow-hidden rounded-full`;

  if (fotoUrl) {
    return (
      <div className={`${klasse} bg-surface`}>
        {/* Bewusst ein einfaches img-Element: Die Adresse pflegt das Studio
            frei im Admin, sie muss nicht vorab konfiguriert werden. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoUrl}
          // Leer und aria-hidden: Der Name steht unmittelbar daneben im
          // Text. "Foto von Lena Hoffmann" wäre für ein Vorleseprogramm
          // derselbe Name ein zweites Mal.
          alt=""
          aria-hidden
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`${klasse} trainer-initialen flex items-center justify-center font-bold`}
      style={{ "--trainer-hue": farbtonAusName(name) } as React.CSSProperties}
    >
      {initialen(name)}
    </div>
  );
}
