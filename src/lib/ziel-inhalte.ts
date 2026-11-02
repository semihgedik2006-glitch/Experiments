import type { Sprache } from "@/lib/sprache";
import { GOALS_EN } from "@/lib/ziel-inhalte-en";

/**
 * Was die Startseite zu jedem Ziel sagt.
 *
 * Die Ziele selbst (Wert und Beschriftung) stehen in @/lib/ziel - dieselben
 * wie im Anfrageformular. Wer oben "Rücken stärken" wählt, findet genau das
 * im Formular schon angekreuzt.
 *
 * ZUM WORTLAUT: Beschrieben wird, wie wir mit jemandem an seinem Ziel
 * arbeiten - nicht, was dabei herauskommt. "Nie wieder Rückenschmerzen"
 * oder "fünf Kilo weniger" kann niemand versprechen, und für Werbung rund
 * um Gesundheit ist so ein Satz zusätzlich heikel (siehe auch
 * @/lib/campaigns). Die Sätze unter "erkennst" beschreiben Situationen,
 * keine Diagnosen.
 */

export type ZielWert = "ruecken" | "straffen" | "abnehmen" | "muskelaufbau" | "fitness" | "gelenke";

/** Die acht Zonen der Weste, in dieser Reihenfolge. */
export const ZONEN = [
  "Brust",
  "Bauch",
  "Arme",
  "Schultern",
  "Oberer Rücken",
  "Unterer Rücken",
  "Po",
  "Beine",
] as const;

export const ZONEN_EN = [
  "Chest",
  "Abs",
  "Arms",
  "Shoulders",
  "Upper back",
  "Lower back",
  "Glutes",
  "Legs",
] as const;

export function zonen(sprache: Sprache): readonly string[] {
  return sprache === "en" ? ZONEN_EN : ZONEN;
}

/** Die Abschnitte der Startseite, die sich je Ziel umsortieren lassen. */
export type AbschnittKey =
  | "zielwelt"
  | "auszeichnung"
  | "individuell"
  | "zeit"
  | "ablauf"
  | "reels"
  | "vorteile"
  | "studio"
  | "erfolge"
  | "vertrauen"
  | "blog"
  | "faq";

/**
 * Ohne gewähltes Ziel.
 *
 * Gekürzt von 13 auf 9 Abschnitte (auf dem Handy von 26 auf rund 15
 * Bildschirme): Gelesen werden vor allem die ersten zwei Bildschirme
 * (Nielsen Norman Group, "Scrolling and Attention", 2018), und vier
 * Abschnitte sagten, was anderswo schon stand. "270+ Studios" steht im
 * Zahlenband und auf /studio, "20 Minuten" in Zahlenband, Scroll-Story
 * und Vorteilen, Blog und Instagram sind über das Menü erreichbar.
 */
export const STANDARD_REIHENFOLGE: AbschnittKey[] = [
  "zielwelt",
  "auszeichnung",
  "individuell",
  "ablauf",
  "reels",
  "vorteile",
  "studio",
  "erfolge",
  "vertrauen",
  "faq",
];

export type ZielInhalt = {
  wert: ZielWert;
  /** Die Überschrift im ersten Bildschirm, zweizeilig (zweite Zeile in Lime). */
  titel: [string, string];
  /** Beschriftung der Knöpfe zum Probetermin. */
  knopf: string;
  /**
   * Was für dieses Ziel zuerst zählt. Abschnitte, die hier fehlen, entfallen
   * für dieses Ziel - so wird die Seite für jeden kürzer.
   */
  reihenfolge: AbschnittKey[];
  /** Stichworte, nach denen Fragen und Blogartikel nach vorne rücken. */
  stichworte: string[];
  /**
   * Die eigene Seite unter /ziel/<wert> - für Google ("EMS Rücken Köln")
   * und als Ziel für Werbeanzeigen zu genau diesem Thema.
   */
  seite: {
    titel: string;
    /** "{studios}" wird durch die aktuelle Zahl ersetzt ("14 Studios"). */
    beschreibung: string;
  };
  /** Knopf in der Auswahl. */
  kurz: string;
  /** Ein Satz, der nach der Auswahl im ersten Bildschirm steht. */
  antwort: string;
  /** "Erkennst du dich wieder?" - drei Situationen aus dem Alltag. */
  erkennst: string[];
  /** Wie das Training für dieses Ziel aussieht. */
  soArbeiten: { titel: string; text: string }[];
  /** Schwerpunkt je Zone (0-1) - nur ein Beispiel, eingestellt wird vor Ort. */
  profil: number[];
  /** Ein ehrlicher Satz zum Schluss. */
  hinweis: string;
};

