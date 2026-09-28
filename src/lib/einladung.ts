/**
 * Wann die Einladungen zum Probetraining erscheinen dürfen.
 *
 * Zwei Einladungen:
 *
 * - AUSSTIEG: der große Kasten, wenn jemand im Begriff ist zu gehen.
 * - MITTE: eine kleine Karte, die unten hereinfährt, sobald jemand die
 *   Hälfte einer Seite gelesen hat - mit einer Anmeldung direkt darin.
 *
 * DIE REGELN, UND WARUM:
 *
 * 1. Bei jedem Besuch - aber je Besuch nur einmal. Früher galt ein
 *    "Nein" dreißig Tage lang; auf Wunsch erscheinen beide jetzt bei
 *    jedem neuen Besuch wieder. Innerhalb eines Besuchs aber nur einmal:
 *    Wer durch fünf Seiten klickt, sieht sie nicht fünfmal. Gemerkt wird
 *    das in sessionStorage, das der Browser beim Schließen des Tabs
 *    selbst vergisst.
 *
 * 2. Niemals sofort. Wer eben erst angekommen ist, hat nichts gesehen,
 *    wovon man ihn abhalten könnte.
 *
 * 3. Nie dort, wo es unsinnig wäre - auf der Buchungsseite, der
 *    persönlichen Terminseite, im eigenen Terminbereich, auf den
 *    Kampagnenseiten und im Rechtlichen.
 *
 * 4. Nie bei jemandem, der in diesem Besuch schon angefragt hat.
 *
 * "Bewegung reduzieren" blendet die Einladungen NICHT mehr aus - diese
 * Einstellung betrifft Bewegung, nicht Inhalt. Sie erscheinen dann
 * einfach ohne Animation (siehe globals.css).
 *
 * Nichts davon verlässt den Browser: kein Zähler auf dem Server, keine
 * Kennung, nichts, was jemanden wiedererkennbar macht.
 */

export type Einladung = "ausstieg" | "mitte";

const SCHLUESSEL: Record<Einladung, string> = {
  ausstieg: "einladung-ausstieg",
  mitte: "einladung-mitte",
};

/** Gesetzt, sobald in diesem Besuch eine Anfrage abgeschickt wurde. */
const GEBUCHT = "einladung-gebucht";

/** Wie lange jemand mindestens auf der Seite sein muss (Ausstieg). */
export const MINDEST_SEKUNDEN = 8;

/** Ab welchem Anteil gelesener Seite die Karte in der Mitte kommt. */
export const MITTE_ANTEIL = 0.5;

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

/** sessionStorage ohne Absturz - im privaten Fenster kann schon der Zugriff werfen. */
function lesen(schluessel: string): string | null {
  try {
    return window.sessionStorage.getItem(schluessel);
  } catch {
    return null;
  }
}
function schreiben(schluessel: string): void {
  try {
    window.sessionStorage.setItem(schluessel, "1");
  } catch {
    // Dann kann es in diesem Besuch ein zweites Mal kommen - nicht schlimm.
  }
}

export function darfErscheinen(welche: Einladung, pfad: string): boolean {
  if (seiteAusgenommen(pfad)) return false;
  if (lesen(GEBUCHT)) return false;
  return !lesen(SCHLUESSEL[welche]);
}

/** Diese Einladung ist für diesen Besuch erledigt - gezeigt, weggeklickt oder genutzt. */
export function erledigt(welche: Einladung): void {
  schreiben(SCHLUESSEL[welche]);
}

/** Es wurde angefragt - beide Einladungen schweigen für den Rest des Besuchs. */
export function gebuchtMerken(): void {
  schreiben(GEBUCHT);
}
