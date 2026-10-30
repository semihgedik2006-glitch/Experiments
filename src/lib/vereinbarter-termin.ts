/**
 * Der mit dem Gast vereinbarte Termin bei Anfragen ohne festen Platz
 * (Booking.terminTag / terminUhrzeit, siehe Schema).
 *
 * Eigene Datei und nicht in den Server-Aktionen: Eine "use server"-Datei
 * darf nur asynchrone Funktionen nach außen geben.
 */

/**
 * Der vereinbarte Termin aus dem Formular ("2026-11-04", "18:30") - nur,
 * wenn beides gültig ist. Halbe Angaben gelten als keine Angabe.
 */
export function terminAusFormular(formData: FormData | null): { tag: Date; uhrzeit: string } | null {
  if (!formData) return null;
  const tag = String(formData.get("terminTag") ?? "").trim();
  const uhrzeit = String(formData.get("terminUhrzeit") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tag) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(uhrzeit)) return null;
  const [j, m, t] = tag.split("-").map(Number);
  // Wie slot.date: der Kalendertag als Mitternacht (UTC), siehe Schema.
  return { tag: new Date(Date.UTC(j, m - 1, t)), uhrzeit };
}
