/**
 * Welcher Knopf zur Anfrage geführt hat.
 *
 * Die Herkunft (@/lib/herkunft) sagt, woher jemand auf die Website kam.
 * Offen blieb, was ihn auf der Website zum Formular gebracht hat: die
 * Handy-Leiste, das Pop-up, der Ziel-Check, der Knopf oben auf der
 * Startseite? Genau das entscheidet, welche dieser Stellen sich lohnt.
 *
 * Gemerkt wird der zuletzt angetippte Buchungsknopf, für diesen Besuch
 * im sessionStorage - kein Cookie, nichts, was über den Besuch hinaus
 * bleibt. NUR MIT EINWILLIGUNG: Das ist Statistik und keine Funktion, die
 * der Besucher braucht - nach § 25 Abs. 1 TDDDG also nur, wenn im
 * Cookie-Hinweis "Alle akzeptieren" gewählt wurde (Datenschutzerklärung,
 * Abschnitt 7). Mit der Anfrage geht er als ein kurzer Text mit, etwa
 * "Handy-Leiste · /ziel/ruecken".
 *
 * Knöpfe mit einem Attribut data-einstieg tragen ihren Namen selbst.
 * Alle anderen Verweise zum Probetraining werden mit ihrer Beschriftung
 * gemerkt - so fehlt auch ein später hinzugekommener Knopf nicht.
 */

import { readConsent } from "@/lib/consent";

const SPEICHER = "kf-einstieg";

/** Was als Buchungsknopf zählt. */
export const EINSTIEG_KNOEPFE = '[data-einstieg], a[href^="/probetermin"], a[href="#termin"]';

export function einstiegMerken(knopf: Element): void {
  if (readConsent() !== "accepted") return;
  const name =
    knopf.getAttribute("data-einstieg") ||
    `Knopf "${(knopf.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40)}"`;
  try {
    sessionStorage.setItem(SPEICHER, `${name} · ${window.location.pathname}`.slice(0, 120));
  } catch {
    // Ohne Speicher eben ohne diese Angabe.
  }
}

export function einstiegLesen(): string {
  try {
    return sessionStorage.getItem(SPEICHER) ?? "";
  } catch {
    return "";
  }
}
