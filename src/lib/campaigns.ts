/**
 * Kampagnen-Landingpages für bezahlte Werbung (Instagram, Google Ads).
 *
 * Bewusst schlank gehalten: eine Seite, ein Ziel. Keine Navigation, keine
 * Ablenkung - wer über eine Anzeige kommt, soll buchen oder gar nichts tun.
 *
 * Neue Kampagne anlegen: hier einen Eintrag ergänzen. Der Schlüssel wird
 * zur Adresse, z.B. "probetraining" -> /aktion/probetraining
 *
 * DIE AUSWAHL FOLGT DEN ZIELEN AUS DEM ANFRAGEFORMULAR (siehe
 * src/lib/ziel.ts). Wer über eine Anzeige zum Thema Rücken kommt und im
 * Formular "Rücken stärken" auswählt, erzeugt damit eine Anfrage, deren
 * Herkunft und Ziel zusammenpassen - und am Monatsende steht in der
 * Auswertung, welches Thema tatsächlich Anfragen bringt. Eine Kampagne zu
 * einem Ziel, das im Formular nicht vorkommt, wäre dagegen nach dem Klick
 * nicht mehr nachvollziehbar.
 *
 * ZUM WORTLAUT: Versprochen wird die Trainingsmethode, nicht ein Ergebnis.
 * "Fünf Kilo in vier Wochen" wäre eine Zahl, die niemand halten kann, und
 * für Werbung eines Gesundheitsanbieters zusätzlich heikel. Was hier steht,
 * muss auch im Studio noch stimmen.
 */

export type Campaign = {
  /** Kleiner Hinweis über der Überschrift. */
  kicker: string;
  /** Hauptversprechen. Der Teil in geschweiften Klammern wird grün. */
  headline: string;
  highlight: string;
  /** Ein bis zwei Sätze, die das Versprechen erklären. */
  subline: string;
  /** Drei knappe Argumente. */
  bullets: string[];
  /** Überschrift über dem Formular. */
  formTitle: string;
  /** Titel und Beschreibung für Suchmaschinen und geteilte Links. */
  metaTitle: string;
  metaDescription: string;
};

