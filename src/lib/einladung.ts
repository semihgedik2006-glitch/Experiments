/**
 * Wann die Einladung zum Probetraining erscheinen darf - und wann nicht.
 *
 * Getrennt vom Aussehen, weil hier entschieden wird, ob das Ding nervt.
 * Ein Pop-up, das zum falschen Zeitpunkt kommt, ist auch dann lästig,
 * wenn es hübsch ist; eines, das sich an Regeln hält, fällt kaum auf.
 *
 * DIE REGELN, UND WARUM:
 *
 * 1. Niemals sofort. Wer eben erst angekommen ist, hat noch nichts
 *    gesehen, wovon man ihn abhalten könnte. Erst nach ein paar Sekunden
 *    UND ein Stück gelesener Seite.
 *
 * 2. Nur einmal. Wer es weggeklickt hat, hat geantwortet. Diese Antwort
 *    gilt einen Monat - nicht bis zum nächsten Seitenaufruf.
 *
 * 3. Nie dort, wo es unsinnig wäre. Auf der Buchungsseite selbst, auf
 *    der persönlichen Terminseite eines Gastes und im eigenen
 *    Terminbereich hat sich die Frage erledigt.
 *
 * 4. Nie bei jemandem, der schon gebucht hat. Wer aus der
 *    Bestätigungsmail kommt, hat den Termin bereits.
 *
 * 5. Nie bei "Bewegung reduzieren". Eine Fläche, die von selbst
 *    aufspringt, ist genau das, wovon diese Einstellung befreien soll.
 *
 * Alles davon steht im Browser des Besuchers und nirgendwo sonst: kein
 * Zähler auf dem Server, keine Kennung, nichts, was jemanden
 * wiedererkennbar macht.
 */

/** Woher wir uns die Antwort merken. */
export const EINLADUNG_SCHLUESSEL = "probetermin-einladung";

/** Wie lange Ruhe ist, nachdem jemand weggeklickt hat. */
export const RUHE_TAGE = 30;

/** Wie lange jemand mindestens auf der Seite sein muss. */
export const MINDEST_SEKUNDEN = 20;

/** Wie viel der Seite er mindestens gesehen haben muss (Anteil). */
export const MINDEST_ANTEIL = 0.25;

/**
 * Seiten, auf denen die Einladung nichts zu suchen hat.
 *
 * Als Anfang des Pfades geprüft, damit /termin/abc123 genauso erfasst
 * ist wie /termin.
 */
export const AUSGENOMMEN = [
  "/probetermin",
  "/termin",
  "/meine-termine",
  "/aktion",
  "/admin",
  "/impressum",
  "/datenschutz",
  "/agb",
] as const;

export function seiteAusgenommen(pfad: string): boolean {
  return AUSGENOMMEN.some((p) => pfad === p || pfad.startsWith(`${p}/`));
}

/**
 * Darf die Einladung diesem Besucher überhaupt gezeigt werden?
 *
 * Läuft nur im Browser. Wirft nie: In einem privaten Fenster oder bei
 * gesperrten Seitendaten wirft schon der Zugriff auf localStorage, und
 * daran darf keine Seite hängen bleiben.
 */
export function darfErscheinen(pfad: string): boolean {
  if (seiteAusgenommen(pfad)) return false;

  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

    const gemerkt = window.localStorage.getItem(EINLADUNG_SCHLUESSEL);
    if (!gemerkt) return true;

    const bis = Number(gemerkt);
    if (!Number.isFinite(bis)) return true;
    return Date.now() > bis;
  } catch {
    // Kein Zugriff auf die Seitendaten heißt: Wir können uns ein "nein"
    // nicht merken. Dann fragen wir lieber gar nicht erst.
    return false;
  }
}

/** Die Antwort merken - egal ob weggeklickt oder gebucht. */
export function antwortMerken(): void {
  try {
    const bis = Date.now() + RUHE_TAGE * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(EINLADUNG_SCHLUESSEL, String(bis));
  } catch {
    // Nicht schlimm: Dann erscheint sie beim nächsten Besuch noch einmal.
  }
}
