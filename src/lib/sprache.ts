/**
 * Die englische Fassung.
 *
 * Warum es sie gibt: Köln hat sehr viele international Berufstätige, und
 * das ist genau die Zielgruppe für ein Training, das zwanzig Minuten in
 * der Woche kostet. Wer "EMS training Cologne" sucht und auf einer rein
 * deutschen Seite landet, klickt weiter.
 *
 * Wie weit sie reicht - und warum nicht weiter:
 *
 * Übersetzt ist der WEG ZUR ANFRAGE: die englische Einstiegsseite und das
 * Anfrageformular samt allen Meldungen, die der Server zurückgibt. Das ist
 * die Strecke, auf der aus einem Besucher ein Termin wird.
 *
 * NICHT übersetzt sind die Inhalte aus dem Adminbereich - Blogbeiträge,
 * häufige Fragen, Standorttexte, Trainerprofile. Sie stehen so da, wie das
 * Studio sie eingetragen hat. Eine Übersetzungsmaske für jedes dieser
 * Felder wäre doppelte Pflegearbeit für Texte, die sich wöchentlich
 * ändern - und ein leeres englisches Feld ist schlechter als ein
 * deutscher Text.
 *
 * NICHT übersetzt sind außerdem Impressum, Datenschutzerklärung und AGB.
 * Das ist kein Versäumnis: Eine übersetzte Rechtsgrundlage, die vom
 * deutschen Original abweicht, ist ein Haftungsrisiko. Verbindlich ist die
 * deutsche Fassung, und darauf wird verwiesen.
 */

export type Sprache = "de" | "en";

export const SPRACHEN: { code: Sprache; label: string; kurz: string }[] = [
  { code: "de", label: "Deutsch", kurz: "DE" },
  { code: "en", label: "English", kurz: "EN" },
];

/** Alles Unbekannte ist Deutsch - das ist die Hauptfassung. */
export function spracheAusText(text: string | null | undefined): Sprache {
  return text === "en" ? "en" : "de";
}

type Woerterbuch = {
  /* --- Formular ------------------------------------------------------ */
  wannPasst: string;
  wannPasstNummeriert: string;
  deineDaten: string;
  deineDatenNummeriert: string;
  wannErreichbar: string;
  wannErreichbarNummeriert: string;
  uhrzeitAm: (tag: string) => string;
  keineTermine: string;
  keineFreienTermine: string;
  ohneZeitHinweis: string;
  zuZweit: string;
  zuZweitHinweis: string;
  name: string;
  email: string;
  telefon: string;
  nachrichtLabel: string;
  nachrichtPlatzhalter: string;
  zielFrage: string;
  codeLabel: string;
  codeHinweis: string;
  codePlatzhalter: string;
  absenden: string;
  absendenLaeuft: string;
  gesendet: string;
  /* --- Standortwahl -------------------------------------------------- */
  studioWaehlen: string;
  naechstesFinden: string;
  ortAbgelehnt: string;
  ortNichtVerfuegbar: string;
  /* --- Ziele und Erreichbarkeit -------------------------------------- */
  ziele: Record<string, string>;
  erreichbarkeiten: Record<string, string>;
  /** Die Zeitspanne hinter der Erreichbarkeit. */
  spannen: Record<string, string>;
  /* --- Meldungen des Servers ----------------------------------------- */
  pflichtfelder: string;
  emailUngueltig: string;
  telefonUngueltig: string;
  zielUngueltig: string;
  erreichbarkeitFehlt: string;
  studioFehlt: string;
  terminWeg: string;
  terminVoll: string;
  terminVollZuZweit: string;
  schiefgelaufen: string;
  wartezeit: (sekunden: number) => string;
  danke: string;
  warteliste: string;
  wartelisteZuZweit: string;
  terminStudioPasstNicht: string;
  /* --- Aktions- und Empfehlungscodes --------------------------------- */
  codeUnbekannt: (code: string) => string;
  codeUngueltig: (code: string) => string;
  codeAbGueltig: (code: string, datum: string) => string;
  codeAbgelaufen: (code: string, datum: string) => string;
};

