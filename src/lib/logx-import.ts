import { inflateRawSync } from "zlib";

/**
 * Die Adressliste aus LogX lesen.
 *
 * LogX exportiert unter Einstellungen -> Funktionen -> Export alle Adressen
 * als Excel- oder CSV-Datei. Beides wird hier angenommen, ohne zusätzliche
 * Bibliothek: Eine Excel-Datei ist ein ZIP-Archiv mit ein paar XML-Dateien,
 * und mehr als die erste Tabelle braucht es nicht.
 *
 * WAS ÜBERNOMMEN WIRD - und was nicht:
 *
 * Übernommen: Kundennummer, Vorname, Nachname, E-Mail, Status, Newsletter.
 * Mehr braucht es nicht, um jemandem zum Jubiläum zu gratulieren.
 *
 * Nicht übernommen, auch wenn die Spalten in der Datei stehen:
 * Trainingsziel, Trainingsnotiz (die Anamnese), Körpergröße, Interne Notiz,
 * Geburtstag, Anschrift, Bankdaten, Krankenkasse. Das sind entweder
 * Gesundheitsdaten (Art. 9 DSGVO) oder Angaben, für die die Website keinen
 * Zweck hat. Sie bleiben in LogX, wo sie hingehören.
 */

export type LogxZeile = {
  logxNummer: string;
  vorname: string;
  nachname: string;
  email: string | null;
  /** "Mitglied", "Ehemaliges Mitglied", "Interessent", ... */
  status: string;
  newsletter: boolean;
};

export type LogxErgebnis =
  | {
      ok: true;
      zeilen: LogxZeile[];
      /** Zeilen ohne Kundennummer oder Namen - sie lassen sich nicht zuordnen. */
      unbrauchbar: number;
      /** Spalten, die in der Datei stehen und bewusst liegen bleiben. */
      ignoriert: string[];
    }
  | { ok: false; grund: string };

/** Spalten, die nie übernommen werden - für die Rückmeldung nach dem Import. */
const BEWUSST_IGNORIERT = [
  "Trainingsziel",
  "Trainingsnotiz",
  "Körpergröße",
  "Interne Notiz",
  "Termin-/Trainingshinweis",
  "Geburtstag",
  "Krankenkasse",
  "SEPA-Mandatsreferenz",
];

function schluessel(kopf: string): string {
  return kopf
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}

const SPALTEN: Record<keyof LogxZeile, string[]> = {
  logxNummer: ["kundennummer", "kundennr", "nummer"],
  vorname: ["vorname"],
  nachname: ["nachname", "name"],
  email: ["email", "emailadresse", "mail"],
  status: ["status"],
  newsletter: ["newsletter"],
};

/** Aus einer Tabelle (erste Zeile = Spaltennamen) die Zeilen machen. */
export function tabelleAuswerten(tabelle: string[][]): LogxErgebnis {
  const [kopf, ...rest] = tabelle;
  if (!kopf || kopf.length === 0) return { ok: false, grund: "Die Datei ist leer." };

  const index = (feld: keyof LogxZeile) => {
    const namen = SPALTEN[feld];
    return kopf.findIndex((k) => namen.includes(schluessel(k)));
  };

  const spalte = {
    logxNummer: index("logxNummer"),
    vorname: index("vorname"),
    nachname: index("nachname"),
    email: index("email"),
    status: index("status"),
    newsletter: index("newsletter"),
  };

  if (spalte.logxNummer < 0 || spalte.nachname < 0 || spalte.status < 0) {
    return {
      ok: false,
      grund:
        "In der Datei fehlen die Spalten „Kundennummer“, „Nachname“ oder „Status“. Ist das der Adressen-Export aus LogX?",
    };
  }

  const wert = (zeile: string[], i: number) => (i >= 0 ? (zeile[i] ?? "").trim() : "");

  const zeilen: LogxZeile[] = [];
  let unbrauchbar = 0;
  for (const zeile of rest) {
    if (zeile.every((zelle) => !zelle?.trim())) continue;
    const logxNummer = wert(zeile, spalte.logxNummer);
    const nachname = wert(zeile, spalte.nachname);
    if (!logxNummer || !nachname) {
      unbrauchbar++;
      continue;
    }
    const email = wert(zeile, spalte.email).toLowerCase();
    zeilen.push({
      logxNummer,
      vorname: wert(zeile, spalte.vorname),
      nachname,
      // Eine Adresse ohne @ ist ein Tippfehler in LogX, keine Adresse.
      email: email.includes("@") ? email : null,
      status: wert(zeile, spalte.status),
      newsletter: schluessel(wert(zeile, spalte.newsletter)) === "ja",
    });
  }

  const vorhanden = new Set(kopf.map(schluessel));
  const ignoriert = BEWUSST_IGNORIERT.filter((name) => vorhanden.has(schluessel(name)));

  return { ok: true, zeilen, unbrauchbar, ignoriert };
}

/* ------------------------------------------------------------------ */
/* CSV                                                                 */
/* ------------------------------------------------------------------ */

/**
 * CSV lesen - mit Anführungszeichen, Zeilenumbrüchen in Feldern und dem
 * Trennzeichen, das gerade benutzt wird. Deutsche Programme nehmen meist
 * ein Semikolon, weil das Komma schon in Zahlen steht.
 */