export const campaigns: Record<string, Campaign> = {
  probetraining: {
    kicker: "Kostenlos & unverbindlich",
    headline: "20 Minuten, die",
    highlight: "alles verändern",
    subline:
      "Probier EMS-Training kostenlos aus - mit persönlicher Betreuung, ohne Vertrag und ohne Verpflichtung. Danach entscheidest du in Ruhe.",
    bullets: [
      "Nur 20 Minuten pro Woche statt stundenlang im Fitnessstudio",
      "Immer persönlich betreut - kein Training auf eigene Faust",
      "Gelenkschonend und auch für Wiedereinsteiger geeignet",
    ],
    formTitle: "Sichere dir deinen Termin",
    metaTitle: "Kostenloses EMS-Probetraining",
    metaDescription:
      "Teste EMS-Training kostenlos und unverbindlich. 20 Minuten pro Woche, persönlich betreut. Jetzt Wunschtermin sichern.",
  },

  rueckenschmerzen: {
    kicker: "Für alle mit Büro-Rücken",
    headline: "Endlich wieder",
    highlight: "schmerzfrei sitzen",
    subline:
      "EMS erreicht die tiefe Rumpfmuskulatur, die beim klassischen Training kaum angesprochen wird - genau die Muskeln, die deinen Rücken stützen.",
    bullets: [
      "Trainiert gezielt die tiefliegende Stützmuskulatur",
      "Ohne schwere Gewichte, dadurch gelenkschonend",
      "Kostenloses Probetraining, danach entscheidest du",
    ],
    formTitle: "Kostenlos ausprobieren",
    metaTitle: "EMS gegen Rückenschmerzen - kostenloses Probetraining",
    metaDescription:
      "Rückenschmerzen vom Bürojob? EMS-Training stärkt die tiefe Rumpfmuskulatur. Jetzt kostenlos und unverbindlich testen.",
  },

  abnehmen: {
    kicker: "Für alle, denen die Zeit fehlt",
    headline: "Abnehmen, ohne dass",
    highlight: "der Kalender platzt",
    subline:
      "EMS aktiviert bis zu 90 Prozent der Muskelfasern gleichzeitig - auch die tiefliegenden. Mehr Muskulatur heißt mehr Grundumsatz, und der arbeitet auch dann, wenn du nicht trainierst.",
    bullets: [
      "Eine Einheit pro Woche, 20 Minuten - mehr braucht es nicht",
      "Trainingsplan und Ernährungsberatung passend zu deinem Alltag",
      "Kostenloses Probetraining, danach entscheidest du in Ruhe",
    ],
    formTitle: "Kostenlos ausprobieren",
    metaTitle: "Abnehmen mit EMS-Training - kostenloses Probetraining",
    metaDescription:
      "Abnehmen mit wenig Zeit: EMS-Training baut Muskulatur auf und erhöht den Grundumsatz. 20 Minuten pro Woche, persönlich betreut. Jetzt kostenlos testen.",
  },

  muskelaufbau: {
    kicker: "Für sichtbare Ergebnisse",
    headline: "Muskeln aufbauen in",
    highlight: "20 Minuten pro Woche",
    subline:
      "Der elektrische Impuls erreicht auch die tiefen Muskelschichten, an die klassisches Training kaum herankommt - bei deutlich weniger Belastung für Gelenke und Sehnen.",
    bullets: [
      "Erreicht auch die tiefliegenden Schichten",
      "Ohne schwere Gewichte, dadurch gelenkschonend",
      "Immer persönlich betreut - die Einstellung wird an dich angepasst",
    ],
    formTitle: "Sichere dir deinen Termin",
    metaTitle: "Muskelaufbau mit EMS - kostenloses Probetraining",
    metaDescription:
      "Muskelaufbau ohne stundenlanges Training: EMS erreicht auch die tiefen Muskelschichten. 20 Minuten pro Woche, persönlich betreut. Jetzt kostenlos testen.",
  },

  wiedereinstieg: {
    kicker: "Für alle nach einer langen Pause",
    headline: "Wieder anfangen,",
    highlight: "ohne sich zu überfordern",
    subline:
      "Lange nichts gemacht? Das Training startet auf deinem Niveau und wächst mit. Die Stärke des Impulses stellt dein Trainer ein - nicht du und nicht ein Gerät.",
    bullets: [
      "Beginnt auf deinem Level, nicht auf einem Standardprogramm",
      "Gelenkschonend, auch nach längerer Pause",
      "Kein Abo beim Probetraining - du testest erst einmal nur",
    ],
    formTitle: "Kostenlos wieder einsteigen",
    metaTitle: "Wiedereinstieg ins Training mit EMS - kostenlos testen",
    metaDescription:
      "Nach langer Pause wieder anfangen: EMS-Training startet auf deinem Niveau, gelenkschonend und persönlich betreut. Jetzt kostenloses Probetraining sichern.",
  },

  "zu-zweit": {
    kicker: "Zusammen ist es leichter",
    headline: "Probetraining",
    highlight: "zu zweit",
    subline:
      "Der erste Termin fällt zu zweit deutlich leichter - und wer zusammen anfängt, bleibt erfahrungsgemäß auch eher dabei. Sag im Formular einfach Bescheid, dann reservieren wir zwei Plätze.",
    bullets: [
      "Zwei Plätze im selben Termin, mit einem Trainer für euch beide",
      "Für beide kostenlos und unverbindlich",
      "20 Minuten - danach habt ihr beide eine Meinung dazu",
    ],
    formTitle: "Termin für zwei sichern",
    metaTitle: "EMS-Probetraining zu zweit - kostenlos für beide",
    metaDescription:
      "Zusammen zum Probetraining: zwei Plätze im selben Termin, ein Trainer, für beide kostenlos und unverbindlich. Jetzt Wunschtermin sichern.",
  },
};

export function getCampaign(slug: string): Campaign | null {
  return campaigns[slug] ?? null;
}

export function getCampaignSlugs(): string[] {
  return Object.keys(campaigns);
}
