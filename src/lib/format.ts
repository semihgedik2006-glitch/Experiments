export function formatDate(date: Date | string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Ungültiges Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function formatDateShort(date: Date | string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Ungültiges Datum";

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(parsed);
}
