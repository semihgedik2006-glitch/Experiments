export type EntwurfDaten =
  | { art: "faq"; frage: string; frageEn: string | null; text: string; textEn: string | null }
  | { art: "studio"; studio: string; feld: "intro" | "anfahrt"; text: string; textEn: string | null };

export const ENTWURF_GRENZEN = { frage: 200, antwort: 2000, intro: 600, anfahrt: 800 } as const;

const feld = (wert: unknown, max: number) => String(wert ?? "").replace(/\r\n?/g, "\n").trim().slice(0, max);
const frei = (wert: unknown, max: number) => feld(wert, max) || null;

export function entwurfPruefen(eingabe: Record<string, unknown>): EntwurfDaten | { fehler: string } {
  if (eingabe.art === "faq_entwurf") {
    const frage = feld(eingabe.frage, ENTWURF_GRENZEN.frage);
    const text = feld(eingabe.antwort, ENTWURF_GRENZEN.antwort);
    if (!frage || !text) return { fehler: "Frage und Antwort fehlen." };
    return { art: "faq", frage, text, frageEn: frei(eingabe.frageEn, ENTWURF_GRENZEN.frage), textEn: frei(eingabe.antwortEn, ENTWURF_GRENZEN.antwort) };
  }
  if (eingabe.art === "studio_text") {
    const studio = feld(eingabe.studio, 120);
    const welches = eingabe.feld === "anfahrt" ? "anfahrt" : eingabe.feld === "intro" ? "intro" : null;
    if (!studio) return { fehler: "Welches Studio?" };
    if (!welches) return { fehler: "Feld ist intro oder anfahrt." };
    const max = ENTWURF_GRENZEN[welches];
    const text = feld(eingabe.text, max);
    if (!text) return { fehler: "Text fehlt." };
    return { art: "studio", studio, feld: welches, text, textEn: frei(eingabe.textEn, max) };
  }
  return { fehler: "Unbekannte Art." };
}

export function studioFinden<T extends { slug: string; name: string }>(studios: T[], suche: string): T | null {
  const s = suche.trim().toLowerCase();
  if (!s) return null;
  return (
    studios.find((x) => x.slug.toLowerCase() === s) ??
    studios.find((x) => x.name.trim().toLowerCase() === s) ??
    (() => {
      const teil = studios.filter((x) => x.name.toLowerCase().includes(s) || x.slug.toLowerCase().includes(s));
      return teil.length === 1 ? teil[0] : null;
    })()
  );
}
