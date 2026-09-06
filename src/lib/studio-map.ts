/**
 * Adresse für die Kartendarstellung.
 *
 * Ist im Adminbereich eine Google-Maps-Einbettungsadresse hinterlegt, wird
 * sie verwendet. Fehlt sie, entsteht die Adresse aus der Anschrift des
 * Studios - das spart bei vielen Standorten das mühsame Heraussuchen je
 * Studio, denn diese Form der Einbettung kommt ohne Schlüssel aus.
 *
 * Die Karte wird ohnehin erst nach Einwilligung geladen (siehe MapEmbed),
 * es entsteht also durch diese Adresse allein keine Verbindung zu Google.
 */
export function studioMapUrl(studio: {
  mapEmbedUrl: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
}): string {
  const configured = studio.mapEmbedUrl?.trim();
  if (configured) return configured;

  const query = `${studio.name}, ${studio.street}, ${studio.postalCode} ${studio.city}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
