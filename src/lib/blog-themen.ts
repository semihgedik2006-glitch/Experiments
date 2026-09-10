/**
 * Themen im Blog - und was daraus folgt.
 *
 * Zwei Dinge hängen daran: der Filter in der Übersicht und die verwandten
 * Beiträge unter einem Artikel.
 *
 * Der zweite Punkt ist der wichtigere. Wer einen Beitrag zu Ende liest,
 * ist der aufmerksamste Besucher, den die Seite hat - und stand bisher am
 * Ende vor nichts. Drei passende Beiträge dort halten ihn auf der Seite;
 * "zuletzt erschienen" wäre dagegen bei fünf Beiträgen reiner Zufall und
 * würde ihm genauso oft etwas völlig Fremdes anbieten.
 */

export type BeitragMitThemen = {
  id: string;
  slug: string;
  themen: string[];
};

/**
 * Themen aus einem Eingabefeld lesen.
 *
 * Getrennt wird an Komma UND Zeilenumbruch: Beides tippt jemand, der eine
 * Liste eingibt, und an einer Trennung zu scheitern wäre eine unnötige
 * Hürde.
 *
 * Doppelte werden entfernt, ohne dass die Schreibweise angetastet wird:
 * Wer "Rücken" eingibt, soll "Rücken" wiederfinden und nicht "rücken".
 * Verglichen wird dabei ohne Rücksicht auf Groß- und Kleinschreibung -
 * "Rücken" und "rücken" zweimal zu speichern ergäbe zwei Filterknöpfe für
 * dasselbe Thema.
 */
export function themenLesen(eingabe: string): string[] {
  const gesehen = new Set<string>();
  const ergebnis: string[] = [];

  for (const roh of eingabe.split(/[,\n]/)) {
    const thema = roh.trim().replace(/\s+/g, " ");
    if (!thema) continue;
    // Obergrenze je Thema: Ein ganzer Satz ist kein Schlagwort, und in der
    // Filterreihe würde er alles andere aus dem Bild schieben.
    if (thema.length > 40) continue;
    const schluessel = thema.toLocaleLowerCase("de");
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    ergebnis.push(thema);
    // Mehr als acht Themen an einem Beitrag heißt: keins davon sagt noch
    // etwas.
    if (ergebnis.length >= 8) break;
  }

  return ergebnis;
}

/** Für das Bearbeitungsfeld im Adminbereich. */
export function themenSchreiben(themen: string[]): string {
  return themen.join(", ");
}

/** Vergleichsform - siehe die Begründung bei themenLesen. */
export function themaSchluessel(thema: string): string {
  return thema.trim().toLocaleLowerCase("de");
}

/**
 * Alle vorkommenden Themen, nach Häufigkeit sortiert.
 *
 * Nach Häufigkeit und nicht alphabetisch: Die Filterreihe soll vorn das
 * zeigen, wozu es tatsächlich etwas zu lesen gibt. Ein Thema mit einem
 * einzigen Beitrag ganz vorn führt in eine Liste mit einem Eintrag.
 *
 * Bei gleicher Häufigkeit alphabetisch - sonst ändert sich die Reihenfolge
 * zwischen zwei Aufrufen, und die Filterreihe sähe jedes Mal anders aus.
 */
export function alleThemen(beitraege: { themen: string[] }[]): { name: string; anzahl: number }[] {
  const zaehler = new Map<string, { name: string; anzahl: number }>();

  for (const beitrag of beitraege) {
    for (const thema of beitrag.themen) {
      const schluessel = themaSchluessel(thema);
      const vorhanden = zaehler.get(schluessel);
      if (vorhanden) vorhanden.anzahl += 1;
      // Die zuerst gesehene Schreibweise gewinnt.
      else zaehler.set(schluessel, { name: thema, anzahl: 1 });
    }
  }

  return [...zaehler.values()].sort(
    (a, b) => b.anzahl - a.anzahl || a.name.localeCompare(b.name, "de"),
  );
}

/**
 * Die passendsten anderen Beiträge.
 *
 * Gewertet wird nach der Zahl gemeinsamer Themen. Bei Gleichstand
 * entscheidet das Erscheinungsdatum - die Reihenfolge, in der die Beiträge
 * hereinkommen, ist bereits die richtige.
 *
 * Beiträge OHNE gemeinsames Thema kommen trotzdem mit, aber ganz hinten.
 * Grund: Ein Beitrag ohne Themen - etwa ein frisch angelegter - stünde
 * sonst am Ende vor einer leeren Fläche, und das ist schlechter als ein
 * nicht perfekt passender Vorschlag.
 */
export function verwandteBeitraege<T extends BeitragMitThemen>(
  aktuell: BeitragMitThemen,
  alle: T[],
  anzahl = 3,
): T[] {
  const eigene = new Set(aktuell.themen.map(themaSchluessel));

  return alle
    .filter((beitrag) => beitrag.id !== aktuell.id)
    .map((beitrag, index) => ({
      beitrag,
      // Reihenfolge in `alle` als zweites Kriterium: Die Liste kommt
      // bereits nach Datum sortiert herein.
      index,
      treffer: beitrag.themen.filter((thema) => eigene.has(themaSchluessel(thema))).length,
    }))
    .sort((a, b) => b.treffer - a.treffer || a.index - b.index)
    .slice(0, anzahl)
    .map((eintrag) => eintrag.beitrag);
}
