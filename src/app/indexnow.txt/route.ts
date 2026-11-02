/**
 * /indexnow.txt - die Schlüsseldatei für IndexNow.
 *
 * Über IndexNow meldet die Website neue und geänderte Seiten direkt an
 * Bing, Yandex & Co., statt zu warten, bis deren Crawler von selbst
 * vorbeikommen. Damit nicht jeder beliebige Seiten im Namen dieser Domain
 * melden kann, prüft der Dienst, ob unter dieser Adresse genau der
 * Schlüssel steht, der mit der Meldung mitgeschickt wurde.
 *
 * Gemeldet wird mit `npm run indexnow` (scripts/indexnow.mjs). Ohne
 * INDEXNOW_KEY gibt es hier nur einen 404 - dann passiert schlicht nichts.
 */
export function GET() {
  const schluessel = process.env.INDEXNOW_KEY;
  if (!schluessel) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(schluessel, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
