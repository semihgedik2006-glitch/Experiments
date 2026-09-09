import "server-only";
import { ortszeitAlsWeltzeit } from "@/lib/ics";

/**
 * Kalenderwochen für die Auswertung.
 *
 * Zwei Fallen, die hier bewusst umgangen werden:
 *
 * Der Server läuft in Weltzeit, das Studio in deutscher Zeit. Eine Anfrage
 * am Montag um 00:30 Uhr deutscher Zeit steht in der Datenbank als Sonntag
 * 22:30 Uhr - ohne Umrechnung landete sie in der Vorwoche.
 *
 * Und: Die Wochengrenzen liegen nicht in festen Abständen. Zwischen dem
 * letzten Montag im März und dem darauf folgenden liegen nur 167 Stunden,
 * im Oktober sind es 169. Deshalb wird jede Grenze einzeln aus dem
 * Kalenderdatum berechnet und nicht durch Addieren von sieben mal 24
 * Stunden.
 */

const TAG_MS = 24 * 60 * 60 * 1000;
const ZEITZONE = "Europe/Berlin";

export type Woche = {
  /** Montag 00:00 deutscher Zeit - untere Grenze, enthalten. */
  von: Date;
  /** Montag der Folgewoche - obere Grenze, nicht enthalten. */
  bis: Date;
  /** Kalenderwoche nach ISO 8601. */
  kw: number;
  /** "8.9. - 14.9." */
  zeitraum: string;
};

/** Das heutige Kalenderdatum in Deutschland, unabhängig von der Serverzeit. */
function heuteInDeutschland(): { jahr: number; monat: number; tag: number } {
  const teile = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZEITZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const wert = (name: string) => Number(teile.find((t) => t.type === name)?.value ?? "0");
  return { jahr: wert("year"), monat: wert("month"), tag: wert("day") };
}

/**
 * Kalenderwoche nach ISO 8601 aus dem Montag dieser Woche.
 *
 * Maßgeblich ist der Donnerstag: Die Woche gehört zu dem Jahr, in dem ihr
 * Donnerstag liegt. Deshalb kann der 1. Januar in KW 52 des Vorjahres
 * fallen und der 31. Dezember in KW 1 des Folgejahres.
 */
function isoWoche(montag: Date): number {
  const donnerstag = new Date(montag.getTime() + 3 * TAG_MS);
  const jahresBeginn = Date.UTC(donnerstag.getUTCFullYear(), 0, 1);
  return Math.floor((donnerstag.getTime() - jahresBeginn) / TAG_MS / 7) + 1;
}

/** "8.9." - kurz genug, um unter einem Balken zu stehen. */
function kurz(datum: Date): string {
  return `${datum.getUTCDate()}.${datum.getUTCMonth() + 1}.`;
}

/**
 * Die letzten `anzahl` Kalenderwochen, älteste zuerst, die laufende zuletzt.
 *
 * Gerechnet wird auf reinen Kalenderdaten in Weltzeit: Dort stimmen
 * Wochentag und Tagesarithmetik, ohne dass die Sommerzeit hineinspielt.
 * Erst die fertigen Grenzen werden in echte Zeitpunkte umgerechnet.
 */
export function letzteWochen(anzahl: number): Woche[] {
  const heute = heuteInDeutschland();
  const heutigesDatum = Date.UTC(heute.jahr, heute.monat - 1, heute.tag);
  // getUTCDay(): 0 = Sonntag. Für eine Woche ab Montag verschoben.
  const seitMontag = (new Date(heutigesDatum).getUTCDay() + 6) % 7;
  const montagDieserWoche = heutigesDatum - seitMontag * TAG_MS;

  const grenze = (datum: Date) =>
    ortszeitAlsWeltzeit(
      datum.getUTCFullYear(),
      datum.getUTCMonth() + 1,
      datum.getUTCDate(),
      0,
      0,
      ZEITZONE,
    );

  const wochen: Woche[] = [];
  for (let zurueck = anzahl - 1; zurueck >= 0; zurueck--) {
    const montag = new Date(montagDieserWoche - zurueck * 7 * TAG_MS);
    const sonntag = new Date(montag.getTime() + 6 * TAG_MS);
    const naechsterMontag = new Date(montag.getTime() + 7 * TAG_MS);

    wochen.push({
      von: grenze(montag),
      bis: grenze(naechsterMontag),
      kw: isoWoche(montag),
      zeitraum: `${kurz(montag)} - ${kurz(sonntag)}`,
    });
  }

  return wochen;
}

/**
 * In welche Woche fällt dieser Zeitpunkt? -1, wenn in keine.
 *
 * Rückwärts gesucht, weil die neuen Einträge am Ende stehen und die
 * meisten Anfragen aus den letzten Wochen stammen.
 */
export function wocheVon(zeitpunkt: Date, wochen: Woche[]): number {
  for (let i = wochen.length - 1; i >= 0; i--) {
    if (zeitpunkt >= wochen[i].von && zeitpunkt < wochen[i].bis) return i;
  }
  return -1;
}
