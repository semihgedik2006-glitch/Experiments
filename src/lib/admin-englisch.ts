/**
 * Die englischen Felder aus den Admin-Formularen lesen.
 *
 * Alle freiwillig: Ein leeres Feld wird als null gespeichert, und auf der
 * englischen Seite steht dann der deutsche Text (@/lib/i18n/lokal).
 */
export function enText(formData: FormData, name: string, max = 20000): string | null {
  return String(formData.get(name) ?? "").replace(/\r\n?/g, "\n").trim().slice(0, max) || null;
}

/** Eine Liste, eine Zeile je Eintrag (Tarifleistungen). */
export function enListe(formData: FormData, name: string): string[] {
  return String(formData.get(name) ?? "")
    .split(/\r?\n/)
    .map((zeile) => zeile.trim())
    .filter(Boolean);
}
