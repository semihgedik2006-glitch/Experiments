import { randomBytes } from "crypto";
import { siteConfig } from "@/lib/site-config";

/**
 * Mitglieder - wann welche Mail fällig ist und wann die Erstlaufzeit endet.
 *
 * Alles hier ist bewusst ohne Datenbank: reine Rechnungen auf einem Datum.
 * So lässt sich nachprüfen, wer an welchem Tag was bekommt, ohne dass dafür
 * jemand eine Mail abwarten muss.
 */

const TAG = 24 * 60 * 60 * 1000;

/** Wie beim Newsletter: 64 Zeichen, nicht erratbar, ohne Bezug zur Kennung. */
export function neuerMitgliedSchluessel(): string {
  return randomBytes(32).toString("hex");
}

export function mitgliederbereichLink(token: string): string {
  return `${siteConfig.url}/mitglied/${token}`;
}

export function umfrageLink(token: string, note?: number): string {
  return `${siteConfig.url}/umfrage/${token}${note ? `?note=${note}` : ""}`;
}

/** Ganze Kalendertage zwischen zwei Daten (UTC-Tage, wie die Termine). */
export function tageSeit(beginn: Date, heute: Date): number {
  const a = Date.UTC(beginn.getUTCFullYear(), beginn.getUTCMonth(), beginn.getUTCDate());
  const b = Date.UTC(heute.getUTCFullYear(), heute.getUTCMonth(), heute.getUTCDate());
  return Math.floor((b - a) / TAG);
}

/** Ein Datum plus n Monate - der 31.01. plus ein Monat ist der 28./29.02. */
export function plusMonate(datum: Date, monate: number): Date {
  const ziel = new Date(Date.UTC(datum.getUTCFullYear(), datum.getUTCMonth() + monate, 1));
  const letzterTag = new Date(
    Date.UTC(ziel.getUTCFullYear(), ziel.getUTCMonth() + 1, 0),
  ).getUTCDate();
  ziel.setUTCDate(Math.min(datum.getUTCDate(), letzterTag));
  return ziel;
}

/**
 * Das Ende der Erstlaufzeit.
 *
 * Danach läuft der Vertrag unbefristet weiter und ist mit vier Wochen
 * kündbar (so steht es im Anmeldeformular). Genau an dieser Stelle
 * kündigen die meisten - deshalb ist das Gespräch davor der wichtigste
 * Termin des ganzen Vertrags.
 */
export function erstlaufzeitEnde(
  vertragsbeginn: Date | null,
  laufzeitMonate: number | null,
): Date | null {
  if (!vertragsbeginn || !laufzeitMonate) return null;
  return plusMonate(vertragsbeginn, laufzeitMonate);
}

/**
 * Ab wie vielen Tagen vor dem Ende das Gespräch fällig ist.
 *
 * Drei Monate: Die Kündigungsfrist beträgt vier Wochen, und ein Termin
 * für ein Gespräch ist nicht von heute auf morgen gefunden. Wer erst in
 * der letzten Woche fragt, fragt jemanden, der schon gekündigt hat.
 */
export const GESPRAECH_VORLAUF_TAGE = 90;

export type Laufzeitstand =
  | { art: "unbekannt" }
  | { art: "laeuft"; ende: Date; tageBisEnde: number }
  | { art: "gespraech-faellig"; ende: Date; tageBisEnde: number }
  | { art: "monatlich"; ende: Date };

export function laufzeitstand(
  vertragsbeginn: Date | null,
  laufzeitMonate: number | null,
  heute: Date,
): Laufzeitstand {
  const ende = erstlaufzeitEnde(vertragsbeginn, laufzeitMonate);
  if (!ende) return { art: "unbekannt" };
  const tageBisEnde = -tageSeit(ende, heute);
  if (tageBisEnde < 0) return { art: "monatlich", ende };
  if (tageBisEnde <= GESPRAECH_VORLAUF_TAGE) return { art: "gespraech-faellig", ende, tageBisEnde };
  return { art: "laeuft", ende, tageBisEnde };
}

