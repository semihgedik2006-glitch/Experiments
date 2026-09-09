import { prisma } from "@/lib/prisma";
import { KACHEL_PIXEL, ZOOM_MAX, ZOOM_MIN, kachelX, kachelY } from "@/lib/karte";
import { siteConfig } from "@/lib/site-config";

/**
 * Kartenkacheln über den eigenen Server.
 *
 * Der Grund ist Datenschutz: Holt der Browser die Kacheln direkt beim
 * Kartendienst, geht die IP-Adresse jedes Besuchers dorthin - genau das,
 * wofür die Google-Karten weiter unten einzeln um Erlaubnis fragen. Läuft
 * die Anfrage über diesen Weg, sieht der Kartendienst nur unseren Server.
 * Die Übersichtskarte darf deshalb sofort erscheinen.
 *
 * Bewusst kein allgemeiner Weiterleiter für beliebige Kacheln: Angenommen
 * werden nur Zoomstufen, die die Seite selbst verwendet, und nur Kacheln
 * in der Umgebung der eingetragenen Studios. Sonst wäre das hier ein
 * offener Kachelserver auf fremde Rechnung.
 */

// Der Kartendienst verlangt eine Kennung, an der erkennbar ist, wer
// anfragt. Ohne sie werden Anfragen abgewiesen.
const KENNUNG = `Koerperformen-Website/1.0 (+${siteConfig.url})`;

/** Wie viele Kacheln über den Studiobereich hinaus noch bedient werden. */
const RAND_KACHELN = 3;

async function imErlaubtenBereich(zoom: number, x: number, y: number) {
  const studios = await prisma.studioLocation.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: { latitude: true, longitude: true },
  });
  if (studios.length === 0) return false;

  const xs = studios.map((s) => kachelX(s.longitude as number, zoom));
  const ys = studios.map((s) => kachelY(s.latitude as number, zoom));

  return (
    x >= Math.floor(Math.min(...xs)) - RAND_KACHELN &&
    x <= Math.floor(Math.max(...xs)) + RAND_KACHELN &&
    y >= Math.floor(Math.min(...ys)) - RAND_KACHELN &&
    y <= Math.floor(Math.max(...ys)) + RAND_KACHELN
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ zoom: string; x: string; y: string }> },
) {
  const roh = await params;
  const zoom = Number.parseInt(roh.zoom, 10);
  const x = Number.parseInt(roh.x, 10);
  const y = Number.parseInt(roh.y, 10);

  const ganzzahlig = [zoom, x, y].every(Number.isSafeInteger);
  const grenze = 2 ** zoom;
  if (
    !ganzzahlig ||
    zoom < ZOOM_MIN ||
    zoom > ZOOM_MAX ||
    x < 0 ||
    y < 0 ||
    x >= grenze ||
    y >= grenze
  ) {
    return new Response("Ungültige Kachel.", { status: 400 });
  }

  if (!(await imErlaubtenBereich(zoom, x, y))) {
    return new Response("Kachel liegt außerhalb des Kartenbereichs.", { status: 404 });
  }

  const antwort = await fetch(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`, {
    headers: { "User-Agent": KENNUNG },
    // Kacheln ändern sich selten. Einen Tag lang genügt eine Anfrage je
    // Kachel - das hält die Last beim Kartendienst klein.
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!antwort.ok) {
    return new Response("Karte gerade nicht erreichbar.", { status: 502 });
  }

  return new Response(antwort.body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="kachel-${zoom}-${x}-${y}.png"`,
      // Eine Kachel unter dieser Adresse zeigt immer denselben Ausschnitt,
      // darf also lange im Zwischenspeicher bleiben.
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      "X-Kachelgroesse": String(KACHEL_PIXEL),
    },
  });
}