const de: Woerterbuch = {
  wannPasst: "Wann passt es dir?",
  wannPasstNummeriert: "1. Wann passt es dir?",
  deineDaten: "Deine Daten",
  deineDatenNummeriert: "2. Deine Daten",
  wannErreichbar: "Wann erreichen wir dich am besten?",
  wannErreichbarNummeriert: "3. Wann erreichen wir dich am besten?",
  uhrzeitAm: (tag) => `Uhrzeit am ${tag}:`,
  keineTermine: "Aktuell sind keine festen Termine hinterlegt",
  keineFreienTermine: "Keine freie Zeit dabei?",
  ohneZeitHinweis:
    "Schick die Anfrage einfach ohne Zeit ab - wir melden uns und finden einen Termin.",
  zuZweit: "Wir kommen zu zweit",
  zuZweitHinweis: "Dann brauchen wir zwei Plätze und zwei Geräte.",
  name: "Vor- und Nachname",
  email: "E-Mail-Adresse",
  telefon: "Telefonnummer",
  nachrichtLabel: "Noch etwas, das wir vorher wissen sollten?",
  nachrichtPlatzhalter:
    "Freiwillig - z.B. ob du schon EMS-Erfahrung hast, oder worauf wir bei dir achten sollen.",
  zielFrage: "Was möchtest du erreichen?",
  codeLabel: "Aktions- oder Empfehlungscode",
  codeHinweis:
    "Nur, wenn du einen hast - aus einer Anzeige, von einem Flyer oder von jemandem, der bei uns trainiert.",
  codePlatzhalter: "z.B. SOMMER26",
  absenden: "Probetermin anfragen",
  absendenLaeuft: "Wird gesendet...",
  gesendet: "Anfrage gesendet!",

  studioWaehlen: "In welchem Studio?",
  naechstesFinden: "Nächstes Studio finden",
  ortAbgelehnt: "Kein Problem - wähl dein Studio einfach selbst aus.",
  ortNichtVerfuegbar: "Standort ließ sich nicht bestimmen. Wähl dein Studio bitte selbst.",

  ziele: {
    abnehmen: "Abnehmen",
    muskelaufbau: "Muskeln aufbauen",
    ruecken: "Rücken stärken",
    fitness: "Einfach fitter werden",
    unsicher: "Weiß ich noch nicht",
  },
  erreichbarkeiten: {
    vormittags: "Vormittags",
    mittags: "Mittags",
    nachmittags: "Nachmittags",
    abends: "Abends",
    egal: "Jederzeit",
  },
  spannen: {
    vormittags: "8 - 12 Uhr",
    mittags: "12 - 14 Uhr",
    nachmittags: "14 - 17 Uhr",
    abends: "17 - 20 Uhr",
  },

  pflichtfelder: "Bitte fülle alle Pflichtfelder aus.",
  emailUngueltig: "Bitte gib eine gültige E-Mail-Adresse ein.",
  telefonUngueltig: "Bitte gib eine gültige Telefonnummer ein.",
  zielUngueltig: "Bitte wähl aus, was du erreichen möchtest.",
  erreichbarkeitFehlt: "Bitte gib an, wann wir dich telefonisch erreichen.",
  studioFehlt: "Bitte wähl ein Studio aus.",
  terminWeg: "Dieser Termin ist nicht mehr verfügbar. Bitte wähl eine andere Zeit.",
  terminVoll: "Dieser Termin ist inzwischen ausgebucht. Bitte wähl eine andere Zeit.",
  terminVollZuZweit:
    "Für zwei Personen ist hier kein Platz mehr. Bitte wähl eine andere Zeit - oder kommt einzeln.",
  schiefgelaufen: "Da ist etwas schiefgelaufen. Bitte versuch es später erneut.",
  wartezeit: (sekunden) =>
    `Zu viele Anfragen. Bitte versuch es in ${Math.ceil(sekunden / 60)} Minuten erneut.`,
  danke:
    "Danke für deine Anfrage! Wir melden uns in Kürze zur Bestätigung deines Probetermins.",
  warteliste:
    "Diese Zeit ist gerade belegt - wir haben dich auf die Warteliste gesetzt und melden uns, sobald etwas frei wird.",
  wartelisteZuZweit:
    "Für diese Zeit sind gerade nicht mehr zwei Plätze frei - wir haben dich auf die Warteliste gesetzt und melden uns, sobald etwas frei wird.",
  terminStudioPasstNicht:
    "Termin und Studio passen nicht zusammen. Bitte wähle die Zeit noch einmal.",
  codeUnbekannt: (code) =>
    `Den Code „${code}“ kennen wir nicht. Prüf bitte die Schreibweise - oder lass das Feld einfach leer.`,
  codeUngueltig: (code) => `Der Aktionscode „${code}“ ist nicht mehr gültig.`,
  codeAbGueltig: (code, datum) => `Der Aktionscode „${code}“ gilt erst ab dem ${datum}.`,
  codeAbgelaufen: (code, datum) => `Der Aktionscode „${code}“ ist am ${datum} abgelaufen.`,
};

