/**
 * Welche Adresse hält die Website für ihre eigene?
 *
 * Diese Adresse steckt in den kanonischen Verweisen, in der Sitemap, im
 * Vorschaubild und in den strukturierten Daten. Überall dort sagt sie
 * Google: "Das hier ist das Original." Steht dort die falsche Adresse,
 * schreibt die Seite ihre eigenen Inhalte jemand anderem zu.
 *
 * Zwei Dinge macht diese Datei, die die frühere Fassung nicht machte:
 *
 * 1. Sie prüft den eingetragenen Wert, statt ihm zu glauben. Vorher ging
 *    er ungeprüft in `new URL(...)` im Wurzel-Layout - ein Tippfehler in
 *    der Umgebungsvariable ("ems-training.koeln" ohne https://) hätte
 *    damit nicht eine Seite kaputtgemacht, sondern alle: Der Aufruf
 *    wirft, und das Layout liegt über jeder einzelnen Seite. Jetzt wird
 *    ein unbrauchbarer Wert verworfen, die Seite läuft mit der
 *    vorgesehenen Adresse weiter, und der Grund steht im Adminbereich.
 *
 * 2. Sie benutzt VERCEL_URL nicht mehr. Diese Adresse gehört einer
 *    einzelnen Bereitstellung und ändert sich bei jeder Veröffentlichung
 *    (etwa projekt-a1b2c3.vercel.app). Als kanonische Adresse hätte jede
 *    Veröffentlichung Google eine andere Adresse als Original genannt.
 *    VERCEL_PROJECT_PRODUCTION_URL bleibt - die ist über alle
 *    Bereitstellungen hinweg dieselbe.
 */

/** Die Adresse, unter der die Seite am Ende stehen soll. */
export const VORGESEHENE_ADRESSE = "https://www.ems-training.koeln";

export type Herkunft = "eingetragen" | "vercel" | "vorgesehen";

export type Basisadresse = {
  /** Die Adresse, die tatsächlich ausgeliefert wird. Ohne Schrägstrich am Ende. */
  url: string;
  herkunft: Herkunft;
  /** Gesetzt, wenn ein eingetragener Wert verworfen werden musste. */
  verworfen?: { wert: string; grund: string };
};

/**
 * Taugt der Wert als Basisadresse?
 *
 * Streng mit Absicht: Was hier durchrutscht, steht anschließend in jeder
 * kanonischen Angabe der ganzen Website. Ein Pfad oder ein Fragezeichen
 * darin ergibt Adressen wie "https://beispiel.de/start/preise".
 */
export function adressePruefen(wert: string): { ok: true; url: string } | { ok: false; grund: string } {
  const roh = wert.trim();
  if (!roh) return { ok: false, grund: "Der Wert ist leer." };

  let url: URL;
  try {
    url = new URL(roh);
  } catch {
    return {
      ok: false,
      grund: roh.includes("://")
        ? "Das ist keine gültige Adresse."
        : "Es fehlt https:// am Anfang.",
    };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, grund: `Unerwarteter Anfang „${url.protocol}“ - erwartet wird https://.` };
  }
  // http:// ist zugelassen, damit eine lokale Vorschau (http://localhost:3000)
  // nicht abgelehnt wird. Im Netz gehört es sich nicht - deshalb weiter unten
  // ein Hinweis statt einer Ablehnung.
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    return { ok: false, grund: `„${url.hostname}“ sieht nicht wie ein Domainname aus.` };
  }
  // /^\/+$/ statt !== "/": Wer die Adresse aus der Adresszeile kopiert und
  // von Hand einen Schrägstrich ergänzt, hat am Ende zwei. Das ist kein
  // Pfad, das ist derselbe Ort - und eine Ablehnung mit der Begründung
  // „Der Pfad // gehört nicht in die Basisadresse“ wäre nur verwirrend.
  if (!/^\/+$/.test(url.pathname)) {
    return { ok: false, grund: `Der Pfad „${url.pathname}“ gehört nicht in die Basisadresse.` };
  }
  if (url.search) return { ok: false, grund: "Ein Fragezeichen gehört nicht in die Basisadresse." };
  if (url.hash) return { ok: false, grund: "Ein Rautezeichen gehört nicht in die Basisadresse." };

  // origin statt href: wirft den Schrägstrich am Ende ab und normalisiert
  // Groß- und Kleinschreibung im Domainnamen.
  return { ok: true, url: url.origin };
}

export function basisadresseErmitteln(env: NodeJS.ProcessEnv = process.env): Basisadresse {
  const eingetragen = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (eingetragen) {
    const geprueft = adressePruefen(eingetragen);
    if (geprueft.ok) return { url: geprueft.url, herkunft: "eingetragen" };
    // Nicht werfen: Ein Tippfehler in einer Umgebungsvariable darf keine
    // Website ausschalten. Er darf nur nicht unbemerkt bleiben.
    const ausweich = vercelAdresse(env);
    return {
      ...(ausweich ?? { url: VORGESEHENE_ADRESSE, herkunft: "vorgesehen" as const }),
      verworfen: { wert: eingetragen, grund: geprueft.grund },
    };
  }

  return vercelAdresse(env) ?? { url: VORGESEHENE_ADRESSE, herkunft: "vorgesehen" };
}

function vercelAdresse(env: NodeJS.ProcessEnv): Basisadresse | null {
  const produktion = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (!produktion) return null;
  const geprueft = adressePruefen(
    produktion.includes("://") ? produktion : `https://${produktion}`,
  );
  return geprueft.ok ? { url: geprueft.url, herkunft: "vercel" } : null;
}

/**
 * Läuft diese Bereitstellung als die richtige Website - oder ist sie eine
 * Vorschau?
 *
 * Vorschau-Bereitstellungen tragen dieselben Inhalte unter einer anderen
 * Adresse. Findet ein Suchdienst sie, steht derselbe Text zweimal im Netz,
 * und welche Fassung er als Original nimmt, entscheidet er selbst.
 */
export function istProduktion(env: NodeJS.ProcessEnv = process.env): boolean {
  // Ohne Vercel (lokal, eigener Server) gilt die Seite als echt - dort
  // entscheidet der Betreiber selbst, was erreichbar ist.
  if (!env.VERCEL_ENV) return true;
  return env.VERCEL_ENV === "production";
}
