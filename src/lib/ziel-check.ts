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

/** In welches Zeitfenster fällt ein Termin ("17:30")? */
export function fensterVon(startTime: string): Exclude<FensterWert, "flexibel"> {
  const stunde = Number(startTime.split(":")[0]);
  if (stunde < 12) return "morgens";
  if (stunde < 15) return "mittags";
  if (stunde < 17) return "nachmittags";
  return "abends";
}

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
