/**
 * Rechnen mit Kalenderwochen für die Verfügbarkeitsansicht.
 *
 * Bewusst ohne Zusatzbibliothek: Es geht um Montag finden, sieben Tage
 * aufzählen und einen Tag als Text schreiben. Alles Weitere - Zeitzonen,
 * Sommerzeit, Wochenzählung nach ISO - würde die Ansicht nicht besser
 * machen, aber eine weitere Abhängigkeit einbringen.
 *
 * Alle Termine werden zum Tagesbeginn in Ortszeit verglichen, so wie sie
 * auch gespeichert werden.
 */

/** Montag der Woche, in der dieses Datum liegt - auf 00:00 Uhr gesetzt. */
export function montagDerWoche(datum: Date): Date {
  const d = new Date(datum);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0 = Sonntag. Der Sonntag gehört zur Woche davor, deshalb
  // sind es dort sechs Tage zurück statt minus eins.
  const versatz = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + versatz);
  return d;
}

export function tagePlus(datum: Date, tage: number): Date {
  const d = new Date(datum);
  d.setDate(d.getDate() + tage);
  return d;
}

/** Die sieben Tage einer Woche, beginnend beim übergebenen Montag. */
export function wochenTage(montag: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => tagePlus(montag, i));
}

/** Schlüssel für den Vergleich zweier Daten am selben Tag: "2026-09-07". */
export function tagesSchluessel(datum: Date): string {
  const d = new Date(datum);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * Liest "2026-09-07" aus der Adresse. Alles Unbrauchbare ergibt die
 * laufende Woche - eine kaputte Adresse darf keine leere Ansicht zeigen.
 */
export function montagAusText(text: string): Date {
  const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!treffer) return montagDerWoche(new Date());

  const datum = new Date(
    Number(treffer[1]),
    Number(treffer[2]) - 1,
    Number(treffer[3]),
  );
  if (Number.isNaN(datum.getTime())) return montagDerWoche(new Date());
  return montagDerWoche(datum);
}

const wochentage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

/** "Mo" - für die Spaltenköpfe. */
export function kurzerWochentag(datum: Date): string {
  return wochentage[(datum.getDay() + 6) % 7].slice(0, 2);
}

/** "7.9." - kurz genug für eine schmale Spalte. */
export function kurzesDatum(datum: Date): string {
  return `${datum.getDate()}.${datum.getMonth() + 1}.`;
}

/** "Montag, 7. September" - für die Kartenliste auf dem Handy. */
export function langerTag(datum: Date): string {
  return datum.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "7. - 13. September 2026" für die Kopfzeile der Woche. */
export function wochenTitel(montag: Date): string {
  const sonntag = tagePlus(montag, 6);
  const gleicherMonat = montag.getMonth() === sonntag.getMonth();

  const bis = sonntag.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const von = gleicherMonat
    ? `${montag.getDate()}.`
    : montag.toLocaleDateString("de-DE", { day: "numeric", month: "long" });

  return `${von} - ${bis}`;
}