const en: Woerterbuch = {
  wannPasst: "When suits you?",
  wannPasstNummeriert: "1. When suits you?",
  deineDaten: "Your details",
  deineDatenNummeriert: "2. Your details",
  wannErreichbar: "When can we reach you by phone?",
  wannErreichbarNummeriert: "3. When can we reach you by phone?",
  uhrzeitAm: (tag) => `Time on ${tag}:`,
  keineTermine: "No fixed slots are listed right now",
  keineFreienTermine: "Nothing free that works for you?",
  ohneZeitHinweis:
    "Just send the request without picking a time - we will call you and find one together.",
  zuZweit: "Two of us are coming",
  zuZweitHinweis: "Then we need two spots and two machines.",
  name: "First and last name",
  email: "Email address",
  telefon: "Phone number",
  nachrichtLabel: "Anything we should know beforehand?",
  nachrichtPlatzhalter:
    "Optional - for example whether you have tried EMS before, or anything we should watch out for.",
  zielFrage: "What would you like to achieve?",
  codeLabel: "Promotion or referral code",
  codeHinweis:
    "Only if you have one - from an ad, a flyer, or from someone who trains with us.",
  codePlatzhalter: "e.g. SOMMER26",
  absenden: "Request a trial session",
  absendenLaeuft: "Sending...",
  gesendet: "Request sent!",

  studioWaehlen: "Which studio?",
  naechstesFinden: "Find the nearest studio",
  ortAbgelehnt: "No problem - just pick your studio yourself.",
  ortNichtVerfuegbar: "We could not determine your location. Please pick a studio yourself.",

  ziele: {
    abnehmen: "Lose weight",
    muskelaufbau: "Build muscle",
    ruecken: "Strengthen my back",
    fitness: "Simply get fitter",
    unsicher: "Not sure yet",
  },
  erreichbarkeiten: {
    vormittags: "Morning",
    mittags: "Midday",
    nachmittags: "Afternoon",
    abends: "Evening",
    egal: "Any time",
  },
  // Nicht bloß "Uhr" weggelassen: "8 - 12" ohne Angabe ist im englischen
  // Sprachraum mehrdeutig, weil dort die Zwölfstundenuhr gilt.
  spannen: {
    vormittags: "8 am - 12 pm",
    mittags: "12 - 2 pm",
    nachmittags: "2 - 5 pm",
    abends: "5 - 8 pm",
  },

  pflichtfelder: "Please fill in all required fields.",
  emailUngueltig: "Please enter a valid email address.",
  telefonUngueltig: "Please enter a valid phone number.",
  zielUngueltig: "Please choose what you would like to achieve.",
  erreichbarkeitFehlt: "Please tell us when we can reach you by phone.",
  studioFehlt: "Please choose a studio.",
  terminWeg: "That slot is no longer available. Please pick another time.",
  terminVoll: "That slot has been booked in the meantime. Please pick another time.",
  terminVollZuZweit:
    "There is no longer room for two here. Please pick another time - or come one at a time.",
  schiefgelaufen: "Something went wrong. Please try again later.",
  wartezeit: (sekunden) =>
    `Too many requests. Please try again in ${Math.ceil(sekunden / 60)} minutes.`,
  danke: "Thank you! We have your request and will call you shortly to confirm your trial session.",
  warteliste:
    "That time has just been taken - we have put you on the waiting list and will get in touch as soon as a spot opens up.",
  wartelisteZuZweit:
    "There are no longer two spots free at that time - we have put you on the waiting list and will get in touch as soon as something opens up.",
  terminStudioPasstNicht:
    "That time does not belong to the selected studio. Please choose the time again.",
  codeUnbekannt: (code) =>
    `We do not know the code "${code}". Please check the spelling - or simply leave the field empty.`,
  codeUngueltig: (code) => `The promotion code "${code}" is no longer valid.`,
  codeAbGueltig: (code, datum) => `The promotion code "${code}" is valid from ${datum}.`,
  codeAbgelaufen: (code, datum) => `The promotion code "${code}" expired on ${datum}.`,
};

const WOERTERBUCH: Record<Sprache, Woerterbuch> = { de, en };

export function texte(sprache: Sprache): Woerterbuch {
  return WOERTERBUCH[sprache];
}

export function erreichbarkeitLabel(sprache: Sprache, wert: string): string {
  return texte(sprache).erreichbarkeiten[wert] ?? wert;
}

/**
 * Die Zeitspanne dahinter.
 *
 * Sie ist NICHT sprachneutral, auch wenn es so aussieht: Im Deutschen
 * steht dort "8 - 12 Uhr", im Englischen muss "8 am - 12 pm" stehen. Ohne
 * Zusatz wäre "8 - 12" dort mehrdeutig, weil die Zwölfstundenuhr gilt.
 * Gemessen: Auf der englischen Seite stand vorher "8 - 12 Uhr".
 */
export function spanneLabel(sprache: Sprache, wert: string): string | undefined {
  return texte(sprache).spannen[wert];
}

export function zielLabel(sprache: Sprache, wert: string): string {
  return texte(sprache).ziele[wert] ?? wert;
}
