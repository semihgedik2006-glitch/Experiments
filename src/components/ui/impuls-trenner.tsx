/**
 * Der Impuls als Linie zwischen zwei Abschnitten.
 *
 * DER ANLASS: Das Motiv der Startseite und der Seitenköpfe ist immer
 * derselbe Kreis - und er steht immer oben. Wer eine Seite durchscrollt,
 * sieht ab dem zweiten Bildschirm nur noch weiße Karten auf weißer
 * Fläche, Abschnitt für Abschnitt. Die Seite lebt genau so lange, wie man
 * nicht scrollt.
 *
 * Hier läuft der Impuls deshalb quer: eine feine Linie mit ein paar
 * Knoten, an der ein heller Abschnitt entlangwandert. Sie steht dort, wo
 * ohnehin ein Schnitt ist - zwischen zwei Abschnitten - und macht aus der
 * Kante eine Bewegung.
 *
 * KEINE ZWEI GLEICHEN: Über `variante` liegen Knoten, Ausschlag und Tempo
 * anders. Drei identische Linien untereinander sähen aus wie ein Muster,
 * das versehentlich dreimal eingefügt wurde - und würden zusätzlich im
 * Gleichschritt blinken, was den Blick festhält, statt ihn weiterzuführen.
 *
 * Reine Zierde, deshalb für Vorleseprogramme ausgeblendet. Und ein
 * Element, das nur rechnet, wenn es im Bild ist (siehe .zierde-linie).
 */

type Variante = "a" | "b" | "c";

/**
 * Je Variante: wo die Knoten sitzen (in Prozent der Breite), wo der
 * Ausschlag liegt, und wie lange ein Durchlauf dauert.
 *
 * Die Werte sind von Hand gesetzt und nicht zufällig: Zufall erzeugt
 * regelmäßig Häufungen, die aussehen wie ein Fehler.
 */
const varianten: Record<
  Variante,
  { knoten: number[]; ausschlagBei: number; dauer: string; verzoegerung: string }
> = {
  a: { knoten: [14, 38, 72], ausschlagBei: 50, dauer: "5.5s", verzoegerung: "0s" },
  b: { knoten: [26, 60, 88], ausschlagBei: 34, dauer: "7s", verzoegerung: "1.2s" },
  c: { knoten: [8, 46, 64, 92], ausschlagBei: 68, dauer: "6.2s", verzoegerung: "2.4s" },
};

export function ImpulsTrenner({
  variante = "a",
  className = "",
}: {
  variante?: Variante;
  className?: string;
}) {
  const { knoten, ausschlagBei, dauer, verzoegerung } = varianten[variante];

  // Der Ausschlag in der Mitte der Linie - ein kurzer Zacken, wie auf
  // einem Messgerät. Er macht aus einem Strich ein Signal.
  const x = ausschlagBei * 10; // Prozent auf die Breite 1000 des Rahmens
  const pfad =
    `M 0 20 H ${x - 34} ` +
    `L ${x - 24} 8 L ${x - 12} 32 L ${x - 2} 20 ` +
    `L ${x + 8} 14 L ${x + 16} 26 L ${x + 24} 20 ` +
    `H 1000`;

  return (
    <div aria-hidden className={`zierde-linie pointer-events-none w-full ${className}`}>
      <svg
        viewBox="0 0 1000 40"
        // Die Linie soll die volle Breite einnehmen und dabei NICHT höher
        // werden - deshalb wird hier bewusst verzerrt. Kreise gäbe es hier
        // keine; die Knoten sind eigene Elemente mit fester Größe.
        preserveAspectRatio="none"
        className="h-10 w-full"
      >
        {/* Die ruhende Linie */}
        <path d={pfad} fill="none" strokeWidth="1.5" className="trenner-linie" />

        {/* Derselbe Pfad noch einmal, aber nur ein kurzes Stück davon
            sichtbar - das ist der Impuls, der entlangläuft. */}
        <path
          d={pfad}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="trenner-impuls"
          style={
            {
              "--trenner-dauer": dauer,
              "--trenner-verzug": verzoegerung,
            } as React.CSSProperties
          }
        />
      </svg>

      {/* Die Knoten liegen als eigene Ebene darüber, damit sie rund
          bleiben: Im verzerrten Rahmen oben wäre aus jedem Kreis eine
          liegende Ellipse geworden. */}
      <div className="relative -mt-10 h-10">
        {knoten.map((prozent, i) => (
          <span
            key={prozent}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${prozent}%` }}
          >
            <span
              className="streu-welle absolute inset-0 m-auto block h-1.5 w-1.5 rounded-full bg-lime"
              style={{ "--takt": `${i * 0.5}s` } as React.CSSProperties}
            />
            <span
              className="streu-punkt block h-1.5 w-1.5 rounded-full"
              style={
                {
                  backgroundColor: "var(--ring-mark)",
                  "--takt": `${i * 0.5}s`,
                } as React.CSSProperties
              }
            />
          </span>
        ))}
      </div>
    </div>
  );
}
