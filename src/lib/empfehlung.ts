import "server-only";
import { prisma } from "@/lib/prisma";
import { codeNormalisieren } from "@/lib/aktionscode";

/**
 * Das Empfehlungsprogramm.
 *
 * Wie es funktioniert: Das Studio legt je Mitglied einen Code an. Der
 * Werbende gibt ihn weiter, der Geworbene trägt ihn ins Anfrageformular
 * ein - in dasselbe Feld wie einen Aktionscode. Damit ist die Zuordnung
 * da, und das Studio sieht im Adminbereich, wem eine Prämie zusteht.
 *
 * Warum kein Kundenkonto: Es gibt keines, und eines nur dafür zu bauen
 * wäre der falsche Weg herum. Ein Code je Mitglied leistet dasselbe und
 * funktioniert ab dem ersten Tag.
 *
 * Warum ein Feld und nicht zwei: Für den, der ihn eingibt, ist es "der
 * Code, den ich bekommen habe". Ihn zwei Felder unterscheiden zu lassen,
 * zwischen denen er nicht wählen kann, wäre eine Hürde ohne Nutzen.
 *
 * Was die Website ausdrücklich NICHT tut: E-Mails im Namen des Werbenden
 * verschicken. Eine "Empfiehl uns weiter"-Mail an eine Adresse, die der
 * Empfänger nie hinterlassen hat, ist unerlaubte Werbung (§ 7 Abs. 2
 * Nr. 2 UWG) - und zwar für uns, nicht für den Werbenden, der auf
 * "Senden" gedrückt hat. Wer empfiehlt, gibt seinen Code selbst weiter,
 * über den Weg, auf dem er ohnehin mit dem anderen redet.
 */

export type GefundeneEmpfehlung = {
  id: string;
  code: string;
  /** Der Vorname des Werbenden - mehr braucht die Bestätigung nicht. */
  werbender: string;
};

/**
 * Nur der Vorname.
 *
 * Im Formular steht danach "Danke - X hat dich empfohlen". Der volle Name
 * wäre an dieser Stelle zu viel: Wer einen Code weitergibt, rechnet nicht
 * damit, dass sein Nachname auf dem Bildschirm eines Dritten erscheint.
 */
export function vorname(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * Einen Code als Empfehlung nachschlagen.
 *
 * Gibt null zurück, wenn es keine ist - der Aufrufer prüft dann weiter
 * (siehe aktionscodePruefen). Ein abgeschalteter Code zählt nicht.
 */
export async function empfehlungNachschlagen(
  roh: string,
): Promise<GefundeneEmpfehlung | null> {
  const code = codeNormalisieren(roh);
  if (!code) return null;

  const treffer = await prisma.empfehlung.findUnique({ where: { code } });
  if (!treffer || !treffer.aktiv) return null;

  return { id: treffer.id, code: treffer.code, werbender: vorname(treffer.name) };
}

/**
 * Ein Codevorschlag aus dem Namen: "Lena Hoffmann" wird zu "LENA-H".
 *
 * Aussprechbar und am Telefon weiterzugeben - darum geht es. Eine
 * zufällige Zeichenfolge wäre eindeutiger, aber niemand diktiert
 * "X7K2P9M" an einen Freund.
 */
export function codeVorschlag(name: string): string {
  const teile = name
    .trim()
    .toUpperCase()
    .replace(/Ä/g, "AE")
    .replace(/Ö/g, "OE")
    .replace(/Ü/g, "UE")
    .replace(/ß/g, "SS")
    .replace(/[^A-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (teile.length === 0) return "";
  if (teile.length === 1) return teile[0].slice(0, 10);
  return `${teile[0].slice(0, 8)}-${teile[teile.length - 1][0]}`;
}

/** Ein Code, den es noch nicht gibt. */
export async function freierCode(wunsch: string, ausser?: string): Promise<string> {
  const basis = codeNormalisieren(wunsch) || "EMPFEHLUNG";

  for (let nummer = 1; nummer < 100; nummer++) {
    const kandidat = nummer === 1 ? basis : `${basis}${nummer}`;
    const belegt = await prisma.empfehlung.findUnique({
      where: { code: kandidat },
      select: { id: true },
    });
    if (!belegt || belegt.id === ausser) return kandidat;
  }

  // Sollte nie eintreten - aber ein Zeitstempel ist immer eindeutig.
  return `${basis}${Date.now().toString(36).toUpperCase()}`;
}
