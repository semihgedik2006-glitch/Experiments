/**
 * Was jemand mit dem Training erreichen will.
 *
 * Hier stand vorher ein freies Feld "Deine Wunschzeit". Es war doppelt
 * gemoppelt: Die festen Zeiten stehen zur Auswahl darüber, und wann jemand
 * telefonisch erreichbar ist, wird eine Zeile weiter unten abgefragt. Wann
 * es tatsächlich passt, klärt sich am Telefon in zwanzig Sekunden - dafür
 * ruft man ja an. Übrig blieb ein Feld, das Text sammelte, den niemand
 * auswertete.
 *
 * An seine Stelle tritt die Frage, deren Antwort im Studio tatsächlich
 * etwas ändert: Wer abnehmen will, bekommt ein anderes erstes Gespräch als
 * jemand, der seinen Rücken stärken möchte - und über alle Anfragen
 * zusammen zeigt die Verteilung, womit geworben werden sollte.
 *
 * FREIWILLIG, anders als die Erreichbarkeit. Eine Anfrage darf nicht daran
 * scheitern, dass jemand sein Ziel noch nicht in vier Worte fassen kann.
 *
 * BEWUSST KEINE GESUNDHEITSFRAGE. Naheliegend wäre "Beschwerden?" oder
 * "Vorerkrankungen?" - und für das Training wäre die Antwort wertvoll.
 * Gesundheitsdaten sind aber nach Art. 9 DSGVO besonders geschützt: Sie
 * über ein Webformular einzusammeln, zieht eigene Pflichten nach sich, von
 * der ausdrücklichen Einwilligung bis zur Aufbewahrung. Das gehört in die
 * Anamnese vor Ort, nicht in ein Anfrageformular. "Rücken stärken" ist
 * dagegen ein Trainingsziel, keine Diagnose.
 *
 * Absichtlich Text und kein Aufzählungstyp in der Datenbank: Die Ziele
 * hängen am Angebot, und das ändert sich eher als das Schema. Ein Wert, der
 * später wegfällt, steht an alten Anfragen weiter lesbar da, statt beim
 * Auslesen einen Fehler zu werfen.
 */

export type Ziel = {
  /** Was in der Datenbank steht. */
  wert: string;
  /** Beschriftung im Formular und in den Listen. */
  label: string;
};

export const ZIELE: readonly Ziel[] = [
  { wert: "abnehmen", label: "Abnehmen" },
  { wert: "muskelaufbau", label: "Muskeln aufbauen" },
  { wert: "ruecken", label: "Rücken stärken" },
  { wert: "fitness", label: "Einfach fitter werden" },
  { wert: "unsicher", label: "Weiß ich noch nicht" },
] as const;

/** Gibt es diesen Wert? Ein leerer zählt als "nicht angegeben". */
export function istZiel(wert: string): boolean {
  return ZIELE.some((z) => z.wert === wert);
}

/**
 * Beschriftung für die Anzeige. Ein unbekannter oder fehlender Wert wird
 * nicht verschwiegen - an alten Anfragen steht dort nichts.
 */
export function zielText(wert: string | null | undefined): string {
  if (!wert) return "nicht angegeben";
  return ZIELE.find((z) => z.wert === wert)?.label ?? wert;
}
