/**
 * Gutscheine zum Verschenken (Seite /gutschein).
 *
 * Verkauft wird nicht online: Wer einen Gutschein möchte, fragt über das
 * Formular an, das Studio meldet sich, bezahlt wird im Studio oder per
 * Überweisung, und der Gutschein kommt zum Ausdrucken oder liegt zum
 * Abholen bereit. Dafür braucht es keinen Zahlungsanbieter und keine
 * neuen Pflichtangaben im Shop-Recht.
 *
 * KEINE PREISE auf der Seite - so gewünscht (Oktober 2026); den Preis
 * nennt das Studio auf die Anfrage hin.
 *
 * NOCH PLATZHALTER: Welche Gutscheine es gibt, steht noch nicht fest. Die
 * Seite bleibt unter "Sichtbarkeit" aus, bis die Arten hier stehen.
 */

export type GutscheinArt = {
  titel: string;
  text: string;
  hervorgehoben?: boolean;
};

export const GUTSCHEINE: GutscheinArt[] = [
  {
    titel: "Wertgutschein",
    text: "Ein Betrag eurer Wahl – einlösbar für Training und Mitgliedschaft, in der Regel in allen unseren Studios.",
  },
  {
    titel: "Ein Monat EMS-Training",
    text: "Vier Einheiten à 20 Minuten, jede mit persönlichem Trainer.",
    hervorgehoben: true,
  },
  {
    titel: "Zehnerkarte",
    text: "Zehn Einheiten, frei über das Jahr verteilt – für alle, die erst einmal reinschnuppern wollen.",
  },
];

/** Dieselben Gutscheine auf Englisch (Seite /en/voucher). */
export const GUTSCHEINE_EN: GutscheinArt[] = [
  {
    titel: "Gift voucher",
    text: "An amount of your choice – redeemable for training and membership, usually at all our studios.",
  },
  {
    titel: "One month of EMS training",
    text: "Four 20-minute sessions, each with a personal trainer.",
    hervorgehoben: true,
  },
  {
    titel: "10-session card",
    text: "Ten sessions, spread freely over the year – for anyone who wants to give it a try first.",
  },
];
