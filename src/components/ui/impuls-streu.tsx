/**
 * Der Impuls als Streufeld hinter einem Abschnitt.
 *
 * Das Gegenstück zum Kreis: Hier liegen die Punkte NICHT auf einer Bahn,
 * sondern verteilt über die Fläche - und sie sprechen trotzdem der Reihe
 * nach an, sodass eine Welle schräg durch den Abschnitt läuft.
 *
 * Warum verteilt statt geordnet: Ein Kreis ist ein Zeichen und gehört an
 * eine Stelle, an der man ihn ansieht - in den Seitenkopf. Hinter einem
 * Abschnitt voller Karten und Text wäre er ein zweiter Blickfang, der mit
 * dem Inhalt konkurriert. Verteilte Punkte lesen sich dagegen als Raum,
 * nicht als Motiv: Man bemerkt die Bewegung, ohne hinzusehen.
 *
 * Deshalb auch sehr blass. Wenn jemand die Punkte zählt statt die
 * Überschrift zu lesen, ist die Deckkraft zu hoch.
 *
 * DIE POSITIONEN sind von Hand gesetzt, nicht gewürfelt. Zufall erzeugt
 * regelmäßig Häufungen und leere Ecken, und beides sieht nach Versehen
 * aus. Die drei Anordnungen unterscheiden sich deutlich genug, dass zwei
 * Abschnitte untereinander nicht wie eine Wiederholung wirken.
 */

type Anordnung = "weit" | "diagonal" | "rand";

/** Punkte als [x, y] in Prozent, in der Reihenfolge des Aufleuchtens. */
const anordnungen: Record<Anordnung, [number, number][]> = {
  // Locker über die ganze Fläche, mit Luft in der Mitte, wo der Text steht.
  weit: [
    [6, 18], [17, 62], [9, 86], [27, 30], [23, 92],
    [76, 12], [88, 44], [94, 74], [69, 88], [82, 26],
    [38, 8], [58, 94],
  ],
  // Eine Welle, die von links unten nach rechts oben läuft.
  diagonal: [
    [4, 88], [14, 74], [11, 55], [26, 66], [22, 38],
    [40, 24], [55, 16], [71, 28], [66, 52], [84, 40],
    [92, 62], [79, 78],
  ],
  // Nur an den Rändern - für Abschnitte, deren Inhalt bis in die Mitte
  // reicht.
  rand: [
    [3, 12], [5, 40], [8, 68], [4, 92],
    [96, 16], [93, 42], [97, 70], [91, 90],
    [30, 4], [62, 6], [44, 96], [74, 94],
  ],
};

/** Ein voller Durchlauf über alle Punkte. */
const RUNDE = 6.5;

export function ImpulsStreu({
  anordnung = "weit",
  className = "",
}: {
  anordnung?: Anordnung;
  className?: string;
}) {
  const punkte = anordnungen[anordnung];

  return (
    <div
      aria-hidden
      className={`zierde-ruht pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {punkte.map(([x, y], i) => (
        <span
          key={`${x}-${y}`}
          className="absolute"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span
            className="streu-welle absolute inset-0 m-auto block h-2 w-2 rounded-full bg-lime"
            style={{ "--takt": `${(i / punkte.length) * RUNDE}s` } as React.CSSProperties}
          />
          <span
            className="streu-punkt block h-2 w-2 rounded-full"
            style={
              {
                backgroundColor: "var(--ring-mark)",
                "--takt": `${(i / punkte.length) * RUNDE}s`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
