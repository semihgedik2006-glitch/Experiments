/**
 * Newsletter - Abmeldung und der Fuß unter jeder Ausgabe.
 *
 * Die wichtigste Entscheidung hier ist eine rechtliche: Der Abmeldelink
 * und die Absenderangabe werden NICHT vom Text abhängig gemacht, den
 * jemand im Adminbereich tippt, sondern hier angehängt. Wäre der Fuß Teil
 * des Entwurfs, ginge er beim ersten Mal verloren, an dem jemand eine
 * Ausgabe aus einem Textprogramm hineinkopiert - und ein Newsletter ohne
 * funktionierende Abmeldung ist eine Abmahnung (§ 7 Abs. 2 Nr. 4 UWG,
 * Art. 21 Abs. 2 DSGVO).
 *
 * Aus demselben Grund steht der Absender darunter: Auch eine Werbe-E-Mail
 * muss erkennen lassen, wer sie verschickt (§ 6 Abs. 1 TDDDG, § 5 DDG).
 */

import { randomBytes } from "crypto";
import { legalConfig } from "@/lib/legal-config";
import { siteConfig } from "@/lib/site-config";

/**
 * Der Schlüssel für den Abmeldelink.
 *
 * 32 Byte als Hex, also 64 Zeichen - dieselbe Länge wie der
 * Verwaltungsschlüssel an einer Buchung. Nicht erratbar und ohne Bezug zur
 * Kennung: Wer den Link hat, meldet genau diese eine Adresse ab.
 */
export function neuerAbmeldeSchluessel(): string {
  return randomBytes(32).toString("hex");
}

export function abmeldeLink(token: string): string {
  return `${siteConfig.url}/newsletter/abmelden/${token}`;
}

/**
 * Der Fuß unter jeder Ausgabe.
 *
 * Bewusst nüchtern und ohne Werbung: Wer bis hierher liest, sucht
 * entweder die Abmeldung oder die Absenderangabe. Beides soll er ohne
 * Suchen finden.
 */
export function newsletterFuss(token: string): string {
  const anschrift = [
    legalConfig.companyName,
    legalConfig.owner,
    `${legalConfig.address.street}, ${legalConfig.address.postalCode} ${legalConfig.address.city}`,
  ].join(" | ");

  return `--
Du bekommst diese E-Mail, weil du dich auf ${siteConfig.url} für unseren
Newsletter eingetragen hast.

Nicht mehr erwünscht? Hier abmelden, ein Klick genügt:
${abmeldeLink(token)}

${anschrift}`;
}

/** Der fertige Text einer Ausgabe: Entwurf plus Fuß. */
export function newsletterText(entwurf: string, token: string): string {
  return `${entwurf.trimEnd()}

${newsletterFuss(token)}`;
}

/**
 * Was der Adminbereich als Vorschau zeigt.
 *
 * Mit einem Beispielschlüssel, damit im Entwurf sichtbar ist, dass der Fuß
 * mitgeht - ohne dass dafür schon ein Abonnent ausgewählt sein müsste.
 */
export const BEISPIEL_SCHLUESSEL = "beispiel-schluessel-nur-fuer-die-vorschau";

/**
 * Grenzen für eine Ausgabe.
 *
 * Der Betreff: Was über etwa 70 Zeichen hinausgeht, schneiden die meisten
 * Postfächer ohnehin ab. Abgewiesen wird trotzdem erst weit darüber - eine
 * Ausgabe an einem zu langen Betreff scheitern zu lassen wäre albern.
 */
export const BETREFF_MAX = 200;
export const TEXT_MAX = 20000;

export type EntwurfEingabe = { betreff: string; text: string };

/** Prüft einen Entwurf. Gibt die Fehlermeldung zurück, oder null. */
export function entwurfPruefen({ betreff, text }: EntwurfEingabe): string | null {
  if (!betreff.trim()) return "Bitte gib einen Betreff ein.";
  if (betreff.length > BETREFF_MAX) return `Der Betreff darf höchstens ${BETREFF_MAX} Zeichen haben.`;
  if (!text.trim()) return "Bitte schreib einen Text.";
  if (text.length > TEXT_MAX) return `Der Text darf höchstens ${TEXT_MAX} Zeichen haben.`;
  return null;
}
