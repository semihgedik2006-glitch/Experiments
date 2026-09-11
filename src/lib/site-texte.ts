import { prisma } from "@/lib/prisma";

/**
 * Einzelne Texte, die im Adminbereich änderbar sein müssen.
 *
 * Das Gegenstück zu site-toggles.ts: dort ein Schalter je Bereich, hier
 * ein Text je Schlüssel.
 *
 * Angelegt für den Preishinweis. Sobald auf einer Website Preise für
 * Verbraucher stehen, müssen es Gesamtpreise sein und es muss erkennbar
 * sein, was noch dazukommt (§ 3 PAngV). Der genaue Wortlaut hängt davon
 * ab, wie das Studio tatsächlich abrechnet - er gehört deshalb nicht in
 * den Code, sondern in den Adminbereich.
 *
 * Ein Datenbankeintrag entsteht erst beim ersten Speichern; bis dahin
 * gilt der Standardtext.
 */
export type TextKey = "preis-hinweis";

export const textDefinitionen: {
  key: TextKey;
  label: string;
  beschreibung: string;
  /** Vorgabe, solange nichts gespeichert wurde. */
  standard: string;
  zeilen: number;
}[] = [
  {
    key: "preis-hinweis",
    label: "Hinweis unter den Tarifen",
    beschreibung:
      "Steht unter der Preisübersicht. Sobald ihr Preise nennt, muss erkennbar sein, ob die Mehrwertsteuer enthalten ist und was noch dazukommt - das verlangt die Preisangabenverordnung. Der Satz erscheint nur, wenn auch Tarife eingetragen sind.",
    standard:
      "Alle Preise sind Endpreise inklusive Mehrwertsteuer. Es fallen keine weiteren Kosten an; eine Aufnahmegebühr gibt es nicht.",
    zeilen: 3,
  },
];

export type Texte = Record<TextKey, string>;

function standards(): Texte {
  return Object.fromEntries(
    textDefinitionen.map((eintrag) => [eintrag.key, eintrag.standard]),
  ) as Texte;
}

/**
 * Liest alle Texte. Fehlt ein Eintrag, gilt der Standardtext - die Seite
 * funktioniert also auch ohne jede gespeicherte Einstellung.
 */
export async function getTexte(): Promise<Texte> {
  const ergebnis = standards();

  try {
    const zeilen = await prisma.siteText.findMany();
    for (const zeile of zeilen) {
      // Ein leer gespeicherter Text bleibt leer - wer ihn absichtlich
      // löscht, will ihn weghaben und nicht den Standard zurück.
      if (zeile.key in ergebnis) ergebnis[zeile.key as TextKey] = zeile.wert;
    }
  } catch {
    // Ist die Tabelle noch nicht angelegt, bleibt es bei den
    // Standardtexten, statt dass die ganze Seite ausfällt.
  }

  return ergebnis;
}

export async function getText(key: TextKey): Promise<string> {
  return (await getTexte())[key];
}
