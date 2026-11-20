import "server-only";
import type { Sprache } from "@/lib/sprache";

/**
 * Echte Google-Bewertungen eines Studios.
 *
 * Geholt wird über die Places API (New) - auf dem Server, nicht im
 * Browser der Besucher. Wer die Studioseite öffnet, schickt Google also
 * nichts; die Seite bekommt Sterne und Texte fertig geliefert. Deshalb
 * auch keine Profilbilder der Verfasser: Die lägen auf Google-Servern und
 * würden beim Besucher nachgeladen.
 *
 * Nur echte Daten. Fehlt der Schlüssel (GOOGLE_PLACES_API_KEY), fehlt die
 * Place-ID am Studio oder antwortet Google nicht, erscheint nichts - kein
 * Platzhalter, keine Beispielbewertung.
 *
 * Zwischengespeichert für einen Tag: Bewertungen ändern sich langsam, und
 * jede Abfrage kostet bei Google ein paar Zehntelcent.
 */

export type GoogleBewertung = {
  autor: string;
  autorLink: string | null;
  sterne: number;
  text: string;
  /** Von Google formuliert, z. B. "vor 2 Wochen" - in der Seitensprache. */
  wann: string | null;
};

export type GoogleBewertungen = {
  sterne: number;
  anzahl: number;
  link: string | null;
  bewertungen: GoogleBewertung[];
};

const TAG = 60 * 60 * 24;

type PlaceAntwort = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: {
    rating?: number;
    text?: { text?: string };
    originalText?: { text?: string };
    relativePublishTimeDescription?: string;
    authorAttribution?: { displayName?: string; uri?: string };
  }[];
};

export async function googleBewertungen(
  placeId: string | null | undefined,
  sprache: Sprache = "de",
): Promise<GoogleBewertungen | null> {
  const schluessel = process.env.GOOGLE_PLACES_API_KEY;
  const id = placeId?.trim();
  if (!schluessel || !id) return null;

  try {
    const antwort = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${sprache}`,
      {
        headers: {
          "X-Goog-Api-Key": schluessel,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: TAG },
      },
    );
    if (!antwort.ok) {
      console.error("Google-Bewertungen nicht abrufbar:", antwort.status, await antwort.text().catch(() => ""));
      return null;
    }
    const daten = (await antwort.json()) as PlaceAntwort;
    if (typeof daten.rating !== "number" || !daten.userRatingCount) return null;

    const bewertungen = (daten.reviews ?? [])
      .map((r) => ({
        autor: r.authorAttribution?.displayName?.trim() || "Google-Nutzer",
        autorLink: r.authorAttribution?.uri ?? null,
        sterne: Math.round(r.rating ?? 0),
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        wann: r.relativePublishTimeDescription ?? null,
      }))
      // Nur Bewertungen mit Text - nackte Sterne erzählen nichts, was die
      // Gesamtnote nicht schon sagt.
      .filter((r) => r.text && r.sterne >= 1)
      .slice(0, 3);

    return {
      sterne: daten.rating,
      anzahl: daten.userRatingCount,
      link: daten.googleMapsUri ?? null,
      bewertungen,
    };
  } catch (error) {
    console.error("Google-Bewertungen nicht abrufbar:", error);
    return null;
  }
}

export type PlaceTreffer = { id: string; name: string; adresse: string };

/** Für den Knopf "Place-ID suchen" im Adminbereich. */
export async function placeIdsSuchen(suche: string): Promise<PlaceTreffer[] | { fehler: string }> {
  const schluessel = process.env.GOOGLE_PLACES_API_KEY;
  if (!schluessel) return { fehler: "GOOGLE_PLACES_API_KEY ist in Vercel nicht eingetragen." };
  try {
    const antwort = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": schluessel,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
      },
      body: JSON.stringify({ textQuery: suche, languageCode: "de", maxResultCount: 5 }),
      cache: "no-store",
    });
    if (!antwort.ok) return { fehler: `Google antwortet mit Fehler ${antwort.status}.` };
    const daten = (await antwort.json()) as {
      places?: { id: string; displayName?: { text?: string }; formattedAddress?: string }[];
    };
    return (daten.places ?? []).map((p) => ({
      id: p.id,
      name: p.displayName?.text ?? "",
      adresse: p.formattedAddress ?? "",
    }));
  } catch {
    return { fehler: "Google ist gerade nicht erreichbar." };
  }
}
