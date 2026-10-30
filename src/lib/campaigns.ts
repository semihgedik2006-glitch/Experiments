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

import type { ZielWert } from "@/lib/ziel-inhalte";
import type { ToggleKey } from "@/lib/site-toggles";

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
  /**
   * Das Ziel dieser Kampagne (@/lib/ziel-inhalte). Die Seite zeigt dann
   * das passende Motiv und "Erkennst du dich wieder?", und das Ziel ist
   * im Formular schon angekreuzt.
   */
  ziel?: ZielWert;
  /**
   * Schalter im Adminbereich, ohne den die Seite noch nicht öffentlich ist
   * (siehe @/lib/vorschau) - für vorbereitete Aktionen wie "neues-jahr".
   */
  schalter?: ToggleKey;
};

// Keine Vergleiche mit anderen Trainingsformen und keine Wirkversprechen
// ("sichtbare Ergebnisse", "mehr Grundumsatz") - wie auf der übrigen Seite.
export const campaigns: Record<string, Campaign> = {
  probetraining: {
    kicker: "Kostenlos & unverbindlich",
    headline: "20 Minuten pro Woche.",
    highlight: "Auf dich eingestellt.",
    subline:
      "Probier EMS-Training kostenlos aus - mit persönlicher Betreuung. Danach zeigt dir dein Trainer, welche Mitgliedschaft zu deinem Ziel passt.",
    bullets: [
      "Ein fester Termin pro Woche, 20 Minuten Training",
      "Bei jeder Einheit ein Trainer an deiner Seite",
      "Ohne schwere Gewichte - auch für Einsteiger",
    ],
    formTitle: "Sichere dir deinen Termin",
    metaTitle: "Kostenloses EMS-Probetraining",
    metaDescription:
      "Teste EMS-Training kostenlos und unverbindlich. 20 Minuten pro Woche, persönlich betreut. Jetzt Wunschtermin sichern.",
  },

  // Die Adresse bleibt "rueckenschmerzen": Laufende Anzeigen verlinken sie.
  rueckenschmerzen: {
    ziel: "ruecken",
    kicker: "Für alle, die viel sitzen",
    headline: "Etwas tun für einen",
    highlight: "starken Rücken",
    subline:
      "EMS erreicht auch die tiefliegende Rumpfmuskulatur, die sich mit normalen Übungen schwer gezielt ansteuern lässt. Dein Trainer stellt die Intensität auf deinen Rücken ein.",
    bullets: [
      "Schwerpunkt auf Rücken und Rumpf",
      "Ohne schwere Gewichte - keine Zusatzlast auf der Wirbelsäule",
      "Kostenloses Probetraining, danach entscheidest du",
    ],
    formTitle: "Kostenlos ausprobieren",
    metaTitle: "EMS-Training für einen starken Rücken - kostenloses Probetraining",
    metaDescription:
      "Viel Sitzen, wenig Zeit? EMS-Training mit Schwerpunkt auf Rücken und Rumpf, persönlich betreut. Jetzt kostenlos und unverbindlich testen.",
  },

  straffen: {
    ziel: "straffen",
    kicker: "Für mehr Form und Spannung",
    headline: "Straffen und formen -",
    highlight: "genau da, wo du willst",
    subline:
      "Du sagst, welche Stellen dich stören. Dein Trainer stellt Bauch, Po, Beine oder Arme gezielt kräftiger ein - in 20 Minuten pro Woche.",
    bullets: [
      "Intensität je Muskelgruppe auf dich eingestellt",
      "Viele Muskelgruppen gleichzeitig in einer Einheit",
      "Kostenloses Probetraining, danach entscheidest du",
    ],
    formTitle: "Kostenlos ausprobieren",
    metaTitle: "Straffen und formen mit EMS - kostenloses Probetraining",
    metaDescription:
      "Straffen und formen mit EMS-Training: dein Trainer stellt Bauch, Po, Beine und Arme gezielt ein. 20 Minuten pro Woche. Jetzt kostenlos testen.",
  },

  abnehmen: {
    ziel: "abnehmen",
    kicker: "Für alle, denen die Zeit fehlt",
    headline: "Abnehmen, ohne dass",
    highlight: "der Kalender platzt",
    subline:
      "Ein fester Termin pro Woche, ein Trainer, der mit dir dranbleibt - und auf Wunsch Ernährungsberatung. Viele große Muskelgruppen arbeiten dabei gleichzeitig.",
    bullets: [
      "Eine Einheit pro Woche, 20 Minuten Training",
      "Trainingsplan und auf Wunsch Ernährungsberatung",
      "Kostenloses Probetraining, danach entscheidest du in Ruhe",
    ],
    formTitle: "Kostenlos ausprobieren",
    metaTitle: "Abnehmen mit EMS-Training - kostenloses Probetraining",
    metaDescription:
      "Abnehmen mit wenig Zeit: ein fester EMS-Termin pro Woche, persönlich betreut, auf Wunsch mit Ernährungsberatung. Jetzt kostenlos testen.",
  },

  muskelaufbau: {
    ziel: "muskelaufbau",
    kicker: "Für mehr Kraft",
    headline: "Muskeln aufbauen mit",
    highlight: "20 Minuten pro Woche",
    subline:
      "Dein Trainer stellt jede Muskelgruppe einzeln ein und steigert die Intensität mit dir. Die Impulse erreichen auch tiefliegende Muskelschichten.",
    bullets: [
      "Jede Muskelgruppe einzeln eingestellt",
      "Ohne schwere Gewichte, saubere Ausführung mit Trainer",
      "Kostenloses Probetraining, danach entscheidest du",
    ],
    formTitle: "Sichere dir deinen Termin",
    metaTitle: "Muskelaufbau mit EMS - kostenloses Probetraining",
    metaDescription:
      "Muskelaufbau mit EMS: jede Muskelgruppe einzeln eingestellt, persönlich betreut, 20 Minuten pro Woche. Jetzt kostenlos testen.",
  },

  wiedereinstieg: {
    ziel: "fitness",
    kicker: "Für alle nach einer langen Pause",
    headline: "Wieder anfangen,",
    highlight: "ohne sich zu überfordern",
    subline:
      "Lange nichts gemacht? Das Training startet auf deinem Niveau und wächst mit. Die Stärke des Impulses stellt dein Trainer ein - nicht du und nicht ein Gerät.",
    bullets: [
      "Beginnt auf deinem Level, nicht auf einem Standardprogramm",
      "Ohne schwere Gewichte, auch nach längerer Pause",
      "Erst kostenlos testen, dann die passende Mitgliedschaft wählen",
    ],
    formTitle: "Kostenlos wieder einsteigen",
    metaTitle: "Wiedereinstieg ins Training mit EMS - kostenlos testen",
    metaDescription:
      "Nach langer Pause wieder anfangen: EMS-Training startet auf deinem Niveau, ohne schwere Gewichte und persönlich betreut. Jetzt kostenloses Probetraining sichern.",
  },

  // Für Januar vorbereitet - öffentlich erst, wenn im Adminbereich unter
  // "Sichtbarkeit" die Aktion "Neues Jahr" eingeschaltet ist. Einen
  // Aktionscode dazu legt ihr unter "Aktionen" an (z. B. NEUJAHR27) und
  // schreibt ihn in die Anzeige: Dann zeigt die Auswertung, was sie bringt.
  "neues-jahr": {
    schalter: "aktion-neues-jahr",
    kicker: "Neues Jahr, neuer Rhythmus",
    headline: "Ein Vorsatz, der",
    highlight: "in deinen Kalender passt",
    subline:
      "Ein Termin pro Woche, 20 Minuten Training, ein Trainer an deiner Seite. Starte mit einem kostenlosen Probetraining - danach entscheidest du in Ruhe.",
    bullets: [
      "Ein fester Termin pro Woche statt eines Plans, der im Februar endet",
      "Bei jeder Einheit ein Trainer, der die Intensität mit dir einstellt",
      "Kostenlos und unverbindlich ausprobieren",
    ],
    formTitle: "Dein Probetraining fürs neue Jahr",
    metaTitle: "Neues Jahr, neuer Rhythmus - EMS-Probetraining kostenlos",
    metaDescription:
      "Ein Vorsatz, der in den Kalender passt: 20 Minuten EMS-Training pro Woche, persönlich betreut. Jetzt kostenloses Probetraining anfragen.",
  },

  "zu-zweit": {
    kicker: "Zusammen ist es leichter",
    headline: "Probetraining",
    highlight: "zu zweit",
    subline:
      "Der erste Termin fällt zu zweit leichter. Sag im Formular einfach Bescheid, dann reservieren wir zwei Plätze.",
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