export const ZIEL_INHALTE: readonly ZielInhalt[] = [
  {
    wert: "ruecken",
    seite: {
      titel: "EMS-Training für einen starken Rücken in Köln",
      beschreibung:
        "Rücken stärken mit EMS-Training: 20 Minuten pro Woche, persönlicher Trainer, Schwerpunkt auf Rücken und Rumpf. {studios} in Köln und Umgebung - Probetraining kostenlos.",
    },
    titel: ["Ein Rücken, der deinen", "Tag mitmacht."],
    knopf: "Probetraining für deinen Rücken",
    reihenfolge: ["zielwelt", "auszeichnung", "individuell", "ablauf", "reels", "vorteile", "erfolge", "vertrauen", "faq"],
    stichworte: ["rücken", "gelenk", "beschwerden", "sicher", "geeignet"],
    kurz: "Rücken stärken",
    antwort: "Dein Trainer legt den Schwerpunkt auf Rücken und Rumpf – mit einer Intensität, die zu deinem Rücken passt.",
    erkennst: [
      "Du sitzt den Großteil des Tages – im Büro, im Auto, abends auf dem Sofa.",
      "Abends spürst du deinen Rücken deutlicher als morgens.",
      "Du willst etwas tun, weißt aber nicht genau, was dir guttut.",
    ],
    soArbeiten: [
      { titel: "Rücken und Rumpf im Fokus", text: "Die Impulse erreichen auch tiefliegende Muskeln, die sich mit normalen Übungen schwer gezielt ansteuern lassen." },
      { titel: "Ohne schwere Gewichte", text: "Keine Hantel, keine Zusatzlast auf der Wirbelsäule – nur deine eigene Bewegung plus Impuls." },
      { titel: "Vorsichtig, wo es nötig ist", text: "Der untere Rücken startet sanft. Dein Trainer steigert erst, wenn es sich für dich gut anfühlt." },
    ],
    profil: [0.45, 0.7, 0.4, 0.6, 0.85, 0.6, 0.55, 0.5],
    hinweis: "Hast du akute Beschwerden? Dann klären wir vor dem ersten Training, ob EMS für dich passt.",
  },
  {
    wert: "straffen",
    seite: {
      titel: "EMS-Training zum Straffen und Formen in Köln",
      beschreibung:
        "Straffen und formen mit EMS-Training: Dein Trainer stellt Bauch, Po, Beine und Arme gezielt ein. 20 Minuten pro Woche in {studios} in Köln und Umgebung.",
    },
    titel: ["Mehr Form. Mehr Spannung.", "Mehr du."],
    knopf: "Probetraining für mehr Form",
    reihenfolge: ["zielwelt", "auszeichnung", "individuell", "erfolge", "ablauf", "reels", "vorteile", "studio", "faq"],
    stichworte: ["ergebnis", "straff", "definier", "muskel", "form"],
    kurz: "Straffen und formen",
    antwort: "Dein Trainer setzt die Intensität dort höher, wo du mehr Spannung und Form willst – Bauch, Po, Beine oder Arme.",
    erkennst: [
      "Du fühlst dich in deinem Körper nicht mehr ganz zu Hause.",
      "Bestimmte Stellen stören dich – und du weißt genau, welche.",
      "Du willst definierter aussehen, ohne dein Leben umzukrempeln.",
    ],
    soArbeiten: [
      { titel: "Deine Zonen zuerst", text: "Du sagst, was dich stört. Dein Trainer stellt genau diese Muskelgruppen kräftiger ein." },
      { titel: "Viel Muskel in kurzer Zeit", text: "Viele Muskelgruppen arbeiten gleichzeitig – in 20 Minuten Training pro Woche." },
      { titel: "Mit dir mitwachsend", text: "Wird es leichter, wird es intensiver. Dein Trainer passt die Einstellung bei jeder Einheit an." },
    ],
    profil: [0.55, 0.85, 0.75, 0.5, 0.5, 0.45, 0.9, 0.85],
    hinweis: "Wie schnell du Veränderungen siehst, hängt auch von Ernährung und Alltag ab. Dein Trainer spricht beides mit dir durch.",
  },
  {
    wert: "abnehmen",
    seite: {
      titel: "Abnehmen mit EMS-Training in Köln",
      beschreibung:
        "Abnehmen mit EMS-Training: ein fester Termin pro Woche, ein Trainer, der mit dir dranbleibt, auf Wunsch Ernährungsberatung. {studios} in Köln und Umgebung.",
    },
    titel: ["Dranbleiben war noch", "nie so einfach."],
    knopf: "Probetraining zum Abnehmen",
    reihenfolge: ["zielwelt", "auszeichnung", "zeit", "individuell", "erfolge", "ablauf", "reels", "vorteile", "faq"],
    stichworte: ["abnehm", "ernährung", "ergebnis", "kosten"],
    kurz: "Abnehmen",
    antwort: "Ein fester Termin, ein Trainer, der dich erwartet – und auf Wunsch Ernährungsberatung dazu.",
    erkennst: [
      "Du hast schon einiges probiert und bist nie lange drangeblieben.",
      "Dir fehlt nicht der Wille, sondern Zeit – und jemand, der mit dir dranbleibt.",
      "Du willst dich wieder wohler fühlen, in deiner Kleidung und in Bewegung.",
    ],
    soArbeiten: [
      { titel: "Dranbleiben leicht gemacht", text: "Ein fester Termin pro Woche und ein Trainer, der dich kennt. Wer erwartet wird, kommt." },
      { titel: "Großer Muskeleinsatz", text: "Viele große Muskelgruppen arbeiten gleichzeitig – Beine, Po, Rücken, Bauch." },
      { titel: "Ernährung auf Wunsch", text: "Abnehmen entscheidet sich auch in der Küche. Wenn du willst, beraten wir dich auch dabei." },
    ],
    profil: [0.6, 0.7, 0.55, 0.55, 0.65, 0.55, 0.85, 0.9],
    hinweis: "Wir versprechen keine Kilos. Wir versprechen, dass du nicht allein dranbleiben musst.",
  },
  {
    wert: "muskelaufbau",
    seite: {
      titel: "Muskelaufbau mit EMS-Training in Köln",
      beschreibung:
        "Muskeln aufbauen mit EMS-Training: jede Muskelgruppe einzeln eingestellt, saubere Ausführung mit Trainer, 20 Minuten pro Woche. {studios} in Köln und Umgebung.",
    },
    titel: ["Stärker werden,", "Woche für Woche."],
    knopf: "Probetraining für mehr Kraft",
    reihenfolge: ["zielwelt", "auszeichnung", "individuell", "ablauf", "reels", "vorteile", "erfolge", "studio", "faq"],
    stichworte: ["muskel", "oft", "ergebnis", "anfänger"],
    kurz: "Muskeln aufbauen",
    antwort: "Dein Trainer stellt jede Muskelgruppe einzeln ein und steigert die Intensität mit dir – Woche für Woche.",
    erkennst: [
      "Du willst kräftiger werden, hast aber wenig Erfahrung mit Krafttraining.",
      "Du willst es richtig machen und nicht nach Gefühl trainieren.",
      "Du willst Kraft für den Alltag – Tragen, Heben, Treppen, Kinder.",
    ],
    soArbeiten: [
      { titel: "Jede Muskelgruppe einzeln", text: "Acht Zonen, acht Einstellungen. Dein Trainer gibt Gas, wo du stärker werden willst." },
      { titel: "Saubere Ausführung", text: "Er steht neben dir und achtet auf jede Bewegung – vom ersten Training an." },
      { titel: "Steigerung mit Plan", text: "Mit jeder Einheit wird nachjustiert. So bleibt der Reiz für deine Muskeln hoch." },
    ],
    profil: [0.85, 0.7, 0.85, 0.8, 0.75, 0.55, 0.8, 0.85],
    hinweis: "Muskeln wachsen in der Erholung. Deshalb plant dein Trainer zwischen zwei Einheiten genug Pause ein.",
  },
  {
    wert: "fitness",
    seite: {
      titel: "Fitter im Alltag mit EMS-Training in Köln",
      beschreibung:
        "Fitter im Alltag mit EMS-Training: 20 Minuten pro Woche, ganzer Körper, dein Trainer plant alles. {studios} in Köln und Umgebung - jetzt kostenlos testen.",
    },
    titel: ["Treppen, Einkäufe, Kinder –", "wieder leicht."],
    knopf: "Probetraining für mehr Fitness",
    reihenfolge: ["zielwelt", "auszeichnung", "zeit", "ablauf", "reels", "vorteile", "individuell", "studio", "faq"],
    stichworte: ["oft", "anfänger", "zeit", "berufstätig", "mitbringen"],
    kurz: "Fitter im Alltag",
    antwort: "Einmal pro Woche 20 Minuten, alles eingestellt von deinem Trainer – damit du dich im Alltag wieder leichter fühlst.",
    erkennst: [
      "Treppen, Einkäufe, Kinder tragen – alles fühlt sich anstrengender an als früher.",
      "Du willst etwas für dich tun, aber dein Kalender ist voll.",
      "Du suchst etwas, das du wirklich durchhältst.",
    ],
    soArbeiten: [
      { titel: "Ganzer Körper, eine Einheit", text: "Alle acht Zonen arbeiten gleichzeitig – ausgewogen eingestellt für deinen Alltag." },
      { titel: "Passt in jede Woche", text: "20 Minuten Training, ein fester Termin, Studios in ganz Köln und Umgebung." },
      { titel: "Du musst nichts planen", text: "Dein Trainer weiß, wo ihr steht, und stellt alles ein. Du kommst und trainierst." },
    ],
    profil: [0.65, 0.65, 0.6, 0.65, 0.65, 0.55, 0.7, 0.7],
    hinweis: "Du weißt noch nicht genau, was dein Ziel ist? Auch das klärt dein Trainer im Probetraining mit dir.",

  },
  {
    // Wunsch Marcel (22.10.): Gelenke als eigenes Ziel - gerade für die
    // Zielgruppe ab 40. Beschrieben wird, WIE trainiert wird (ohne Last
    // auf den Gelenken), nicht dass Beschwerden verschwinden.
    wert: "gelenke",
    seite: {
      titel: "Gelenkschonendes EMS-Training in Köln",
      beschreibung:
        "Gelenkschonend trainieren mit EMS: ohne schwere Gewichte, ohne Sprünge, mit persönlichem Trainer und 20 Minuten pro Woche. {studios} in Köln und Umgebung - jetzt kostenlos testen.",
    },
    titel: ["Kräftig werden,", "ohne Last auf den Gelenken."],
    knopf: "Probetraining gelenkschonend",
    reihenfolge: ["zielwelt", "auszeichnung", "individuell", "vorteile", "ablauf", "reels", "studio", "vertrauen", "faq"],
    stichworte: ["gelenk", "knie", "hüft", "sicher", "geeignet", "beschwerde", "gewicht"],
    kurz: "Gelenke schonen",
    antwort: "Kein Gewicht, keine Sprünge: Dein Trainer kräftigt die Muskeln rund um deine Gelenke – mit Bewegungen, die sich für dich gut anfühlen.",
    erkennst: [
      "Knie oder Hüfte melden sich, wenn du an Hanteln oder Joggen denkst.",
      "Du willst kräftiger werden, aber deine Gelenke nicht zusätzlich belasten.",
      "Du bist über 40 und suchst ein Training, das zu deinem Körper passt.",
    ],
    soArbeiten: [
      { titel: "Ohne Zusatzlast", text: "Keine Hantel, keine Sprünge. Die Muskeln arbeiten über den Impuls – die Gelenke tragen kein Extragewicht." },
      { titel: "Muskeln, die stützen", text: "Beine, Po und Rumpf werden gezielt eingestellt – die Muskulatur, die deine Gelenke im Alltag führt." },
      { titel: "Langsam gesteigert", text: "Dein Trainer startet sanft und steigert erst, wenn es sich für dich gut anfühlt." },
    ],
    profil: [0.55, 0.7, 0.55, 0.6, 0.65, 0.6, 0.85, 0.9],
    hinweis: "Hast du Arthrose, ein künstliches Gelenk oder akute Beschwerden? Dann klär das Training bitte vorher mit deinem Arzt ab – im Gesundheitscheck fragt dein Trainer ohnehin danach.",
  },
];

