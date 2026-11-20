/**
 * Der Haken nach dem Absenden - einmal gezeichnet, dann steht er.
 *
 * Vorher stand hier die Szene "bestaetigt", deren Haken sich alle 6,5
 * Sekunden neu zeichnete. Für den einen Moment, auf den die Seite
 * hinarbeitet, passt ein Haken, der einmal entsteht und dann bleibt:
 * erst der Kreis, dann der Haken darin.
 *
 * Reines SVG mit CSS (globals.css, .haken-*): Es braucht keine Zeile
 * JavaScript, und bei "Bewegung reduzieren" ist er sofort fertig da.
 */
export function HakenGezeichnet({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden className={`text-accent ${className}`}>
      <circle cx="48" cy="48" r="44" className="fill-lime/10" />
      <circle
        cx="48"
        cy="48"
        r="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={100}
        className="haken-kreis"
        transform="rotate(-90 48 48)"
      />
      <path
        d="M29 49 L42 62 L67 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        className="haken-strich"
      />
    </svg>
  );
}
