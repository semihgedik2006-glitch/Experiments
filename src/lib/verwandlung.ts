/**
 * Regeln für Vorher-Nachher-Bilder.
 *
 * Warum das hier steht und nicht in der Serveraktion: Dieselben Regeln
 * entscheiden an drei Stellen - die Aktion, die beim Speichern abweist;
 * die Adminliste, die erklärt, warum ein Eintrag nicht erscheint; und die
 * öffentliche Seite, die nur zeigt, was durchgekommen ist. Stünden sie
 * dreimal da, wären sie nach der ersten Änderung dreimal verschieden.
 *
 * Es sind zwei Regeln, und sie haben nichts miteinander zu tun:
 *
 * 1. OHNE EINWILLIGUNG KEIN BILD. Ein Foto, auf dem ein Mensch erkennbar
 *    ist, braucht dessen Einwilligung (§ 22 KUG, Art. 6 Abs. 1 lit. a
 *    DSGVO). Bei einem Vorher-Nachher-Bild in Trainingskleidung ist das
 *    keine Formsache. Fehlt das Datum, wird der Eintrag nicht
 *    veröffentlicht - die Aktion setzt "aktiv" zurück, es genügt nicht,
 *    ihn in der Anzeige zu überspringen.
 *
 * 2. OHNE ZEITRAUM UND ZUSAMMENHANG KEIN BILD. Ein Bildpaar behauptet
 *    etwas, ohne einen Satz zu sagen. Vier Kilo in vier Wochen sind etwas
 *    anderes als vier Kilo in einem Jahr, und wer nebenher die Ernährung
 *    umgestellt hat, verdankt das Ergebnis nicht allein dem Training.
 *    Fehlen diese Angaben, ist es Werbung mit einem Ergebnis, das so
 *    niemand erwarten kann (§ 5 UWG).
 */

/** Was zum Prüfen gebraucht wird - mehr fragt keine der Regeln ab. */
export type VerwandlungPruefbar = {
  name: string;
  zeitraum: string;
  kontext: string;
  vorherUrl: string;
  nachherUrl: string;
  einwilligungAm: Date | null;
};

/**
 * Was einer Veröffentlichung im Weg steht - als Klartext, in der
 * Reihenfolge, in der es jemand abarbeiten würde. Leere Liste heißt: Der
 * Eintrag darf erscheinen.
 */
export function veroeffentlichungsHindernisse(eintrag: VerwandlungPruefbar): string[] {
  const offen: string[] = [];

  if (!eintrag.einwilligungAm) {
    offen.push("Die Einwilligung der abgebildeten Person ist nicht dokumentiert.");
  }
  if (!eintrag.vorherUrl.trim() || !eintrag.nachherUrl.trim()) {
    offen.push("Es fehlt eines der beiden Bilder.");
  }
  if (!eintrag.zeitraum.trim()) {
    offen.push("Der Zeitraum fehlt - ohne ihn sagt das Bildpaar nichts aus.");
  }
  if (!eintrag.kontext.trim()) {
    offen.push("Es fehlt die Angabe, was die Person sonst getan hat.");
  }
  if (!eintrag.name.trim()) {
    offen.push("Es fehlt der Vorname.");
  }

  return offen;
}

/** Kurzform für die Stellen, die nur ja oder nein brauchen. */
export function darfErscheinen(eintrag: VerwandlungPruefbar): boolean {
  return veroeffentlichungsHindernisse(eintrag).length === 0;
}

/**
 * Der Pflichthinweis unter den Bildern.
 *
 * Er steht fest im Code und nicht in der Datenbank: Ein Hinweis, den
 * jemand im Adminbereich kürzen kann, ist ein Hinweis, der irgendwann
 * gekürzt wird. Inhaltlich verlangt ihn § 11 Abs. 1 Satz 1 Nr. 11 HWG
 * dem Sinn nach und § 5 UWG der Sache nach: Ein einzelnes Ergebnis darf
 * nicht so dastehen, als sei es das übliche.
 */
export const ERGEBNIS_HINWEIS =
  "Die gezeigten Ergebnisse sind Einzelfälle und keine zugesicherte Wirkung. " +
  "Wie sich Training auswirkt, hängt von Ausgangslage, Ernährung, Schlaf und " +
  "Regelmäßigkeit ab und ist bei jedem Menschen anders.";

/** Grenzen der Felder. Was darüber hinausgeht, liest ohnehin niemand. */
export const GRENZEN = {
  name: 40,
  zeitraum: 80,
  kontext: 160,
  text: 400,
  vorherUrl: 500,
  nachherUrl: 500,
  einwilligungForm: 60,
  einwilligungNotiz: 200,
} as const;

/**
 * Die Formen, in denen eine Einwilligung vorliegen kann.
 *
 * Eine feste Auswahl statt eines Freitextfelds: Beim Nachweis zählt, dass
 * die Angabe in allen Einträgen dasselbe bedeutet. "mündlich" fehlt
 * absichtlich - was niemand vorzeigen kann, ist kein Nachweis.
 */
export const EINWILLIGUNG_FORMEN = [
  "schriftlich unterschrieben",
  "per E-Mail bestätigt",
  "im Vertrag mit unterzeichnet",
] as const;
