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
