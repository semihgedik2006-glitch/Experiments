import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

/**
 * Der eigene Terminbereich - ohne Konto, ohne Passwort.
 *
 * Warum kein Konto: Wer ein Probetraining anfragt, will einen Termin und
 * kein Konto. Ein Passwort wäre eine zusätzliche Hürde vor Inhalten, die
 * ausschließlich aus den eigenen Terminen bestehen - und ein weiteres
 * Passwort, das irgendwo aufgeschrieben wird. Stattdessen: Adresse
 * eingeben, Link im Postfach, drin. Wer an das Postfach kommt, kommt bei
 * jedem Konto auch ans Passwort ("neues Passwort anfordern") - das
 * Postfach ist die eigentliche Tür, hier wie dort.
 *
 * Was diesen Weg trotzdem tragfähig macht:
 *
 * 1. IN DER DATENBANK LIEGT NUR DER ABDRUCK. Wer sie liest, kann keinen
 *    gültigen Link bauen.
 * 2. DER LINK LÄUFT AB. Ein Link, der Monate später noch funktioniert,
 *    ist ein offenes Fenster in einem weitergegebenen Postfach.
 * 3. DIE ANFORDERUNG VERRÄT NICHTS. Sie antwortet immer gleich - sonst
 *    wäre das Formular eine Auskunft darüber, wer hier Kunde ist.
 * 4. NICHTS ÄNDERBARES OHNE ZWEITEN SCHLÜSSEL. Der Bereich ZEIGT
 *    Termine. Absagen und Verlegen laufen weiterhin über den Link zum
 *    einzelnen Termin - siehe unten.
 */

/** Wie lange ein angeforderter Link gilt. */
export const GUELTIG_MINUTEN = 30;

/**
 * Wie viele Links je Adresse und Stunde.
 *
 * Nicht gegen Angreifer gerichtet - die kennen die Adresse ohnehin -,
 * sondern gegen den Fall, dass jemand fremde Adressen eintippt und deren
 * Postfächer zumüllt.
 */
export const MAX_PRO_ADRESSE_PRO_STUNDE = 4;

/** Immer klein und ohne Leerzeichen: "Max@..." und "max@..." sind einer. */
export function emailNormalisieren(roh: string): string {
  return roh.trim().toLowerCase();
}

/** Sieht eine Adresse überhaupt nach einer Adresse aus? */
export function emailPlausibel(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 200;
}

/** 32 zufällige Bytes. Nicht aus der Kennung abgeleitet, nicht zählbar. */
function neuerSchluessel(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Der Abdruck. SHA-256 ohne Streuwert, anders als bei einem Passwort -
 * und das ist hier richtig: Der Schlüssel ist selbst schon 32 zufällige
 * Bytes. Gegen so etwas hilft keine Wörterbuchliste, gegen die ein
 * Streuwert schützen würde, und ein langsames Verfahren wäre nur bei
 * jedem Seitenaufruf langsam.
 */
function abdruck(schluessel: string): string {
  return createHash("sha256").update(schluessel).digest("hex");
}

export function zugangsLink(schluessel: string): string {
  return `${siteConfig.url}/meine-termine/${schluessel}`;
}

/**
 * Einen Zugang anlegen und den Schlüssel zurückgeben.
 *
 * Der Schlüssel verlässt diese Funktion genau einmal - er wandert direkt
 * in die E-Mail und wird nirgends sonst festgehalten. `null` heißt: zu
 * viele Anforderungen für diese Adresse.
 */
export async function zugangErstellen(email: string): Promise<string | null> {
  const seitEinerStunde = new Date(Date.now() - 60 * 60 * 1000);
  const zuletzt = await prisma.kundenzugang.count({
    where: { email, createdAt: { gte: seitEinerStunde } },
  });
  if (zuletzt >= MAX_PRO_ADRESSE_PRO_STUNDE) return null;

  const schluessel = neuerSchluessel();
  await prisma.kundenzugang.create({
    data: {
      email,
      tokenHash: abdruck(schluessel),
      ablaufAm: new Date(Date.now() + GUELTIG_MINUTEN * 60 * 1000),
    },
  });

  return schluessel;
}

export type GeprueferZugang = { email: string; ablaufAm: Date };

/**
 * Einen Schlüssel aus der Adresszeile prüfen.
 *
 * Gesucht wird über den Abdruck, nicht über den Schlüssel - der steht
 * nirgends. Der anschließende Vergleich läuft trotzdem zeitunabhängig:
 * Die Datenbank hat zwar schon entschieden, aber der Vergleich kostet
 * nichts und die Gewohnheit ist an dieser Stelle mehr wert als die
 * gesparte Zeile.
 */
export async function zugangPruefen(schluessel: string): Promise<GeprueferZugang | null> {
  const sauber = schluessel.trim();
  // Grober Rahmen vorab: Alles andere ist kein Schlüssel von uns und
  // muss die Datenbank nicht behelligen.
  if (!sauber || sauber.length < 20 || sauber.length > 100) return null;

  const gesucht = abdruck(sauber);
  const zugang = await prisma.kundenzugang.findUnique({
    where: { tokenHash: gesucht },
    select: { id: true, email: true, ablaufAm: true, tokenHash: true, geoeffnetAm: true },
  });
  if (!zugang) return null;

  const a = Buffer.from(zugang.tokenHash);
  const b = Buffer.from(gesucht);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  if (zugang.ablaufAm <= new Date()) return null;

  // Nur beim ersten Mal vermerken. Das beantwortet "ist die Mail
  // angekommen?", ohne bei jedem Neuladen zu schreiben.
  if (!zugang.geoeffnetAm) {
    await prisma.kundenzugang
      .update({ where: { id: zugang.id }, data: { geoeffnetAm: new Date() } })
      .catch(() => {});
  }

  return { email: zugang.email, ablaufAm: zugang.ablaufAm };
}

/**
 * Abgelaufene Zugänge wegräumen - für den täglichen Lauf.
 *
 * Nicht sofort beim Ablaufen: Ein Eintrag, der noch eine Weile dasteht,
 * lässt die Frage "wurde der Link überhaupt geöffnet?" beantworten. Nach
 * einem Tag ist auch die beantwortet.
 */
export async function alteZugaengeLoeschen(): Promise<number> {
  const grenze = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weg = await prisma.kundenzugang.deleteMany({
    where: { ablaufAm: { lt: grenze } },
  });
  return weg.count;
}
