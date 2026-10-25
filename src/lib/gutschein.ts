/**
 * Gutscheine zum Verschenken (Seite /gutschein).
 *
 * Verkauft wird nicht online: Wer einen Gutschein möchte, fragt über das
 * Formular an, das Studio meldet sich, bezahlt wird im Studio oder per
 * Überweisung, und der Gutschein kommt zum Ausdrucken oder liegt zum
 * Abholen bereit. Dafür braucht es keinen Zahlungsanbieter und keine
 * neuen Pflichtangaben im Shop-Recht.
 *
 * PREISE TRAGT IHR HIER EIN. Solange "preis" null ist, steht dort
 * "Preis auf Anfrage" - eine erfundene Zahl wäre schlimmer als keine.
 */

export type GutscheinArt = {
  titel: string;
  text: string;
  /** z. B. "149 €" - null, solange noch nicht festgelegt. */
  preis: string | null;
  hervorgehoben?: boolean;
};

export const GUTSCHEINE: GutscheinArt[] = [
  {
    titel: "Wertgutschein",
    text: "Ein Betrag eurer Wahl – einlösbar für Training und Mitgliedschaft in allen Studios.",
    preis: null,
  },
  {
    titel: "Ein Monat EMS-Training",
    text: "Vier Einheiten à 20 Minuten mit Trainer, inklusive Funktionswäsche.",
    preis: null,
    hervorgehoben: true,
  },
  {
    titel: "Zehnerkarte",
    text: "Zehn Einheiten, frei über das Jahr verteilt – für alle, die erst einmal reinschnuppern wollen.",
    preis: null,
  },
];
