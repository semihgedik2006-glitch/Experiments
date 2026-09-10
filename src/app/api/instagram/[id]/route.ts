import { BILD_GUELTIG_SEKUNDEN, bildAdresse, letzteBeitraege } from "@/lib/instagram";

/**
 * Instagram-Bilder über den eigenen Server.
 *
 * Derselbe Grund wie bei den Kartenkacheln: Holt der Browser das Bild
 * direkt bei Instagram, geht die IP-Adresse jedes Besuchers dorthin -
 * mitsamt der Information, welche Seite er gerade liest. Läuft das Bild
 * über diesen Weg, sieht Instagram nur unseren Server, und die Wand darf
 * ohne Einwilligungsfenster erscheinen.
 *
 * Bewusst kein allgemeiner Weiterleiter: Bedient werden ausschließlich
 * Kennungen, die tatsächlich in den zuletzt geholten Beiträgen stehen.
 * Sonst wäre das hier ein offener Bilderdienst auf fremde Rechnung - und
 * ein Weg, beliebige Adressen über unseren Server abzurufen.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Kennungen bei Instagram sind reine Ziffern. Alles andere gar nicht
  // erst weiterreichen.
  if (!/^\d{1,30}$/.test(id)) {
    return new Response("Ungültige Kennung.", { status: 400 });
  }

  const beitraege = await letzteBeitraege();
  if (!beitraege.some((beitrag) => beitrag.id === id)) {
    return new Response("Kein Beitrag mit dieser Kennung.", { status: 404 });
  }

  const adresse = await bildAdresse(id);
  if (!adresse) {
    return new Response("Bild gerade nicht erreichbar.", { status: 502 });
  }

  const antwort = await fetch(adresse, { next: { revalidate: BILD_GUELTIG_SEKUNDEN } });
  if (!antwort.ok) {
    return new Response("Bild gerade nicht erreichbar.", { status: 502 });
  }

  // Nur Bilder durchlassen. Ohne diese Prüfung könnte eine geänderte
  // Antwort von Instagram beliebige Inhalte unter unserer Adresse
  // ausliefern.
  const typ = antwort.headers.get("content-type") ?? "";
  if (!typ.startsWith("image/")) {
    return new Response("Unerwarteter Inhalt.", { status: 502 });
  }

  return new Response(antwort.body, {
    headers: {
      "content-type": typ,
      "cache-control": `public, max-age=${BILD_GUELTIG_SEKUNDEN}, s-maxage=${BILD_GUELTIG_SEKUNDEN}`,
    },
  });
}
