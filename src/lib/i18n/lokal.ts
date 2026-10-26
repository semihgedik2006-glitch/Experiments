import type { Sprache } from "@/lib/sprache";

/**
 * Ein Text aus dem Adminbereich in der gewünschten Sprache.
 *
 * Zu jedem Text, den das Studio pflegt, gibt es ein freiwilliges Feld
 * "Englisch". Ist es leer, steht auf der englischen Seite der deutsche
 * Text - ein deutscher Satz ist besser als eine Lücke.
 */
export function lokal(sprache: Sprache, de: string, en: string | null | undefined): string;
export function lokal(
  sprache: Sprache,
  de: string | null | undefined,
  en: string | null | undefined,
): string | null;
export function lokal(sprache: Sprache, de: string | null | undefined, en: string | null | undefined) {
  if (sprache === "en" && en && en.trim()) return en;
  return de ?? null;
}

/** Dasselbe für Listen (Tarifleistungen): leer heißt "nicht übersetzt". */
export function lokalListe(sprache: Sprache, de: string[], en: string[] | null | undefined): string[] {
  if (sprache === "en" && en && en.some((x) => x.trim())) return en;
  return de;
}
