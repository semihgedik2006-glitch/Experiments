import { getAdminSession } from "@/lib/auth";
import { isVisible, type ToggleKey } from "@/lib/site-toggles";

/**
 * Seiten, die fertig sind, aber noch nicht live gehen sollen (Gutscheine,
 * Januar-Aktion).
 *
 * Ist der Schalter im Adminbereich aus, antwortet die Seite für alle mit
 * 404 - außer für angemeldete Admins: Die sehen sie mit einem Hinweis
 * oben, damit sie vorher geprüft werden kann.
 */
export async function sichtbarkeit(key: ToggleKey): Promise<"live" | "vorschau" | "aus"> {
  if (await isVisible(key)) return "live";
  return (await getAdminSession()) ? "vorschau" : "aus";
}
