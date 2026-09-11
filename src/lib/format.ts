export function formatDate(date: Date | string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Ungültiges Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

/**
 * Kurzes Datum für die Tagesauswahl: "Fr., 12.09." oder "Fri, 12 Sep".
 *
 * Die englische Fassung nennt den Monat mit Namen statt mit Ziffern.
 * Grund: "12/09" ist zwischen britischer und amerikanischer Lesart
 * mehrdeutig - und die Zielgruppe der englischen Seite kommt aus beiden.
 */
export function formatDateShort(date: Date | string, sprache: "de" | "en" = "de") {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return sprache === "en" ? "Invalid date" : "Ungültiges Datum";
  }

  return sprache === "en"
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(parsed)
    : new Intl.DateTimeFormat("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }).format(parsed);
}
