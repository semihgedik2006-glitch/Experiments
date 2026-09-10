/**
 * Wie viele Plätze ein Termin noch hat.
 *
 * Bis hierher wurden Buchungen gezählt: drei Buchungen bei Kapazität drei
 * hieß "voll". Seit es die Angabe "wir kommen zu zweit" gibt, stimmt das
 * nicht mehr - zwei Personen belegen zwei Plätze, auch wenn sie in einer
 * Buchung stehen. Sonst stünde bei einem Termin für eine Person plötzlich
 * ein Paar, und der Trainer hätte eine Weste zu wenig.
 *
 * Diese Datei ist die einzige Stelle, an der gerechnet wird - Formular,
 * Serveraktion, Verschieben durch den Gast und die Anzeige der freien
 * Zeiten greifen alle darauf zu.
 */

export type BuchungFuerZaehlung = { zuZweit: boolean };

/** Plätze, die eine einzelne Buchung belegt. */
export function plaetzeJeBuchung(buchung: BuchungFuerZaehlung): number {
  return buchung.zuZweit ? 2 : 1;
}

/** Belegte Plätze eines Termins. Abgesagte zählen nicht mit. */
export function belegtePlaetze(buchungen: BuchungFuerZaehlung[]): number {
  return buchungen.reduce((summe, buchung) => summe + plaetzeJeBuchung(buchung), 0);
}

/** Freie Plätze. Nie negativ - eine Kapazität, die im Nachhinein verkleinert
 *  wurde, soll keine sinnlose Zahl ergeben. */
export function freiePlaetze(kapazitaet: number, buchungen: BuchungFuerZaehlung[]): number {
  return Math.max(0, kapazitaet - belegtePlaetze(buchungen));
}

/** Passt diese Anfrage noch hinein? */
export function passtNoch(
  kapazitaet: number,
  buchungen: BuchungFuerZaehlung[],
  zuZweit: boolean,
): boolean {
  return freiePlaetze(kapazitaet, buchungen) >= (zuZweit ? 2 : 1);
}
