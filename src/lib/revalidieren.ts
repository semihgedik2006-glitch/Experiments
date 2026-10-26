import { revalidatePath as nextRevalidatePath } from "next/cache";
import { nachEn } from "@/lib/i18n/pfade";

/**
 * revalidatePath, das die englische Fassung mitnimmt.
 *
 * Ändert das Studio einen Text, veraltet nicht nur /preise, sondern auch
 * /en/prices. Statt das an jeder Stelle doppelt hinzuschreiben (und es an
 * einer zu vergessen), erneuert dieser Aufruf beide. Adminseiten und
 * Schnittstellen haben keine englische Fassung und bleiben einfach.
 */
export function revalidatePath(pfad: string, art?: "layout" | "page") {
  nextRevalidatePath(pfad, art);
  const en = nachEn(pfad);
  if (en !== pfad) nextRevalidatePath(en, art);
}
