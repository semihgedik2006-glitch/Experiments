import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Instagram-Beiträge auf der Website - ohne fremdes Skript.
 *
 * Der naheliegende Weg wäre der Einbettungscode von Instagram. Der lädt
 * aber Programmcode von Meta in die Seite jedes Besuchers, setzt Cookies
 * und braucht damit eine Einwilligung - genau das, wofür die
 * Google-Karten weiter unten einzeln fragen müssen. Hinter einem
 * Einwilligungsfenster sieht die Wand aber niemand, und der ganze Zweck
 * ("zeigt Leben im Studio") wäre dahin.
 *
 * Deshalb derselbe Weg wie bei den Kartenkacheln: Der Server holt die
 * Beiträge, der Server holt die Bilder, und der Browser des Besuchers
 * spricht ausschließlich mit uns. Instagram sieht unseren Server, nicht
 * die Besucher. Keine Einwilligung nötig, kein Skript von außen.
 *
 * Der Preis dafür: Es braucht einen Zugangsschlüssel, den das Studio bei
 * Meta erzeugt. Ohne ihn erscheint die Wand einfach nicht - siehe
 * /admin/instagram.
 */

export const INSTAGRAM_ZUGANG = "instagram";

/** Wie viele Beiträge geholt und gezeigt werden. */
export const ANZAHL = 6;

/**
 * Wie lange ein Abruf gilt.
 *
 * Eine Stunde: Häufiger anzufragen brächte nichts - so oft wird in einem
 * Studio nicht gepostet - und jede Anfrage zählt gegen ein Kontingent,
 * das Meta pro Stunde begrenzt.
 */
const GUELTIG_SEKUNDEN = 60 * 60;

/** Wie lange ein Bild im Zwischenspeicher bleibt. Bilder ändern sich nie. */
export const BILD_GUELTIG_SEKUNDEN = 60 * 60 * 24;

/**
 * Die Adresse der Instagram-Schnittstelle.
 *
 * Umschaltbar, damit sich der ganze Weg - Beiträge holen, Bilder
 * weiterleiten, Schlüssel verlängern - gegen einen Nachbau prüfen lässt,
 * ohne ein echtes Meta-Konto und ohne dass dabei Anfragen nach draußen
 * gehen. Im Betrieb ist die Variable nicht gesetzt, und es gilt die
 * echte Adresse.
 */
const BASIS = process.env.INSTAGRAM_API_BASIS?.trim() || "https://graph.instagram.com";

export type Beitrag = {
  id: string;
  /** Adresse des Beitrags auf Instagram. */
  permalink: string;
  /** Der Text darunter, gekürzt. */
  text: string;
  /** Wann er erschienen ist. */
  datum: Date | null;
  /** Video oder Bild - Videos zeigen wir als Vorschaubild. */
  video: boolean;
};

type RohBeitrag = {
  id?: string;
  caption?: string;
  media_type?: string;
  permalink?: string;
  timestamp?: string;
};

export type Zugangsstand = {
  verbunden: boolean;
  laeuftAb: Date | null;
  erneuertAm: Date | null;
  letzterFehler: string | null;
  /** Tage bis zum Ablauf, negativ wenn bereits abgelaufen. */
  tageBisAblauf: number | null;
};