/**
 * Die Mails einer Mitgliedschaft.
 *
 * Jede hat ein Zeitfenster und keinen festen Tag. Fällt der tägliche Lauf
 * einmal aus, kommt die Mail am nächsten Tag - und nicht gar nicht. Das
 * Fenster ist aber kurz: Wer erst nach einem halben Jahr eingetragen wird,
 * bekommt keine "Willkommen in deiner ersten Woche"-Mail mehr.
 *
 * Angebote stehen in keiner dieser Mails. Trotzdem sind nicht alle gleich:
 *
 * Die Willkommensmails sind Service zum Vertrag - wann komme ich, wie
 * verschiebe ich, was ist mit ausgefallenen Terminen. Sie gehen an alle.
 *
 * Umfrage und Jubiläum gehen nur an Mitglieder mit Einwilligung. Eine
 * Zufriedenheitsumfrage per E-Mail gilt nach der Rechtsprechung als
 * Werbung (BGH, 10.07.2018, VI ZR 225/17), und ein Glückwunsch, der die
 * Bindung an das Studio stärken soll, ist davon nicht weit weg. Ohne
 * Einwilligung bleibt die Mail liegen, wird aber nicht als versandt
 * vermerkt - kommt die Einwilligung innerhalb des Zeitfensters, geht sie
 * noch raus.
 */
export type MitgliedMail =
  | "willkommen-1"
  | "willkommen-3"
  | "umfrage"
  | "willkommen-6"
  | `jubilaeum-${number}`;

const FENSTER: { mail: MitgliedMail; von: number; bis: number }[] = [
  { mail: "willkommen-1", von: 0, bis: 6 },
  { mail: "willkommen-3", von: 14, bis: 20 },
  { mail: "umfrage", von: 28, bis: 41 },
  { mail: "willkommen-6", von: 42, bis: 48 },
];

/** Jubiläen in Monaten. Ein Jahr und dann jedes weitere. */
export const JUBILAEEN = [6, 12, 24, 36, 48, 60] as const;

const JUBILAEUM_FENSTER_TAGE = 13;

/**
 * Welche Mail heute fällig ist - höchstens eine pro Tag und Mitglied.
 *
 * Eine am Tag reicht: Zwei Mails gleichzeitig von demselben Studio wirken
 * wie ein Versehen, und die zweite liest niemand.
 */
export function faelligeMail(
  vertragsbeginn: Date | null,
  bereitsVersandt: string[],
  heute: Date,
  einwilligung: boolean,
): MitgliedMail | null {
  if (!vertragsbeginn) return null;
  const tage = tageSeit(vertragsbeginn, heute);
  if (tage < 0) return null;

  for (const { mail, von, bis } of FENSTER) {
    if (!einwilligung && brauchtEinwilligung(mail)) continue;
    if (tage >= von && tage <= bis && !bereitsVersandt.includes(mail)) return mail;
  }

  if (!einwilligung) return null;
  for (const monate of JUBILAEEN) {
    const mail: MitgliedMail = `jubilaeum-${monate}`;
    if (bereitsVersandt.includes(mail)) continue;
    const seitJubilaeum = tageSeit(plusMonate(vertragsbeginn, monate), heute);
    if (seitJubilaeum >= 0 && seitJubilaeum <= JUBILAEUM_FENSTER_TAGE) return mail;
  }

  return null;
}

/** Welche Mails nur mit Einwilligung in Werbung rausgehen. */
export function brauchtEinwilligung(mail: MitgliedMail): boolean {
  return mail === "umfrage" || mail.startsWith("jubilaeum-");
}

/** "6 Monate", "1 Jahr", "2 Jahre" */
export function jubilaeumText(monate: number): string {
  if (monate < 12) return `${monate} Monate`;
  const jahre = monate / 12;
  return jahre === 1 ? "1 Jahr" : `${jahre} Jahre`;
}

/** Ab welcher Note sich das Studio melden sollte. */
export const NACHHAKEN_BIS_NOTE = 3;

export const NOTEN: { wert: number; text: string }[] = [
  { wert: 5, text: "Sehr zufrieden" },
  { wert: 4, text: "Zufrieden" },
  { wert: 3, text: "Geht so" },
  { wert: 2, text: "Eher unzufrieden" },
  { wert: 1, text: "Unzufrieden" },
];

export function notenText(note: number): string {
  return NOTEN.find((n) => n.wert === note)?.text ?? String(note);
}

/**
 * Die Online-Terminbuchung für Mitglieder in LogX.
 *
 * Ein Link und keine Nachbildung: Termine leben in LogX, und eine zweite
 * Buchungsoberfläche wäre eine zweite Stelle, an der sie auseinanderlaufen.
 */
export const TERMINBUCHUNG_URL = "https://logx.miha-bodytec.com/de/appointment/index";
