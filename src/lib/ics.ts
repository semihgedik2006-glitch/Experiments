/**
 * Termindatei für Kalenderprogramme (iCalendar, .ics).
 *
 * Angehängt an die Bestätigungsmail lässt sich der Termin mit einem Tippen
 * in den Handy- oder Outlook-Kalender legen. Das ist der wirksamste Hebel
 * gegen vergessene Probetermine - ein Termin, der im Kalender steht, wird
 * seltener übersehen als einer, der in einer E-Mail steht.
 */

/**
 * Rechnet eine Uhrzeit in deutscher Ortszeit in die Weltzeit um.
 *
 * Der Grund, warum das nicht einfach "minus eine Stunde" ist: Zwischen
 * Ende März und Ende Oktober gilt Sommerzeit, dann sind es zwei. Ein fest
 * eingebauter Wert würde also ein halbes Jahr lang eine Stunde daneben
 * liegen - und zwar genau in der Sommersaison.
 *
 * Verfahren: Die gewünschte Wandzeit wird zunächst als Weltzeit gelesen.
 * Diesen Zeitpunkt lässt man sich in deutscher Ortszeit anzeigen und
 * vergleicht mit der gewünschten - die Abweichung ist der Zeitversatz.
 * Der zweite Durchgang fängt die zwei Stunden im Jahr ab, in denen die
 * Umstellung selbst dazwischenliegt.
 */
export function ortszeitAlsWeltzeit(
  jahr: number,
  monat: number,
  tag: number,
  stunde: number,
  minute: number,
  zeitzone = "Europe/Berlin",
): Date {
  const gewuenscht = Date.UTC(jahr, monat - 1, tag, stunde, minute, 0);

  let zeitpunkt = gewuenscht;
  for (let runde = 0; runde < 2; runde++) {
    const teile = new Intl.DateTimeFormat("en-US", {
      timeZone: zeitzone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(zeitpunkt));

    const wert = (name: string) => Number(teile.find((t) => t.type === name)?.value ?? "0");
    // hour kann bei hour12: false als "24" kommen - das ist Mitternacht.
    const stundeVorOrt = wert("hour") % 24;

    const alsWeltzeitGelesen = Date.UTC(
      wert("year"),
      wert("month") - 1,
      wert("day"),
      stundeVorOrt,
      wert("minute"),
      wert("second"),
    );

    const versatz = alsWeltzeitGelesen - zeitpunkt;
    const naechster = gewuenscht - versatz;
    if (naechster === zeitpunkt) break;
    zeitpunkt = naechster;
  }

  return new Date(zeitpunkt);
}

/** "20260910T160000Z" - das Format, das iCalendar für Weltzeit verlangt. */
function alsIcsZeit(datum: Date): string {
  return datum.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Maskiert Sonderzeichen. In iCalendar trennen Kommas und Semikolons
 * Felder - stünden sie ungeschützt im Text, bräche die Datei auseinander.
 */
function maskieren(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Faltet lange Zeilen. Die Norm erlaubt 75 Zeichen je Zeile; längere
 * werden mit einem führenden Leerzeichen fortgesetzt. Manche Programme
 * verwerfen sonst die ganze Datei.
 */
function falten(zeile: string): string {
  if (zeile.length <= 75) return zeile;
  const teile: string[] = [zeile.slice(0, 75)];
  let rest = zeile.slice(75);
  while (rest.length > 74) {
    teile.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest) teile.push(" " + rest);
  return teile.join("\r\n");
}

export type TerminDaten = {
  /** Eindeutig und gleichbleibend - dadurch ersetzt eine spätere Fassung
      den Eintrag im Kalender, statt einen zweiten anzulegen. */
  id: string;
  titel: string;
  beschreibung: string;
  ort: string;
  /** Datum des Termins; Uhrzeit daraus wird ignoriert. */
  datum: Date;
  /** "18:00" */
  von: string;
  /** "19:00" */
  bis: string;
  /** Zählt hoch, wenn sich der Termin ändert - sonst ignorieren Kalender
      die Aktualisierung. */
  fassung?: number;
  abgesagt?: boolean;
};

export function terminDatei(termin: TerminDaten): string {
  const [vonStunde, vonMinute] = termin.von.split(":").map(Number);
  const [bisStunde, bisMinute] = termin.bis.split(":").map(Number);

  // Das Datum steht in der Datenbank als Zeitpunkt, gemeint ist aber der
  // Kalendertag. Deshalb werden Jahr, Monat und Tag in deutscher Ortszeit
  // gelesen und die Uhrzeit aus den Zeitfeldern genommen.
  const teile = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(termin.datum);
  const wert = (name: string) => Number(teile.find((t) => t.type === name)?.value ?? "0");
  const jahr = wert("year");
  const monat = wert("month");
  const tag = wert("day");

  const beginn = ortszeitAlsWeltzeit(jahr, monat, tag, vonStunde, vonMinute);
  const ende = ortszeitAlsWeltzeit(jahr, monat, tag, bisStunde, bisMinute);

  const zeilen = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Koerperformen//Probetermin//DE",
    "CALSCALE:GREGORIAN",
    `METHOD:${termin.abgesagt ? "CANCEL" : "PUBLISH"}`,
    "BEGIN:VEVENT",
    `UID:${termin.id}@koerperformen`,
    `SEQUENCE:${termin.fassung ?? 0}`,
    `DTSTAMP:${alsIcsZeit(new Date())}`,
    `DTSTART:${alsIcsZeit(beginn)}`,
    `DTEND:${alsIcsZeit(ende)}`,
    `SUMMARY:${maskieren(termin.titel)}`,
    `DESCRIPTION:${maskieren(termin.beschreibung)}`,
    `LOCATION:${maskieren(termin.ort)}`,
    `STATUS:${termin.abgesagt ? "CANCELLED" : "CONFIRMED"}`,
    // Erinnerung des Kalenders selbst, zwei Stunden vorher.
    ...(termin.abgesagt
      ? []
      : [
          "BEGIN:VALARM",
          "TRIGGER:-PT2H",
          "ACTION:DISPLAY",
          `DESCRIPTION:${maskieren(termin.titel)}`,
          "END:VALARM",
        ]),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // iCalendar schreibt Zeilenenden mit Wagenrücklauf vor.
  return zeilen.map(falten).join("\r\n") + "\r\n";
}