export async function zugangsstand(): Promise<Zugangsstand> {
  const zugang = await prisma.externerZugang.findUnique({
    where: { id: INSTAGRAM_ZUGANG },
  });

  if (!zugang) {
    return {
      verbunden: false,
      laeuftAb: null,
      erneuertAm: null,
      letzterFehler: null,
      tageBisAblauf: null,
    };
  }

  return {
    verbunden: true,
    laeuftAb: zugang.laeuftAb,
    erneuertAm: zugang.erneuertAm,
    letzterFehler: zugang.letzterFehler,
    tageBisAblauf: zugang.laeuftAb
      ? Math.floor((zugang.laeuftAb.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : null,
  };
}

/** Den Schlüssel holen - nur für den Server, nie für eine Seite. */
async function token(): Promise<string | null> {
  const zugang = await prisma.externerZugang.findUnique({
    where: { id: INSTAGRAM_ZUGANG },
    select: { token: true },
  });
  return zugang?.token ?? null;
}

/** Vermerkt, was schiefging - oder dass nichts schiefging. */
async function fehlerNotieren(meldung: string | null) {
  try {
    await prisma.externerZugang.update({
      where: { id: INSTAGRAM_ZUGANG },
      data: { letzterFehler: meldung?.slice(0, 500) ?? null },
    });
  } catch {
    // Ein Vermerk, der nicht geschrieben werden kann, darf die Seite nicht
    // anhalten.
  }
}

/**
 * Die letzten Beiträge.
 *
 * Wirft nie. Geht etwas schief - abgelaufener Schlüssel, Instagram nicht
 * erreichbar, geändertes Antwortformat -, ist die Wand leer und die Seite
 * steht trotzdem. Was schiefging, landet im Adminbereich.
 */
export async function letzteBeitraege(): Promise<Beitrag[]> {
  const schluessel = await token();
  if (!schluessel) return [];

  try {
    const felder = "id,caption,media_type,permalink,timestamp";
    const antwort = await fetch(
      `${BASIS}/me/media?fields=${felder}&limit=${ANZAHL}&access_token=${encodeURIComponent(schluessel)}`,
      { next: { revalidate: GUELTIG_SEKUNDEN } },
    );

    if (!antwort.ok) {
      await fehlerNotieren(`Instagram antwortete mit ${antwort.status}.`);
      return [];
    }

    const daten = (await antwort.json()) as { data?: RohBeitrag[] };
    if (!Array.isArray(daten.data)) {
      await fehlerNotieren("Instagram hat keine Liste von Beiträgen geliefert.");
      return [];
    }

    await fehlerNotieren(null);

    return daten.data
      .filter((roh): roh is RohBeitrag & { id: string; permalink: string } =>
        Boolean(roh.id && roh.permalink),
      )
      .slice(0, ANZAHL)
      .map((roh) => ({
        id: roh.id,
        permalink: roh.permalink,
        // Der Text dient als Beschreibung des Bildes und als Hinweis beim
        // Darüberfahren - ein ganzer Beitrag mit dreißig Schlagwörtern
        // wäre für beides unbrauchbar.
        text: kurzText(roh.caption ?? ""),
        datum: roh.timestamp ? new Date(roh.timestamp) : null,
        video: roh.media_type === "VIDEO",
      }));
  } catch (error) {
    await fehlerNotieren(error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Der erste Satz, höchstens 120 Zeichen, ohne Schlagwörter.
 *
 * Schlagwörter fliegen raus, weil sie für Instagram geschrieben sind und
 * nicht für einen Leser: "#emstraining #koeln #fitness" ist als
 * Bildbeschreibung wertlos.
 */
function kurzText(roh: string): string {
  const ohneTags = roh
    .replace(/#[\p{L}\p{N}_]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (ohneTags.length <= 120) return ohneTags;
  return ohneTags.slice(0, 119).trimEnd() + "…";
}

/**
 * Die Bildadresse zu einem Beitrag.
 *
 * Eigener Abruf je Bild, weil die Adressen bei Instagram nach kurzer Zeit
 * ungültig werden - sie mit den Beiträgen zusammen eine Stunde lang
 * aufzubewahren würde also kaputte Bilder ergeben.
 */
export async function bildAdresse(id: string): Promise<string | null> {
  const schluessel = await token();
  if (!schluessel) return null;

  try {
    const antwort = await fetch(
      `${BASIS}/${encodeURIComponent(id)}?fields=media_url,thumbnail_url,media_type&access_token=${encodeURIComponent(schluessel)}`,
      { next: { revalidate: GUELTIG_SEKUNDEN } },
    );
    if (!antwort.ok) return null;

    const daten = (await antwort.json()) as {
      media_url?: string;
      thumbnail_url?: string;
      media_type?: string;
    };

    // Bei einem Video ist media_url die Videodatei - für eine Kachel
    // brauchen wir das Vorschaubild.
    return daten.media_type === "VIDEO"
      ? (daten.thumbnail_url ?? null)
      : (daten.media_url ?? daten.thumbnail_url ?? null);
  } catch {
    return null;
  }
}

/**
 * Den Schlüssel gegen einen frischen tauschen.
 *
 * Instagram gibt langlebige Schlüssel mit 60 Tagen Gültigkeit aus. Sie
 * lassen sich verlängern, aber frühestens 24 Stunden nach der Ausstellung
 * und nur, solange sie noch gültig sind. Ein abgelaufener Schlüssel ist
 * endgültig weg - dann muss das Studio einen neuen erzeugen.
 *
 * Wird täglich aufgerufen (siehe /api/cron/instagram).
 */
export async function schluesselErneuern(): Promise<{ ok: boolean; meldung: string }> {
  const zugang = await prisma.externerZugang.findUnique({
    where: { id: INSTAGRAM_ZUGANG },
  });
  if (!zugang) return { ok: false, meldung: "Kein Zugang hinterlegt." };

  try {
    const antwort = await fetch(
      `${BASIS}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(zugang.token)}`,
      { cache: "no-store" },
    );

    if (!antwort.ok) {
      const meldung = `Verlängerung abgelehnt (${antwort.status}).`;
      await fehlerNotieren(meldung);
      return { ok: false, meldung };
    }

    const daten = (await antwort.json()) as { access_token?: string; expires_in?: number };
    if (!daten.access_token) {
      const meldung = "Instagram hat keinen neuen Schlüssel geliefert.";
      await fehlerNotieren(meldung);
      return { ok: false, meldung };
    }

    await prisma.externerZugang.update({
      where: { id: INSTAGRAM_ZUGANG },
      data: {
        token: daten.access_token,
        laeuftAb: ablaufAus(daten.expires_in),
        erneuertAm: new Date(),
        letzterFehler: null,
      },
    });

    return { ok: true, meldung: "Schlüssel verlängert." };
  } catch (error) {
    const meldung = error instanceof Error ? error.message : String(error);
    await fehlerNotieren(meldung);
    return { ok: false, meldung };
  }
}

/** Sekunden bis zum Ablauf in ein Datum umrechnen. */
export function ablaufAus(sekunden: number | undefined): Date | null {
  if (!sekunden || !Number.isFinite(sekunden)) return null;
  return new Date(Date.now() + sekunden * 1000);
}
