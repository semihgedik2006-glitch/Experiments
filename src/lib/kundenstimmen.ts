import { prisma } from "@/lib/prisma";

/**
 * Die freigegebenen Kundenstimmen.
 *
 * Eine gemeinsame Stelle für Startseite und Erfolgsgeschichten, damit
 * beide dieselbe Reihenfolge zeigen und niemand an einer der beiden
 * Stellen vergisst, auf "aktiv" zu filtern.
 *
 * Fällt die Abfrage aus, kommt eine leere Liste zurück und der Bereich
 * verschwindet - eine Startseite, die wegen der Kundenstimmen gar nicht
 * mehr lädt, wäre der schlechtere Tausch.
 */

export type Stimme = {
  id: string;
  name: string;
  text: string;
  ziel: string | null;
  monate: number | null;
};

export async function stimmenHolen(grenze?: number): Promise<Stimme[]> {
  try {
    return await prisma.kundenstimme.findMany({
      where: { aktiv: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: grenze,
      select: { id: true, name: true, text: true, ziel: true, monate: true },
    });
  } catch (error) {
    console.error("Kundenstimmen konnten nicht geladen werden:", error);
    return [];
  }
}

/** Der erste Buchstabe für das runde Feld neben dem Namen. */
export function anfangsbuchstabe(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase("de") || "?";
}

/**
 * Hat die Seite "Erfolgsgeschichten" überhaupt etwas zu zeigen?
 *
 * Der Anlass: Nachdem die erfundenen Zitate entfernt waren, bestand die
 * Seite nur noch aus ihrer eigenen Überschrift - "Das sagen sie über ihr
 * Training bei Körperformen", und darunter nichts. Sie stand trotzdem im
 * Menü. Eine Seite, die im Kopf Inhalt ankündigt und keinen hat, ist
 * schlechter als keine Seite.
 *
 * Deshalb entscheidet der Inhalt: Solange weder eine freigegebene
 * Kundenstimme noch ein freigegebenes Bildpaar vorliegt, verschwindet
 * der Eintrag aus dem Menü und die Adresse antwortet mit 404. Sobald das
 * Studio die erste echte Stimme einträgt, ist die Seite von selbst
 * wieder da - niemand muss dafür einen Schalter umlegen.
 */
export async function erfolgeVorhanden(): Promise<boolean> {
  try {
    const [stimmen, bilder] = await Promise.all([
      prisma.kundenstimme.count({ where: { aktiv: true } }),
      prisma.verwandlung.count({ where: { aktiv: true } }),
    ]);
    return stimmen + bilder > 0;
  } catch (error) {
    // Im Zweifel sichtbar lassen: Ein Ausfall der Abfrage soll keine
    // Seite aus dem Menü nehmen, die eigentlich Inhalt hat.
    console.error("Erfolgsgeschichten konnten nicht geprüft werden:", error);
    return true;
  }
}
