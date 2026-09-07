/**
 * Hilfsmittel für die Listen im Adminbereich: Suche, Filter, Seitenaufteilung.
 *
 * Alle drei laufen über die Adresszeile statt über Zustand im Browser. Das
 * hat drei praktische Folgen: Eine gefilterte Liste lässt sich als Lesezeichen
 * ablegen oder weiterschicken, der Zurück-Knopf tut das Erwartete, und die
 * Seiten bleiben Server-Komponenten - es wird also nur geladen, was auch
 * angezeigt wird.
 */

/** Einträge pro Seite. Genug, um zu überblicken, wenig genug zum Laden. */
export const PRO_SEITE = 25;

export type SuchParams = Record<string, string | string[] | undefined>;

/** Liest einen einzelnen Wert; Mehrfachangaben werden auf den ersten gekürzt. */
export function param(params: SuchParams, key: string): string {
  const wert = params[key];
  const roh = Array.isArray(wert) ? wert[0] : wert;
  return (roh ?? "").trim();
}

/**
 * Seitenzahl aus der Adresse. Alles Unsinnige wird zu Seite 1 - eine
 * Adresse wie ?seite=-3 oder ?seite=abc darf keine leere Liste ergeben.
 */
export function seitenZahl(params: SuchParams): number {
  const n = Number.parseInt(param(params, "seite"), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Baut eine Adresse mit geänderten Werten und behält den Rest.
 * Leere Werte fallen raus, damit keine Adressen wie ?q=&status= entstehen.
 *
 * Wird ein anderer Wert als die Seite geändert, springt die Ansicht auf
 * Seite 1 zurück - sonst landet man nach dem Filtern auf Seite 4 einer
 * Liste, die nur noch zwei Seiten hat, und sieht nichts.
 */
export function mitParams(
  /** Pfad der Seite, z.B. "/admin/bookings". */
  basis: string,
  params: SuchParams,
  aenderungen: Record<string, string | number | undefined>,
): string {
  const such = new URLSearchParams();

  for (const [key, wert] of Object.entries(params)) {
    const roh = Array.isArray(wert) ? wert[0] : wert;
    if (roh) such.set(key, roh);
  }

  const nurSeite = Object.keys(aenderungen).every((key) => key === "seite");
  if (!nurSeite) such.delete("seite");

  for (const [key, wert] of Object.entries(aenderungen)) {
    const text = wert === undefined ? "" : String(wert);
    // Der Standardwert fällt aus der Adresse: kein Wert, oder Seite 1 -
    // ?seite=1 und ?seite=0 wären beide dieselbe erste Seite, stünden aber
    // als eigene Adressen da.
    const istStandard = !text || (key === "seite" && Number(text) < 2);
    if (istStandard) such.delete(key);
    else such.set(key, text);
  }

  const query = such.toString();
  // Der Pfad muss mit: Ein href von "" zeigt auf die aktuelle Adresse
  // samt Suchteil - der Zurück-Link auf Seite 2 hätte also wieder auf
  // Seite 2 geführt.
  return query ? `${basis}?${query}` : basis;
}

/**
 * Sucht einen Text in mehreren Feldern - "enthält", Groß- und
 * Kleinschreibung egal. Ohne Suchbegriff wird kein Filter gesetzt.
 */
export function suchFilter<T extends string>(
  begriff: string,
  felder: readonly T[],
): { OR: Array<Record<T, { contains: string; mode: "insensitive" }>> } | undefined {
  if (!begriff) return undefined;
  return {
    OR: felder.map(
      (feld) =>
        ({ [feld]: { contains: begriff, mode: "insensitive" } }) as Record<
          T,
          { contains: string; mode: "insensitive" }
        >,
    ),
  };
}
