/**
 * Kennzahlen - welche Zahlen je Monat erfasst werden.
 *
 * Die ersten drei stehen in LogX unter Statistik -> Kennzahlen
 * (Monatsansicht) und werden von dort abgeschrieben. Die übrigen zählt
 * das Studio selbst, auf der Strichliste der Wochenroutine.
 */

export const KENNZAHL_FELDER = [
  { feld: "mitglieder", label: "Mitglieder", quelle: "LogX", hinweis: "Stand am Monatsende" },
  { feld: "zugaenge", label: "Zugänge", quelle: "LogX", hinweis: "neue Mitgliedschaften" },
  { feld: "kuendigungen", label: "Kündigungen", quelle: "LogX", hinweis: "nach Eingangsdatum" },
  { feld: "pausen", label: "Pausen statt Kündigung", quelle: "Strichliste", hinweis: "" },
  { feld: "gespraeche", label: "Gespräche geführt", quelle: "Strichliste", hinweis: "" },
  { feld: "zusatzverkaeufe", label: "Zusatzverkäufe", quelle: "Strichliste", hinweis: "Extra-Einheiten, Outfit, Partner" },
] as const;

export type KennzahlFeld = (typeof KENNZAHL_FELDER)[number]["feld"];

/** Der Monatserste als Datum, aus "2026-11". */
export function monatAusText(text: string): Date | null {
  const treffer = /^(\d{4})-(\d{2})$/.exec(text);
  if (!treffer) return null;
  const monat = Number(treffer[2]);
  if (monat < 1 || monat > 12) return null;
  return new Date(Date.UTC(Number(treffer[1]), monat - 1, 1));
}

export function monatAlsText(datum: Date): string {
  return datum.toISOString().slice(0, 7);
}

export function monatName(datum: Date): string {
  return new Intl.DateTimeFormat("de-DE", { month: "short", year: "2-digit", timeZone: "UTC" }).format(
    datum,
  );
}

/** Die letzten n Monate bis einschließlich des aktuellen, älteste zuerst. */
export function letzteMonate(n: number, heute = new Date()): Date[] {
  return Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(heute.getUTCFullYear(), heute.getUTCMonth() - (n - 1 - i), 1)),
  );
}

/** Durchschnitt ohne leere Werte - null, wenn es keinen gibt. */
export function schnitt(werte: (number | null | undefined)[]): number | null {
  const da = werte.filter((w): w is number => typeof w === "number");
  if (da.length === 0) return null;
  return da.reduce((a, b) => a + b, 0) / da.length;
}

/** Kündigungsquote in Prozent des Bestands. */
export function quote(kuendigungen: number | null, mitglieder: number | null): number | null {
  if (kuendigungen === null || !mitglieder) return null;
  return (kuendigungen / mitglieder) * 100;
}
