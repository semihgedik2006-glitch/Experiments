"use client";

import { usePathname } from "next/navigation";
import type { Sprache } from "@/lib/sprache";
import { istEnglisch } from "@/lib/i18n/pfade";

/**
 * Die Sprache der aktuellen Seite - für Client-Komponenten.
 *
 * Abgelesen an der Adresse statt aus einem Kontext: Alles unter /en ist
 * Englisch, alles andere Deutsch. Das gilt auch beim Vorrendern auf dem
 * Server, die Seiten bleiben dadurch statisch. Und eine Komponente kann
 * die Sprache nicht "vergessen", weil irgendwo ein Provider fehlt.
 */
export function useSprache(): Sprache {
  const pfad = usePathname();
  return pfad && istEnglisch(pfad) ? "en" : "de";
}
