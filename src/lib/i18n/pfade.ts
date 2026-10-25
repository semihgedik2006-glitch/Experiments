import type { Sprache } from "@/lib/sprache";

/**
 * Deutsche und englische Adressen, Seite für Seite.
 *
 * Die deutschen Adressen bleiben, wie sie sind - sie stehen in Google, in
 * Anzeigen und auf Flyern. Die englische Fassung liegt unter /en, mit
 * englischen Wörtern in der Adresse ("/en/prices" statt "/en/preise"):
 * Wer die Seite auf Englisch liest, soll sie auch auf Englisch teilen
 * können, und Google wertet die Wörter in der Adresse mit.
 *
 * Standorte und Blogartikel behalten ihre Kennung (/en/studios/huerth,
 * /en/blog/<slug>) - Ortsnamen sind Eigennamen, und die Blogkennungen
 * kommen aus dem Adminbereich.
 *
 * Eine Liste für beide Richtungen: Daraus entstehen die Verweise innerhalb
 * einer Sprache (@/components/sprach-link), der Sprachumschalter in der
 * Kopfzeile, die hreflang-Angaben und die Sitemap.
 */
const PAARE: readonly (readonly [de: string, en: string])[] = [
  ["/ziel/ruecken", "/en/goal/back"],
  ["/ziel/straffen", "/en/goal/toning"],
  ["/ziel/abnehmen", "/en/goal/weight-loss"],
  ["/ziel/muskelaufbau", "/en/goal/muscle"],
  ["/ziel/fitness", "/en/goal/fitness"],
  ["/fragen/kosten", "/en/questions/cost"],
  ["/fragen/sicherheit", "/en/questions/safety"],
  ["/fragen/erfahrungen", "/en/questions/reviews"],
  ["/fragen/ruecken", "/en/questions/back"],
  ["/newsletter/abmelden", "/en/newsletter/unsubscribe"],
  ["/ems-training", "/en/ems-training"],
  ["/erster-besuch", "/en/first-visit"],
  ["/studio", "/en/studios"],
  ["/preise", "/en/prices"],
  ["/erfolgsgeschichten", "/en/success-stories"],
  ["/blog", "/en/blog"],
  ["/ueber-uns", "/en/about"],
  ["/kontakt", "/en/contact"],
  ["/probetermin", "/en/book"],
  ["/ziel-check", "/en/goal-check"],
  ["/ziel", "/en/goal"],
  ["/fragen", "/en/questions"],
  ["/socials", "/en/socials"],
  ["/gutschein", "/en/voucher"],
  ["/impressum", "/en/imprint"],
  ["/datenschutz", "/en/privacy"],
  ["/agb", "/en/terms"],
  ["/meine-termine", "/en/my-appointments"],
  ["/termin", "/en/appointment"],
];

/** Teilt "/preise?x=1#y" in Pfad und Rest. */
function teilen(href: string): [string, string] {
  const i = href.search(/[?#]/);
  return i === -1 ? [href, ""] : [href.slice(0, i), href.slice(i)];
}

/** Passt der Pfad auf das Muster - genau oder als Anfang mit "/" dahinter? */
function passt(pfad: string, muster: string): boolean {
  return pfad === muster || pfad.startsWith(`${muster}/`);
}

/**
 * Nur Seitenadressen werden übersetzt: keine Adressen anderer Websites,
 * nicht der Adminbereich, keine Schnittstellen und keine Dateien
 * (/bilder/x.jpg, /llms.txt).
 */
function istSeite(pfad: string): boolean {
  return (
    pfad.startsWith("/") &&
    !pfad.startsWith("//") &&
    !/^\/(admin|api|_next|aktion)(\/|$)/.test(pfad) &&
    !/\.[a-z0-9]+$/i.test(pfad)
  );
}

export function istEnglisch(pfad: string): boolean {
  return pfad === "/en" || pfad.startsWith("/en/");
}

/** Die englische Adresse zu einer deutschen. Schon englische bleiben. */
export function nachEn(href: string): string {
  const [pfad, rest] = teilen(href);
  if (!istSeite(pfad) || istEnglisch(pfad)) return href;
  if (pfad === "/" || pfad === "") return `/en${rest}`;
  for (const [de, en] of PAARE) {
    if (passt(pfad, de)) return en + pfad.slice(de.length) + rest;
  }
  return href;
}

/** Die deutsche Adresse zu einer englischen. Deutsche bleiben. */
export function nachDe(href: string): string {
  const [pfad, rest] = teilen(href);
  if (!istEnglisch(pfad)) return href;
  if (pfad === "/en") return `/${rest}`;
  for (const [de, en] of PAARE) {
    if (passt(pfad, en)) return de + pfad.slice(en.length) + rest;
  }
  return pfad.slice(3) + rest;
}

/** Die Adresse in der gewünschten Sprache. */
export function pfad(sprache: Sprache, href: string): string {
  return sprache === "en" ? nachEn(href) : nachDe(href);
}

/**
 * Für die Metadaten einer Seite: kanonische Adresse in der eigenen Sprache
 * und der Verweis auf die andere Fassung. Ohne diese Angabe hält Google
 * beide Fassungen für zwei Seiten über dasselbe und wertet eine ab.
 *
 * x-default ist die deutsche: Wer weder Deutsch noch Englisch eingestellt
 * hat, ist in Köln eher mit der deutschen Seite bedient.
 */
export function sprachAlternativen(sprache: Sprache, dePfad: string) {
  const de = nachDe(dePfad);
  const en = nachEn(de);
  return {
    canonical: sprache === "en" ? en : de,
    languages: { de, en, "x-default": de },
  };
}