/**
 * Dieselben Ziele auf Englisch. Reihenfolge der Abschnitte und das
 * Zonenprofil sind dieselben - übersetzt sind nur die Texte (und die
 * Stichworte, weil Fragen und Artikel auf /en englisch sind).
 */
export const ZIEL_INHALTE_EN: readonly ZielInhalt[] = ZIEL_INHALTE.map((de) => {
  const en = GOALS_EN.find((g) => g.wert === de.wert);
  if (!en) return de;
  return { ...de, ...en, reihenfolge: en.reihenfolge ?? de.reihenfolge };
});

export function zielInhalte(sprache: Sprache): readonly ZielInhalt[] {
  return sprache === "en" ? ZIEL_INHALTE_EN : ZIEL_INHALTE;
}

export function zielInhalt(
  wert: string | null | undefined,
  sprache: Sprache = "de",
): ZielInhalt | undefined {
  return zielInhalte(sprache).find((z) => z.wert === wert);
}

/**
 * Wie gut passt ein Text zu einem Ziel? Zählt die Stichworte, mit denen
 * ein Wort im Text BEGINNT - "abnehm" findet "Abnehmen", "form" findet
 * "Form" und "formen", aber nicht "Körperformen"; "sicher" findet nicht
 * "unsicher". Ein einfaches "kommt irgendwo vor" machte "form" zum
 * Treffer in fast jedem Text, weil der Markenname es enthält.
 */
export function passung(text: string, ziel: ZielInhalt | undefined): number {
  if (!ziel) return 0;
  const klein = text.toLowerCase();
  return ziel.stichworte.filter((wort) => new RegExp(`(^|[^a-zäöüß])${wort}`).test(klein)).length;
}

/** Stabil nach Passung sortieren - Gleichstand behält die alte Reihenfolge. */
export function nachZiel<T>(liste: T[], text: (eintrag: T) => string, ziel: ZielInhalt | undefined): T[] {
  if (!ziel) return liste;
  return liste
    .map((eintrag, i) => ({ eintrag, i, p: passung(text(eintrag), ziel) }))
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .map((x) => x.eintrag);
}

/** Die Seitenbeschreibung mit der aktuellen Zahl der Studios. */
export function seitenBeschreibung(ziel: ZielInhalt, anzahlStudios: number, sprache: Sprache = "de"): string {
  const wort = sprache === "en" ? "studios" : "Studios";
  const studios = anzahlStudios > 1 ? `${anzahlStudios} ${wort}` : wort;
  return ziel.seite.beschreibung.replace("{studios}", studios);
}
