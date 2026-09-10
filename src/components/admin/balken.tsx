import type { ReactNode } from "react";

/**
 * Balken für die Auswertung.
 *
 * Drei Entscheidungen, die hier bewusst so getroffen sind:
 *
 * Eine Farbe für alle Balken. Die Länge zeigt schon die Menge - sie
 * zusätzlich einzufärben verbraucht den Kanal, der sonst Zugehörigkeit
 * zeigen könnte, und macht aus vierzehn Standorten vierzehn Farben, die
 * niemand auseinanderhält. Der Ton steht als --chart-mark in globals.css
 * und ist für hell und dunkel getrennt gewählt.
 *
 * Beschriftet wird sparsam: an den Wochenbalken nur die Spitze, an der
 * Rangliste jeder Wert - dort ist die Zahl die eigentliche Aussage und der
 * Balken nur die Ordnungshilfe. Eine Zahl über jedem Wochenbalken wäre eine
 * Tabelle, die so tut, als wäre sie ein Diagramm.
 *
 * Die Zeichnung selbst ist für Vorleseprogramme ausgeblendet. Sie bekommen
 * die Tabelle darunter beziehungsweise die Zeilen der Rangliste - dieselben
 * Zahlen, nur ohne Umweg über eine Beschreibung, die doch nie so genau ist
 * wie der Wert selbst.
 */

/** Balken, die auf der Grundlinie stehen - eine Woche je Balken. */
export function Wochenbalken({
  wochen,
  hoehe = 150,
}: {
  wochen: { kw: number; zeitraum: string; wert: number }[];
  /** Höhe der Zeichenfläche in Pixeln, ohne die Zeile für die Spitze. */
  hoehe?: number;
}) {
  const groesster = Math.max(...wochen.map((w) => w.wert));
  // Die Spitze wird nur beschriftet, wenn es überhaupt etwas zu zeigen gibt
  // und der Höchstwert eindeutig ist - bei drei gleich hohen Balken wäre
  // eine hervorgehobene Zahl willkürlich.
  const eindeutig = groesster > 0 && wochen.filter((w) => w.wert === groesster).length === 1;

  return (
    <div>
      <div
        aria-hidden="true"
        className="flex items-end gap-0.5 border-b border-border"
        style={{ height: hoehe + 22 }}
      >
        {wochen.map((woche) => {
          // Ein einzelner Balken wäre bei einem Höchstwert von 40 keine
          // vier Pixel hoch und damit unsichtbar. Zwei Pixel Mindesthöhe
          // machen aus "eine Anfrage" wieder etwas Sichtbares - und aus
          // "keine Anfrage" bleibt eine leere Stelle.
          const pixel =
            woche.wert > 0 ? Math.max(2, Math.round((woche.wert / groesster) * hoehe)) : 0;

          return (
            <div
              key={`${woche.kw}-${woche.zeitraum}`}
              title={`KW ${woche.kw} (${woche.zeitraum}): ${woche.wert}`}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              {eindeutig && woche.wert === groesster && (
                <span className="mb-1 text-[11px] font-semibold tabular-nums">{woche.wert}</span>
              )}
              {/* Oben vier Pixel gerundet, unten gerade: So bleibt ablesbar,
                  wo der Balken auf der Grundlinie aufsetzt. */}
              <span
                className="balken w-full max-w-6 rounded-t-[4px]"
                style={{ height: pixel }}
              />
            </div>
          );
        })}
      </div>

      <div aria-hidden="true" className="mt-1.5 flex gap-0.5">
        {wochen.map((woche) => (
          <span
            key={`${woche.kw}-${woche.zeitraum}`}
            className="flex-1 text-center text-[10px] tabular-nums text-muted"
          >
            {woche.kw}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Rangliste: Name, Balken, Zahl - absteigend sortiert.
 *
 * Als echte Tabelle ausgezeichnet, damit die Zuordnung von Name zu Wert
 * auch dann trägt, wenn der Balken nicht zu sehen ist.
 */
export function Rangbalken({
  beschriftung,
  eintraege,
}: {
  /** Kurze Beschreibung für Vorleseprogramme. */
  beschriftung: string;
  eintraege: { schluessel: string; name: string; wert: number; matt?: boolean }[];
}) {
  // Anmerkung zu `matt`: Zuerst war der Balken der Restmenge auf 40 Prozent
  // Deckkraft gesetzt. Gemessen kam er damit auf 1,75:1 zur Fläche - unter
  // den 3:1, die ein Balken zum Hintergrund braucht, um noch als Balken
  // erkennbar zu sein. Gedämpft wird deshalb nur die Beschriftung; der
  // Balken behält seine Farbe.
  const groesster = Math.max(...eintraege.map((e) => e.wert), 1);

  return (
    // table-fixed ist hier keine Kosmetik: Ohne feste Aufteilung richtet
    // sich eine Tabellenspalte nach ihrem längsten Inhalt und ignoriert
    // eine Höchstbreite. Ein Eintrag wie "WOCHENSPIEGEL30 - Anzeige
    // Kölner Wochenspiegel KW 30" schob damit die ganze Seite auf dem
    // Handy zur Seite. Mit fester Aufteilung greift das Kürzen.
    <table className="w-full table-fixed">
      <caption className="sr-only">{beschriftung}</caption>
      <colgroup>
        <col className="w-[45%]" />
        <col />
        <col className="w-12" />
      </colgroup>
      <tbody>
        {eintraege.map((eintrag) => (
          <tr key={eintrag.schluessel}>
            <th
              scope="row"
              // Der volle Text im Titel: Gekürzt wird nur die Anzeige,
              // nicht die Information.
              title={eintrag.name}
              className={`truncate py-1.5 pr-3 text-left text-sm font-normal ${
                eintrag.matt ? "text-muted" : ""
              }`}
            >
              {eintrag.name}
            </th>
            <td className="py-1.5">
              {/* Rechts vier Pixel gerundet - das ist das Datenende. Links
                  gerade an der gemeinsamen Startlinie. */}
              <span
                aria-hidden="true"
                className="balken block h-3 rounded-r-[4px]"
                style={{ width: `${(eintrag.wert / groesster) * 100}%` }}
              />
            </td>
            <td className="py-1.5 pl-3 text-right text-sm font-semibold tabular-nums">
              {eintrag.wert}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Einzelne Kennzahl - eine Zahl, die keinen Balken braucht. */
export function Kennzahl({
  wert,
  label,
  hinweis,
}: {
  wert: ReactNode;
  label: string;
  hinweis?: string;
}) {
  return (
    <div className="admin-panel p-4">
      <p className="text-2xl font-bold tabular-nums">{wert}</p>
      <p className="mt-0.5 text-sm font-medium">{label}</p>
      {hinweis && <p className="mt-1 text-xs text-muted">{hinweis}</p>}
    </div>
  );
}
