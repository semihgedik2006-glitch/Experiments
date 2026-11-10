import { createHash, createPublicKey, verify } from "node:crypto";

/**
 * Zugang für Nox, Semihs persönlichen Assistenten.
 *
 * Nox meldet sich mit einer Ed25519-Signatur, nicht mit einem geteilten
 * Passwort: Hier liegt nur sein öffentlicher Schlüssel (NOX_PUBLIC_KEY,
 * 32 Byte als Base64). Der private Schlüssel verlässt Nox nie. Wer die
 * Umgebungsvariablen dieser Seite liest, kann sich damit nicht als Nox
 * ausgeben.
 *
 * Unterschrieben wird "zeit\nMETHODE\npfad?suche\nsha256(body)". Älter als
 * fünf Minuten wird abgewiesen.
 */

export const NOX_MAX_ALTER_MS = 5 * 60 * 1000;

export function noxText(zeit: string, methode: string, pfad: string, body: string): string {
  const hash = createHash("sha256").update(body).digest("hex");
  return `${zeit}\n${methode.toUpperCase()}\n${pfad}\n${hash}`;
}

export function noxSignaturPruefen(opts: {
  oeffentlich: string | undefined;
  zeit: string | null;
  signatur: string | null;
  methode: string;
  pfad: string;
  body: string;
  jetzt?: number;
}): boolean {
  const { oeffentlich, zeit, signatur, methode, pfad, body } = opts;
  if (!oeffentlich || !zeit || !signatur || !/^\d{10,16}$/.test(zeit)) return false;
  const jetzt = opts.jetzt ?? Date.now();
  if (Math.abs(jetzt - Number(zeit)) > NOX_MAX_ALTER_MS) return false;
  try {
    const roh = Buffer.from(oeffentlich.trim(), "base64");
    if (roh.length !== 32) return false;
    const schluessel = createPublicKey({
      key: { kty: "OKP", crv: "Ed25519", x: roh.toString("base64url") },
      format: "jwk",
    });
    const sig = Buffer.from(signatur, "base64");
    if (sig.length !== 64) return false;
    return verify(null, Buffer.from(noxText(zeit, methode, pfad, body)), schluessel, sig);
  } catch {
    return false;
  }
}

/** Mailadressen und Telefonnummern aus Fehlermeldungen entfernen. */
export function ohnePersonendaten(text: string | null | undefined): string {
  return String(text ?? "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[Mail]")
    .replace(/(?:\+|\b0)\d[\d\s/-]{6,}\d/g, "[Nummer]")
    .slice(0, 300);
}

/** Beginn des heutigen Tages in Köln als Zeitpunkt. */
export function tagesbeginnKoeln(jetzt: Date): Date {
  const tag = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(jetzt);
  const mitternachtUtc = new Date(`${tag}T00:00:00Z`);
  const stunde = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hourCycle: "h23" }).format(
      mitternachtUtc,
    ),
  );
  return new Date(mitternachtUtc.getTime() - stunde * 3_600_000);
}

/** Kurze, nicht erratbare Kennung für eine Anfrage, ohne Bezug zur Person. */
export function kurzKennung(id: string): string {
  return id.slice(-6);
}
