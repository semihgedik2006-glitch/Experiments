/**
 * Wann wir jemanden telefonisch erreichen.
 *
 * Eine Probetermin-Anfrage wird nicht durch das Formular zum Termin,
 * sondern durch den Rückruf. Ohne diese Angabe fängt jede Anfrage mit
 * Versuchen ins Leere an: mittags im Büro, abends beim Sport, und wer
 * dreimal nicht drangeht, wird irgendwann nicht mehr angerufen.
 *
 * Deshalb Pflichtangabe - aber mit "Jederzeit" als Ausweg, damit niemand
 * eine Spanne erfinden muss, die für ihn nicht stimmt.
 *
 * Die Zeitspannen stehen hier an einer Stelle für alle: Formular,
 * Serverprüfung, Anzeige im Adminbereich und Tabellenexport. Ein Wert, den
 * es hier nicht gibt, wird beim Absenden abgewiesen - sonst könnte man
 * beliebigen Text in das Feld schicken.
 *
 * Absichtlich Text und kein Aufzählungstyp in der Datenbank: Die Spannen
 * hängen an den Öffnungszeiten, und die ändern sich eher als das Schema.
 * Ein Wert, der später wegfällt, steht an alten Anfragen weiter lesbar da,
 * statt beim Auslesen einen Fehler zu werfen.
 */

export type Erreichbarkeit = {
  /** Was in der Datenbank steht. */
  wert: string;
  /** Kurzform für Listen und die Tabelle. */
  kurz: string;
  /** Die Zeitspanne, ohne die die Kurzform mehrdeutig wäre. */
  spanne?: string;
};

export const ERREICHBARKEITEN: readonly Erreichbarkeit[] = [
  { wert: "vormittags", kurz: "Vormittags", spanne: "8 - 12 Uhr" },
  { wert: "mittags", kurz: "Mittags", spanne: "12 - 14 Uhr" },
  { wert: "nachmittags", kurz: "Nachmittags", spanne: "14 - 17 Uhr" },
  { wert: "abends", kurz: "Abends", spanne: "17 - 20 Uhr" },
  // Steht bewusst am Ende: als Ausweg, nicht als bequemste erste Wahl. Und
  // ohne Zeitspanne - "jederzeit von 8 bis 20 Uhr" wäre nur mehr Text für
  // dieselbe Aussage.
  { wert: "egal", kurz: "Jederzeit" },
] as const;

/** Gibt es diesen Wert? Sonst wird die Anfrage abgewiesen. */
export function istErreichbarkeit(wert: string): boolean {
  return ERREICHBARKEITEN.some((e) => e.wert === wert);
}

/**
 * Beschriftung für die Anzeige. Ein unbekannter oder fehlender Wert wird
 * nicht verschwiegen: An alten Anfragen steht dort nichts, und das soll
 * man sehen, statt es für "jederzeit" zu halten.
 */
export function erreichbarkeitText(wert: string | null | undefined): string {
  if (!wert) return "nicht angegeben";
  const treffer = ERREICHBARKEITEN.find((e) => e.wert === wert);
  if (!treffer) return wert;
  return treffer.spanne ? `${treffer.kurz} (${treffer.spanne})` : treffer.kurz;
}

/** Kurzform ohne Spanne - für enge Stellen wie die Rangliste. */
export function erreichbarkeitKurz(wert: string | null | undefined): string {
  if (!wert) return "nicht angegeben";
  return ERREICHBARKEITEN.find((e) => e.wert === wert)?.kurz ?? wert;
}
