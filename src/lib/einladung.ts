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

/*
 * WANN IST JEMAND "BEREIT"? - Interesse statt Stoppuhr.
 *
 * Vorher galt: acht Sekunden auf der aktuellen Seite. Das war an zwei
 * Stellen falsch. Die Uhr begann bei jedem Seitenwechsel von vorn - wer
 * eine Minute lang durch vier Seiten gelesen hatte, galt auf der fünften
 * wieder als eben erst angekommen. Und sie lief auch in einem Tab im
 * Hintergrund weiter, den niemand ansah.
 *
 * Jetzt reicht EINES davon:
 *   - 10 Sekunden AKTIVE Zeit im ganzen Besuch - gezählt nur, solange der
 *     Tab sichtbar ist und sich in den letzten 15 Sekunden etwas getan
 *     hat (Scrollen, Maus, Tastatur, Finger). Über Seitenwechsel hinweg.
 *   - oder die zweite angesehene Seite: Wer weiterklickt, interessiert
 *     sich.
 *   - oder ein Drittel der aktuellen Seite gelesen.
 */
export const AKTIVE_SEKUNDEN = 10;
export const LESE_ANTEIL = 1 / 3;
/** Ohne Regung so lange, dann zählt die Zeit nicht mehr als aktiv. */
export const RUHE_NACH_SEKUNDEN = 15;

const AKTIV_ZEIT = "einladung-aktiv-ms";
const SEITEN = "einladung-seiten";

export function aktiveZeitLesen(): number {
  const wert = Number(lesen(AKTIV_ZEIT));
  return Number.isFinite(wert) ? wert : 0;
}
export function aktiveZeitAddieren(ms: number): number {
  const neu = aktiveZeitLesen() + ms;
  try {
    window.sessionStorage.setItem(AKTIV_ZEIT, String(Math.round(neu)));
  } catch {
    // Ohne Speicher zählt eben nur diese Seite.
  }
  return neu;
}
/** Diese Seite als angesehen zählen; gibt die Zahl der Seiten im Besuch zurück. */
export function seiteZaehlen(pfad: string): number {
  try {
    const bisher: string[] = JSON.parse(window.sessionStorage.getItem(SEITEN) ?? "[]");
    if (!bisher.includes(pfad)) bisher.push(pfad);
    window.sessionStorage.setItem(SEITEN, JSON.stringify(bisher.slice(-20)));
    return bisher.length;
  } catch {
    return 1;
  }
}

/**
 * Tippt gerade jemand in ein Formular - oder hat er eins angefangen?
 *
 * Dann kommt keine Einladung dazwischen. Wer im Kontaktformular halb
 * fertig ist und die Maus kurz nach oben bewegt, will nicht gehen - und
 * ein Kasten über seinem halben Text wäre das Gegenteil einer Einladung.
 */
export function formularInArbeit(): boolean {
  const aktiv = document.activeElement;
  if (aktiv instanceof HTMLInputElement || aktiv instanceof HTMLTextAreaElement || aktiv instanceof HTMLSelectElement) {
    return true;
  }
  return [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    "main input:not([type=hidden]):not([type=radio]):not([type=checkbox]), main textarea",
  )].some((feld) => feld.name !== "website" && feld.value.trim().length > 0);
}

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
