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

export type ZielWert = "ruecken" | "straffen" | "abnehmen" | "muskelaufbau" | "fitness";

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

export type ZielInhalt = {
  wert: ZielWert;
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
    kurz: "Fitter im Alltag",
    antwort: "Einmal pro Woche 20 Minuten, alles eingestellt von deinem Trainer – damit du dich im Alltag wieder leichter fühlst.",
    erkennst: [
      "Treppen, Einkäufe, Kinder tragen – alles fühlt sich anstrengender an als früher.",
      "Du willst etwas für dich tun, aber dein Kalender ist voll.",
      "Du suchst etwas, das du wirklich durchhältst.",
    ],
    soArbeiten: [
      { titel: "Ganzer Körper, eine Einheit", text: "Alle acht Zonen arbeiten gleichzeitig – ausgewogen eingestellt für deinen Alltag." },
      { titel: "Passt in jede Woche", text: "20 Minuten Training, ein fester Termin, 14 Studios in Köln und Umgebung." },
      { titel: "Du musst nichts planen", text: "Dein Trainer weiß, wo ihr steht, und stellt alles ein. Du kommst und trainierst." },
    ],
    profil: [0.65, 0.65, 0.6, 0.65, 0.65, 0.55, 0.7, 0.7],
    hinweis: "Du weißt noch nicht genau, was dein Ziel ist? Auch das klärt dein Trainer im Probetraining mit dir.",
  },
];

export function zielInhalt(wert: string | null | undefined): ZielInhalt | undefined {
  return ZIEL_INHALTE.find((z) => z.wert === wert);
}
