/**
 * Rechnen mit Tagen, Wochen und Monaten - für die Verfügbarkeitsansicht
 * und den Kalender.
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

/**
 * Liest "2026-09-07" als einzelnen Tag.
 *
 * Anders als montagAusText springt das Ergebnis NICHT auf den Montag: Der
 * Kalender zeigt auch einzelne Tage und ganze Monate, und ein Aufruf mit
 * ?datum=2026-09-10 soll den 10. zeigen und nicht den 7.
 *
 * Geprüft wird nicht nur das Muster, sondern auch das Ergebnis: Aus
 * "2026-02-31" macht JavaScript stillschweigend den 3. März. Ein Datum,
 * das es nicht gibt, führt deshalb auf heute zurück statt auf einen
 * beliebigen anderen Tag.
 */
export function datumAusText(text: string): Date {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!treffer) return heute;

  const [jahr, monat, tag] = treffer.slice(1).map(Number);
  const datum = new Date(jahr, monat - 1, tag);
  const echt =
    datum.getFullYear() === jahr && datum.getMonth() === monat - 1 && datum.getDate() === tag;
  return echt ? datum : heute;
}

/** Der Erste des Monats, in dem dieses Datum liegt - auf 00:00 Uhr gesetzt. */
export function monatsAnfang(datum: Date): Date {
  const d = new Date(datum);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}

/**
 * Monate vor oder zurück - immer bezogen auf den Monatsersten.
 *
 * Erst auf den Ersten setzen, dann verschieben: Vom 31. März einen Monat
 * zurück wäre sonst der 3. März, weil der Februar keinen 31. hat und
 * JavaScript stillschweigend weiterzählt. Beim Blättern durch die
 * Monatsansicht wäre man damit im selben Monat hängen geblieben.
 */
export function monatePlus(datum: Date, monate: number): Date {
  const d = monatsAnfang(datum);
  d.setMonth(d.getMonth() + monate);
  return d;
}

/** "September 2026" für die Kopfzeile der Monatsansicht. */
export function monatsTitel(datum: Date): string {
  return datum.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

/**
 * Alle Tage, die im Monatsgitter stehen: vom Montag der ersten Woche bis
 * zum Sonntag der letzten. Die Länge ist immer durch sieben teilbar, damit
 * das Gitter keine angebrochene Zeile bekommt.
 *
 * Die Tage der Nachbarmonate stehen also mit drin. Sie wegzulassen und die
 * erste Zeile stattdessen einzurücken wäre dieselbe Fläche, nur ohne die
 * Angabe, welcher Tag dort steht.
 */
export function monatsGitter(datum: Date): Date[] {
  const erster = monatsAnfang(datum);
  const naechster = monatePlus(erster, 1);

  const tage: Date[] = [];
  let lauf = montagDerWoche(erster);
  // Bis der Monat durch ist - und dann bis zum Ende der angefangenen Woche.
  while (lauf < naechster || tage.length % 7 !== 0) {
    tage.push(lauf);
    lauf = tagePlus(lauf, 1);
  }
  return tage;
}

const wochentage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

/** "Mo" bis "So" - für die Kopfzeile des Monatsgitters. */
export const WOCHENTAGE_KURZ = wochentage.map((tag) => tag.slice(0, 2));

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

/**
 * "Donnerstag, 10. September 2026" - für die Kopfzeile der Tagesansicht.
 *
 * Mit Jahr, anders als langerTag: Wer sich durch die Monate blättert,
 * landet schnell im nächsten Jahr, und "Donnerstag, 10. September" allein
 * verrät nicht, in welchem.
 */
export function vollerTag(datum: Date): string {
  return datum.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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
