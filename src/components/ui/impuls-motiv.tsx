/**
 * Das Impuls-Motiv als ruhige Fassung für die Seitenköpfe.
 *
 * Der Anlass: Jede Unterseite begann mit Text links und einer leeren
 * rechten Hälfte. Bei 1440 Pixeln Breite war das die Hälfte des ersten
 * Bildschirms - nichts darin, und dadurch wirkte jede Unterseite wie ein
 * Textdokument, während die Startseite eine Website ist.
 *
 * Gezeigt wird dasselbe Motiv wie auf der Startseite (ems-figur.tsx), nur
 * deutlich zurückgenommen: kein gefüllter Ring, keine Zahl, keine
 * Signalkurve. Was bleibt, sind die kreisenden Bögen, der gestrichelte
 * Außenring und die Punkte, die der Reihe nach ansprechen.
 *
 * Warum überhaupt dasselbe Motiv: Eine Marke entsteht durch Wiederholung.
 * Sieben Unterseiten mit sieben verschiedenen Verzierungen sähen aus wie
 * sieben Websites. Ein Motiv, das an jedem Seitenkopf wiederkehrt, macht
 * aus ihnen eine.
 *
 * ZURÜCKGENOMMEN ist wörtlich gemeint: Es liegt hinter dem Text, in sehr
 * niedriger Deckkraft, und darf ihn an keiner Stelle schwerer lesbar
 * machen. Ein Seitenkopf ist nicht der Ort für einen Blickfang - dort steht
 * die Überschrift, und die soll gewinnen.
 *
 * Für Vorleseprogramme ausgeblendet: reine Zierde.
 */

const M = 180;
const R_AUSSEN = 168;
const R_PUNKTE = 132;
const ANZAHL_PUNKTE = 12;
const RUNDE = 5.4;

const punkte = Array.from({ length: ANZAHL_PUNKTE }, (_, i) => {
  const winkel = (i / ANZAHL_PUNKTE) * 2 * Math.PI - Math.PI / 2;
  return {
    x: M + Math.cos(winkel) * R_PUNKTE,
    y: M + Math.sin(winkel) * R_PUNKTE,
    takt: (i / ANZAHL_PUNKTE) * RUNDE,
  };
});

export function ImpulsMotiv({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 360"
      aria-hidden
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="motiv-schein">
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.18" />
          <stop offset="55%" stopColor="var(--color-lime)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={M} cy={M} r={R_AUSSEN} fill="url(#motiv-schein)" className="figur-schein" />

      <circle
        cx={M}
        cy={M}
        r={R_AUSSEN}
        fill="none"
        strokeWidth="1.5"
        strokeDasharray="2 12"
        className="impuls-aussenring"
      />

      <g fill="none" strokeLinecap="round" stroke="var(--color-lime)">
        <path
          d={`M ${M} ${M - 152} A 152 152 0 0 1 ${M + 107} ${M - 107}`}
          strokeWidth="2.5"
          strokeOpacity="0.45"
          className="impuls-bogen-rechts"
        />
        <path
          d={`M ${M} ${M + 152} A 152 152 0 0 1 ${M - 107} ${M + 107}`}
          strokeWidth="2.5"
          strokeOpacity="0.3"
          className="impuls-bogen-links"
        />
      </g>

      <circle cx={M} cy={M} r={R_PUNKTE} fill="none" strokeWidth="1" className="impuls-innenring" />

      {punkte.map(({ x, y, takt }, i) => (
        <g key={i} style={{ "--takt": `${takt}s` } as React.CSSProperties}>
          <circle cx={x} cy={y} r="4.5" className="figur-welle" fill="var(--color-lime)" />
          <circle cx={x} cy={y} r="4.5" className="figur-punkt" fill="var(--ring-mark)" />
        </g>
      ))}
    </svg>
  );
}