export function csvLesen(text: string): string[][] {
  const ohneBom = text.replace(/^﻿/, "");
  const ersteZeile = ohneBom.split(/\r?\n/, 1)[0] ?? "";
  const trenner = [";", ",", "\t"].reduce((best, zeichen) =>
    ersteZeile.split(zeichen).length > ersteZeile.split(best).length ? zeichen : best,
  );

  const zeilen: string[][] = [];
  let zeile: string[] = [];
  let feld = "";
  let inAnfuehrung = false;

  for (let i = 0; i < ohneBom.length; i++) {
    const z = ohneBom[i];
    if (inAnfuehrung) {
      if (z === '"' && ohneBom[i + 1] === '"') {
        feld += '"';
        i++;
      } else if (z === '"') {
        inAnfuehrung = false;
      } else {
        feld += z;
      }
    } else if (z === '"') {
      inAnfuehrung = true;
    } else if (z === trenner) {
      zeile.push(feld);
      feld = "";
    } else if (z === "\n" || z === "\r") {
      if (z === "\r" && ohneBom[i + 1] === "\n") i++;
      zeile.push(feld);
      zeilen.push(zeile);
      zeile = [];
      feld = "";
    } else {
      feld += z;
    }
  }
  if (feld || zeile.length) {
    zeile.push(feld);
    zeilen.push(zeile);
  }
  return zeilen;
}

/* ------------------------------------------------------------------ */
/* Excel (.xlsx)                                                       */
/* ------------------------------------------------------------------ */

/** Die Dateien eines ZIP-Archivs, über das zentrale Verzeichnis gelesen. */
function zipEintraege(daten: Buffer): Map<string, Buffer> {
  const eintraege = new Map<string, Buffer>();

  // Das Ende des zentralen Verzeichnisses steht in den letzten Bytes;
  // davor kann höchstens ein Kommentar von bis zu 64 KB liegen.
  let ende = -1;
  for (let i = daten.length - 22; i >= Math.max(0, daten.length - 22 - 65535); i--) {
    if (daten.readUInt32LE(i) === 0x06054b50) {
      ende = i;
      break;
    }
  }
  if (ende < 0) throw new Error("Keine gültige Excel-Datei.");

  const anzahl = daten.readUInt16LE(ende + 10);
  let pos = daten.readUInt32LE(ende + 16);

  for (let n = 0; n < anzahl; n++) {
    if (daten.readUInt32LE(pos) !== 0x02014b50) throw new Error("Beschädigte Excel-Datei.");
    const methode = daten.readUInt16LE(pos + 10);
    const groesse = daten.readUInt32LE(pos + 20);
    const nameLaenge = daten.readUInt16LE(pos + 28);
    const extraLaenge = daten.readUInt16LE(pos + 30);
    const kommentarLaenge = daten.readUInt16LE(pos + 32);
    const lokal = daten.readUInt32LE(pos + 42);
    const name = daten.toString("utf8", pos + 46, pos + 46 + nameLaenge);

    const start =
      lokal + 30 + daten.readUInt16LE(lokal + 26) + daten.readUInt16LE(lokal + 28);
    const roh = daten.subarray(start, start + groesse);
    if (methode === 0) eintraege.set(name, roh);
    else if (methode === 8) eintraege.set(name, inflateRawSync(roh));

    pos += 46 + nameLaenge + extraLaenge + kommentarLaenge;
  }

  return eintraege;
}

function xmlText(roh: string): string {
  return roh
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&");
}

function alleTexte(xml: string): string {
  return [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => xmlText(m[1])).join("");
}

function spaltenIndex(zelle: string): number {
  const buchstaben = zelle.replace(/[0-9]/g, "");
  let index = 0;
  for (const b of buchstaben) index = index * 26 + (b.charCodeAt(0) - 64);
  return index - 1;
}

/** Die erste Tabelle einer Excel-Datei als Zeilen aus Text. */
export function xlsxLesen(daten: Buffer): string[][] {
  const dateien = zipEintraege(daten);

  const geteilt = dateien.get("xl/sharedStrings.xml")?.toString("utf8") ?? "";
  const texte = [...geteilt.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => alleTexte(m[1]));

  const blattName =
    [...dateien.keys()].filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0];
  const blatt = blattName ? dateien.get(blattName)?.toString("utf8") : undefined;
  if (!blatt) throw new Error("Die Excel-Datei enthält keine Tabelle.");

  const zeilen: string[][] = [];
  for (const zeile of blatt.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const werte: string[] = [];
    for (const zelle of zeile[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attribute = zelle[1];
      const inhalt = zelle[2] ?? "";
      const ref = /\br="([A-Z]+)\d+"/.exec(attribute)?.[1];
      const typ = /\bt="([^"]+)"/.exec(attribute)?.[1];
      const v = /<v>([\s\S]*?)<\/v>/.exec(inhalt)?.[1];

      let text = "";
      if (typ === "s" && v !== undefined) text = texte[Number(v)] ?? "";
      else if (typ === "inlineStr") text = alleTexte(inhalt);
      else if (v !== undefined) text = xmlText(v);

      const i = ref ? spaltenIndex(ref) : werte.length;
      while (werte.length < i) werte.push("");
      werte[i] = text;
    }
    zeilen.push(werte);
  }
  return zeilen;
}

/** Eine hochgeladene Datei - Excel oder CSV - auswerten. */
export function logxDateiAuswerten(name: string, daten: Buffer): LogxErgebnis {
  try {
    const istExcel = name.toLowerCase().endsWith(".xlsx") || daten.readUInt32LE(0) === 0x04034b50;
    const tabelle = istExcel ? xlsxLesen(daten) : csvLesen(daten.toString("utf8"));
    return tabelleAuswerten(tabelle);
  } catch (error) {
    return {
      ok: false,
      grund: error instanceof Error ? error.message : "Die Datei ließ sich nicht lesen.",
    };
  }
}
