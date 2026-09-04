/**
 * Kampagnen-Landingpages für bezahlte Werbung (Instagram, Google Ads).
 *
 * Bewusst schlank gehalten: eine Seite, ein Ziel. Keine Navigation, keine
 * Ablenkung - wer über eine Anzeige kommt, soll buchen oder gar nichts tun.
 *
 * Neue Kampagne anlegen: hier einen Eintrag ergänzen. Der Schlüssel wird
 * zur Adresse, z.B. "probetraining" -> /aktion/probetraining
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
      "Immer 1:1 betreut - kein Training auf eigene Faust",
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
};

export function getCampaign(slug: string): Campaign | null {
  return campaigns[slug] ?? null;
}

export function getCampaignSlugs(): string[] {
  return Object.keys(campaigns);
}
