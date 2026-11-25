/**
 * Alle öffentlichen Seiten einmal aufrufen.
 *
 * Nach dem morgendlichen revalidatePath gelten alle Seiten als veraltet.
 * Ohne diesen Schritt würde jede erst beim nächsten Besuch neu erzeugt -
 * verteilt über den ganzen Tag, und jedes Mal müsste die Datenbank
 * aufwachen (sie schläft nach fünf Minuten Ruhe ein, jedes Aufwachen
 * kostet also mindestens fünf Minuten Rechenzeit). So entstehen alle
 * Seiten in einem Rutsch, solange die Datenbank ohnehin wach ist.
 */

export function adressenAusSitemap(xml: string, basis: string): string[] {
  const herkunft = new URL(basis).origin;
  const adressen = new Set<string>();
  for (const treffer of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    try {
      const adresse = new URL(treffer[1].replace(/&amp;/g, "&"));
      // Nur die eigene Seite - eine Sitemap ist Text, dem hier nicht
      // blind zu fremden Adressen gefolgt wird.
      if (adresse.origin === herkunft) adressen.add(adresse.toString());
    } catch {
      // Keine Adresse - überspringen.
    }
  }
  return [...adressen];
}

export async function seitenAufwaermen(
  basis: string,
  optionen: { abrufen?: typeof fetch; gleichzeitig?: number; fristMs?: number } = {},
): Promise<{ seiten: number; ok: number; fehler: number; abgebrochen: boolean }> {
  const abrufen = optionen.abrufen ?? fetch;
  const ende = Date.now() + (optionen.fristMs ?? 120_000);
  const holen = (adresse: string) =>
    abrufen(adresse, { cache: "no-store", signal: AbortSignal.timeout(25_000), headers: { "user-agent": "koerperformen-aufwaermen" } });

  const sitemap = await holen(new URL("/sitemap.xml", basis).toString());
  if (!sitemap.ok) return { seiten: 0, ok: 0, fehler: 1, abgebrochen: false };
  const offen = adressenAusSitemap(await sitemap.text(), basis);
  const seiten = offen.length;
  let ok = 0;
  let fehler = 0;
  let abgebrochen = false;

  const arbeiter = async () => {
    for (;;) {
      const adresse = offen.shift();
      if (!adresse) return;
      if (Date.now() > ende) {
        abgebrochen = true;
        return;
      }
      try {
        const antwort = await holen(adresse);
        // Den Inhalt abholen: Erst dann ist die Seite sicher fertig erzeugt.
        await antwort.arrayBuffer();
        if (antwort.ok) ok++;
        else fehler++;
      } catch {
        fehler++;
      }
    }
  };
  await Promise.all(Array.from({ length: optionen.gleichzeitig ?? 6 }, arbeiter));
  return { seiten, ok, fehler, abgebrochen };
}
