/**
 * Gutscheine zum Verschenken (Seite /gutschein).
 *
 * Zwei Wege:
 *   1. Die WEIHNACHTSAKTION (unten) wird online über Digistore24 gekauft -
 *      Wunsch Marcel, 26.10.2026: "4 Wochen für 90 €", ab 1. Dezember,
 *      zum Verschenken oder selbst nutzen. Digistore24 übernimmt Zahlung,
 *      Rechnung und Widerrufsbelehrung; der Kunde bekommt den Gutschein
 *      als PDF.
 *   2. Alle anderen Gutscheine: Anfrage über das Formular, bezahlt wird im
 *      Studio oder per Überweisung.
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

// "Ein Monat EMS-Training" ist jetzt die Weihnachtsaktion (unten) - mit Preis.
export const GUTSCHEINE: GutscheinArt[] = [
  {
    titel: "Wertgutschein",
    text: "Ein Betrag eurer Wahl – einlösbar für Training und Mitgliedschaft, in der Regel in allen unseren Studios.",
    preis: null,
  },
  {
    titel: "Zehnerkarte",
    text: "Zehn Einheiten, frei über das Jahr verteilt – für alle, die erst einmal reinschnuppern wollen.",
    preis: null,
  },
];

/** Dieselben Gutscheine auf Englisch (Seite /en/voucher). Preise wie oben. */
export const GUTSCHEINE_EN: GutscheinArt[] = [
  {
    titel: "Gift voucher",
    text: "An amount of your choice – redeemable for training and membership, usually at all of our studios.",
    preis: GUTSCHEINE[0].preis,
  },
  {
    titel: "10-session card",
    text: "Ten sessions, spread freely over the year – for anyone who wants to give it a try first.",
    preis: GUTSCHEINE[1].preis,
  },
];

/**
 * Die Weihnachtsaktion 2026 (Wunsch Marcel, 26.10.2026).
 *
 * KAUF-LINK: Die Adresse der Digistore24-Bestellseite steht NICHT im Code,
 * sondern in der Umgebungsvariable DIGISTORE_GUTSCHEIN_URL (bei Vercel
 * unter Settings -> Environment Variables). Solange sie fehlt, zeigt die
 * Seite statt "Jetzt kaufen" den Weg über das Anfrageformular - es gibt
 * also nie einen toten Knopf.
 *
 * SICHTBAR wird das Ganze wie bisher erst über den Schalter "Gutscheine"
 * im Adminbereich (Sichtbarkeit) - geplant zum 1. Dezember.
 */
export type Aktion = {
  kicker: string;
  titel: string;
  preis: string;
  text: string;
  punkte: string[];
  kaufen: string;
  hinweisKauf: string;
};

export const WEIHNACHTSAKTION: Aktion = {
  kicker: "Weihnachtsaktion",
  titel: "4 Wochen EMS-Training",
  preis: "90 €",
  text: "Zum Verschenken oder selbst nutzen: vier Einheiten à 20 Minuten, jede mit persönlichem Trainer.",
  punkte: [
    "4 Einheiten à 20 Minuten mit deinem Trainer",
    "Gutschein als PDF – sofort nach dem Kauf per E-Mail",
    "Einlösbar in unseren Studios in Köln und Umgebung",
  ],
  kaufen: "Jetzt Gutschein kaufen",
  hinweisKauf: "Sichere Bezahlung über Digistore24. Den Termin vereinbart die beschenkte Person direkt mit dem Studio.",
};

export const WEIHNACHTSAKTION_EN: Aktion = {
  kicker: "Christmas offer",
  titel: "4 weeks of EMS training",
  preis: "€90",
  text: "Give it as a gift or use it yourself: four 20-minute sessions, each with a personal trainer.",
  punkte: [
    "4 sessions of 20 minutes with your trainer",
    "Voucher as a PDF – sent by email right after purchase",
    "Redeemable at our studios in and around Cologne",
  ],
  kaufen: "Buy the voucher now",
  hinweisKauf: "Secure payment via Digistore24. The recipient books their appointment directly with the studio.",
};

/** Die Bestellseite bei Digistore24 - oder null, solange nicht eingetragen. */
export function gutscheinKaufUrl(): string | null {
  const url = process.env.DIGISTORE_GUTSCHEIN_URL?.trim();
  return url && /^https:\/\//.test(url) ? url : null;
}
