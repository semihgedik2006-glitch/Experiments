/**
 * Adressbausteine für Standortseiten.
 *
 * Aus "Körperformen Köln Porz-Wahn" wird "koeln-porz-wahn" - und daraus
 * die Adresse /studio/koeln-porz-wahn. Der Ort steht damit in der Adresse,
 * in der Überschrift und im Seitentitel; das ist der Grund, warum es diese
 * Seiten überhaupt gibt.
 *
 * Der Markenname fällt weg: /studio/koerperformen-koeln-nippes wäre
 * länger, ohne ein einziges Wort hinzuzufügen, nach dem jemand sucht.
 *
 * Umlaute werden ausgeschrieben statt weggeworfen. "Hürth" zu "hrth" zu
 * machen wäre kaputt, "huerth" ist die Schreibweise, die Leute auch selbst
 * tippen.
 *
 * WICHTIG: Diese Regeln müssen mit der Migration
 * 20260910140000_studio_slug übereinstimmen - dort werden die vorhandenen
 * Standorte einmalig damit befüllt.
 */

const ERSATZ: [RegExp, string][] = [
  [/ä/g, "ae"],
  [/ö/g, "oe"],
  [/ü/g, "ue"],
  [/ß/g, "ss"],
];

export function studioSlug(name: string): string {
  let text = name.replace(/^\s*Körperformen\s+/i, "").toLowerCase();
  for (const [muster, ersatz] of ERSATZ) text = text.replace(muster, ersatz);

  return text
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Prüft eine von Hand eingetragene Adresse. */
export function istGueltigerSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= 80;
}
