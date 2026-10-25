/**
 * Die Antworten des Ziel-Checks (außer dem Ziel, das steht in
 * @/lib/ziel-inhalte) und was der Startplan daraus macht.
 */

export type FensterWert = "morgens" | "mittags" | "nachmittags" | "abends" | "flexibel";

export type Fenster = {
  wert: FensterWert;
  label: string;
  spanne: string;
  /** So steht es mitten im Satz ("1× pro Woche, 20 Minuten · nach Feierabend"). */
  imSatz: string | null;
};

export const FENSTER: readonly Fenster[] = [
  { wert: "morgens", label: "Morgens", spanne: "vor 12 Uhr", imSatz: "morgens" },
  { wert: "mittags", label: "Mittags", spanne: "12 - 15 Uhr", imSatz: "mittags" },
  { wert: "nachmittags", label: "Nachmittags", spanne: "15 - 17 Uhr", imSatz: "nachmittags" },
  { wert: "abends", label: "Nach Feierabend", spanne: "ab 17 Uhr", imSatz: "nach Feierabend" },
  { wert: "flexibel", label: "Ist mir egal", spanne: "Hauptsache bald", imSatz: null },
];

export type ErfahrungWert = "keine" | "etwas" | "regelmaessig";

export const ERFAHRUNG: readonly {
  wert: ErfahrungWert;
  label: string;
  /** Was das für den Einstieg heißt - Ablauf, kein Ergebnis. */
  einstieg: string;
}[] = [
  {
    wert: "keine",
    label: "Noch gar keine",
    einstieg:
      "Du startest sanft. Dein Trainer erklärt jede Übung, bevor ihr sie macht, und steigert die Intensität erst, wenn du dich sicher fühlst.",
  },
  {
    wert: "etwas",
    label: "Ein bisschen",
    einstieg:
      "Ihr steigt auf mittlerer Stufe ein. Dein Trainer prüft in der ersten Einheit, was du schon kannst, und baut darauf auf.",
  },
  {
    wert: "regelmaessig",
    label: "Ich trainiere regelmäßig",
    einstieg:
      "Ihr legt zügig los. Dein Trainer stellt die Intensität so ein, dass du einen neuen Reiz bekommst - Muskelgruppe für Muskelgruppe.",
  },
];

/* ------------------------------------------------------------ Englisch */

export const FENSTER_EN: readonly Fenster[] = [
  { wert: "morgens", label: "Mornings", spanne: "before 12 pm", imSatz: "mornings" },
  { wert: "mittags", label: "Midday", spanne: "12 - 3 pm", imSatz: "at midday" },
  { wert: "nachmittags", label: "Afternoons", spanne: "3 - 5 pm", imSatz: "afternoons" },
  { wert: "abends", label: "After work", spanne: "from 5 pm", imSatz: "after work" },
  { wert: "flexibel", label: "I don't mind", spanne: "as soon as possible", imSatz: null },
];

export const ERFAHRUNG_EN: typeof ERFAHRUNG = [
  {
    wert: "keine",
    label: "None at all",
    einstieg:
      "You start gently. Your trainer explains every exercise before you do it and only raises the intensity once you feel confident.",
  },
  {
    wert: "etwas",
    label: "A little",
    einstieg:
      "You start at a medium level. In the first session your trainer checks what you can already do and builds on it.",
  },
  {
    wert: "regelmaessig",
    label: "I train regularly",
    einstieg:
      "You get going quickly. Your trainer sets the intensity so you get a new stimulus - muscle group by muscle group.",
  },
];

export function fensterListe(sprache: "de" | "en"): readonly Fenster[] {
  return sprache === "en" ? FENSTER_EN : FENSTER;
}

export function erfahrungListe(sprache: "de" | "en"): typeof ERFAHRUNG {
  return sprache === "en" ? ERFAHRUNG_EN : ERFAHRUNG;
}
