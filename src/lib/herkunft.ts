/**
 * Woher eine Anfrage kam.
 *
 * Die Frage "welche Anzeige bringt tatsächlich Anfragen" wird sonst mit
 * einem Zählpixel beantwortet, das über die halbe Website mitliest und
 * eine Einwilligung braucht. Hier reichen drei Angaben, die ohnehin schon
 * da sind:
 *
 * 1. Auf welcher Seite das Formular stand. Zeigt, ob die Kampagnenseite
 *    oder die gewöhnliche Probeterminseite die Anfrage gebracht hat.
 * 2. Die Kampagnenkennung aus der Adresse - das, was ihr selbst in die
 *    Anzeige schreibt (?utm_campaign=... oder kurz ?k=...).
 * 3. Der Name der verweisenden Seite, etwa "google.com" oder
 *    "instagram.com".
 *
 * Was bewusst NICHT erfasst wird: kein Cookie, keine Kennung, die den
 * Besucher über mehrere Besuche wiedererkennt, kein Drittanbieter, und
 * nicht die vollständige Verweisadresse - die kann Suchbegriffe und
 * anderes enthalten, das uns nichts angeht.
 *
 * Grenzen, die man kennen sollte: Der Name der verweisenden Seite fehlt
 * oft. Wer aus einer App heraus tippt, bei wem der Browser den Verweis
 * unterdrückt oder wer die Adresse direkt eingibt, erscheint als
 * "direkt". Die Kampagnenkennung gibt es nur, wenn sie in der beworbenen
 * Adresse steht. Das Bild ist also nicht vollständig - es ist ehrlich.
 */

/** Länge, ab der gekürzt wird. Kein Wert braucht mehr. */
const MAX = 120;

function saeubern(wert: string | null | undefined): string | null {
  if (!wert) return null;
  // Zeilenumbrüche raus: Sie kämen aus keiner echten Adresse und würden
  // in der Tabelle die Zeilen zerlegen.
  const sauber = wert.replace(/[\r\n\t]+/g, " ").trim().slice(0, MAX);
  return sauber || null;
}

export type Herkunft = {
  seite: string | null;
  kampagne: string | null;
  quelle: string | null;
};

/**
 * Liest die Herkunft im Browser aus. Wird beim Aufbau des Formulars
 * einmal aufgerufen - und nicht beim Absenden, weil bis dahin schon
 * geblättert worden sein kann.
 */
export function herkunftAusBrowser(): Herkunft {
  if (typeof window === "undefined") return { seite: null, kampagne: null, quelle: null };

  const adresse = new URL(window.location.href);
  const kampagne =
    adresse.searchParams.get("utm_campaign") ??
    adresse.searchParams.get("k") ??
    adresse.searchParams.get("aktion");

  let quelle: string | null = null;
  const verweis = document.referrer;
  if (verweis) {
    try {
      const host = new URL(verweis).hostname.replace(/^www\./, "");
      // Verweise von der eigenen Website sind kein Herkunftsnachweis -
      // sie sagen nur, über welche Unterseite jemand gelaufen ist.
      if (host !== window.location.hostname.replace(/^www\./, "")) quelle = host;
    } catch {
      // Eine Verweisadresse, die sich nicht lesen lässt, ist keine Angabe
      // wert - lieber nichts als etwas Falsches.
    }
  }

  return {
    seite: saeubern(adresse.pathname),
    kampagne: saeubern(kampagne),
    quelle: saeubern(quelle) ?? "direkt",
  };
}

/** Auf dem Server: aus dem Formular lesen und begrenzen. */
export function herkunftAusFormular(formData: FormData): Herkunft {
  return {
    seite: saeubern(String(formData.get("herkunftSeite") ?? "")),
    kampagne: saeubern(String(formData.get("herkunftKampagne") ?? "")),
    quelle: saeubern(String(formData.get("herkunftQuelle") ?? "")),
  };
}

/** Für die Anzeige: "direkt" bleibt stehen, Leeres wird benannt. */
export function herkunftText(wert: string | null | undefined): string {
  return wert && wert.trim() ? wert : "nicht bekannt";
}
