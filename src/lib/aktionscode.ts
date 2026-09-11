import "server-only";
import { prisma } from "@/lib/prisma";
import { empfehlungNachschlagen, type GefundeneEmpfehlung } from "@/lib/empfehlung";

/**
 * Aktionscodes aus Anzeigen, Flyern und Kooperationen.
 *
 * Ein unbekannter oder abgelaufener Code wird beim Absenden abgewiesen,
 * statt stillschweigend übergangen zu werden. Der Grund ist nicht
 * Strenge, sondern der Ablauf danach: Wer mit einem Code anfragt, kommt
 * mit einer Erwartung ins Studio. Erfährt er dort zum ersten Mal, dass
 * der Code nicht gilt, ist das Gespräch verdorben - und die
 * Studioleitung steht mit einer Sache da, von der sie nichts wusste.
 * Ein Tippfehler lässt sich dagegen in fünf Sekunden korrigieren.
 *
 * Bewusst ohne Prüfung während des Tippens: Ein Weg, der auf Zuruf
 * "kennen wir / kennen wir nicht" antwortet, ist auch ein Weg, an dem
 * sich Codes durchprobieren lassen. Beim Absenden gilt die
 * Zugriffsbegrenzung des Formulars - fünf Anfragen je Stunde -, und damit
 * lohnt das Durchprobieren nicht.
 */

/** "sommer 26" und "SOMMER26" sind derselbe Code. */
export function codeNormalisieren(roh: string): string {
  return roh.trim().toUpperCase().replace(/\s+/g, "");
}

export type GefundeneAktion = {
  id: string;
  code: string;
  label: string;
  benefit: string | null;
};

export type CodePruefung =
  /**
   * Kein Code angegeben oder ein gültiger. Genau eines von beiden ist
   * dann gesetzt: ein Code ist entweder eine Aktion aus einer Anzeige
   * oder eine Empfehlung von einem Mitglied, nie beides.
   */
  | { ok: true; aktion: GefundeneAktion | null; empfehlung: GefundeneEmpfehlung | null }
  | { ok: false; meldung: string };

function alsDatum(datum: Date): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(datum);
}

export async function aktionscodePruefen(roh: string): Promise<CodePruefung> {
  const code = codeNormalisieren(roh);
  // Das Feld ist freiwillig. Kein Code heißt: keine Aktion, kein Fehler.
  if (!code) return { ok: true, aktion: null, empfehlung: null };

  // Erst als Empfehlung nachschlagen, dann als Aktion. Beide Arten teilen
  // sich dasselbe Feld im Formular und damit denselben Namensraum; ein
  // Code kann nicht beides sein, weil er in beiden Tabellen eindeutig ist
  // und das Studio ihn jeweils selbst vergibt.
  const empfehlung = await empfehlungNachschlagen(code);
  if (empfehlung) return { ok: true, aktion: null, empfehlung };

  const aktion = await prisma.promotion.findUnique({ where: { code } });
  if (!aktion) {
    // "Code" und nicht "Aktionscode": An dieser Stelle steht noch nicht
    // fest, was der Eingebende gemeint hat - ein Tippfehler kann beides
    // gewesen sein.
    return {
      ok: false,
      meldung: `Den Code „${code}“ kennen wir nicht. Prüf bitte die Schreibweise - oder lass das Feld einfach leer.`,
    };
  }

  if (!aktion.active) {
    return { ok: false, meldung: `Der Aktionscode „${code}“ ist nicht mehr gültig.` };
  }

  const jetzt = new Date();
  if (aktion.validFrom && jetzt < aktion.validFrom) {
    return {
      ok: false,
      meldung: `Der Aktionscode „${code}“ gilt erst ab dem ${alsDatum(aktion.validFrom)}.`,
    };
  }
  // Der letzte Tag zählt mit: Ein Code "gültig bis 31.08." soll am 31.08.
  // um 20 Uhr noch funktionieren.
  if (aktion.validUntil) {
    const endeDesTages = new Date(aktion.validUntil);
    endeDesTages.setHours(23, 59, 59, 999);
    if (jetzt > endeDesTages) {
      return {
        ok: false,
        meldung: `Der Aktionscode „${code}“ ist am ${alsDatum(aktion.validUntil)} abgelaufen.`,
      };
    }
  }

  return {
    ok: true,
    aktion: { id: aktion.id, code: aktion.code, label: aktion.label, benefit: aktion.benefit },
    empfehlung: null,
  };
}
