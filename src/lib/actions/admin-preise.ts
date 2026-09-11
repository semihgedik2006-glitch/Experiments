"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { istSymbol } from "@/lib/zusatzangebote";
import { textDefinitionen, type TextKey } from "@/lib/site-texte";

/**
 * Tarife, Zusatzangebote und der Preishinweis.
 *
 * Alles nur für die Leitung: Preise gelten für die Marke. Ein Standort,
 * der eigene Beiträge nennt, wäre keine Preisübersicht mehr, sondern
 * vierzehn - und die Frage "was kostet das bei euch" hätte vierzehn
 * Antworten.
 */

/** Seiten, auf denen Tarife oder Zusatzangebote stehen. */
function erneuern() {
  revalidatePath("/preise");
  revalidatePath("/admin/preise");
  // Die Zusatzangebote stehen auch auf den Standortseiten. Ohne "page"
  // würde nur die Adressform erneuert und keine der vierzehn Seiten.
  revalidatePath("/studio/[slug]", "page");
}

const GRENZEN = {
  name: 80,
  untertitel: 100,
  preis: 40,
  preisZusatz: 40,
  hinweis: 300,
  text: 400,
} as const;

function feld(formData: FormData, name: keyof typeof GRENZEN): string {
  return String(formData.get(name) ?? "").trim().slice(0, GRENZEN[name]);
}

/**
 * Leistungen aus dem Textfeld: eine je Zeile.
 *
 * Zeilen statt Komma, anders als bei den Blogthemen: In einer Leistung
 * steht regelmäßig ein Komma ("Betreuung, auch am Wochenende"), in einem
 * Schlagwort nie.
 */
function leistungenLesen(roh: string): string[] {
  const gesehen = new Set<string>();
  const ergebnis: string[] = [];

  for (const zeile of roh.split("\n")) {
    const text = zeile.trim().replace(/\s+/g, " ").replace(/^[-•*]\s*/, "");
    if (!text || text.length > 120) continue;
    const schluessel = text.toLocaleLowerCase("de");
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    ergebnis.push(text);
    // Mehr als zehn Punkte liest in einer Tarifkarte niemand mehr - und
    // die Karten daneben werden dadurch gleich mit unlesbar hoch.
    if (ergebnis.length >= 10) break;
  }

  return ergebnis;
}

/* ---------------------------------------------------------------- Tarife */

function tarifLesen(formData: FormData) {
  return {
    name: feld(formData, "name"),
    untertitel: feld(formData, "untertitel") || null,
    preis: feld(formData, "preis") || null,
    preisZusatz: feld(formData, "preisZusatz") || null,
    hinweis: feld(formData, "hinweis") || null,
    leistungen: leistungenLesen(String(formData.get("leistungen") ?? "")),
    empfohlen: formData.get("empfohlen") !== null,
    aktiv: formData.get("aktiv") !== null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

/**
 * Höchstens ein empfohlener Tarif.
 *
 * Zwei Empfehlungen sind keine Empfehlung. Statt das Speichern abzulehnen,
 * wird die vorherige zurückgenommen - das ist das, was gemeint war, und
 * eine Fehlermeldung für eine Sache, die sich von selbst auflösen lässt,
 * ist eine Hürde ohne Zweck.
 */
async function empfehlungBereinigen(ausser?: string) {
  await prisma.tarif.updateMany({
    where: { empfohlen: true, ...(ausser ? { id: { not: ausser } } : {}) },
    data: { empfohlen: false },
  });
}

export async function tarifAnlegen(formData: FormData) {
  await verlangeLeitungAktion();

  const daten = tarifLesen(formData);
  if (!daten.name) return;

  const letzter = await prisma.tarif.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  if (daten.empfohlen) await empfehlungBereinigen();

  await prisma.tarif.create({
    data: { ...daten, sortOrder: daten.sortOrder || (letzter?.sortOrder ?? 0) + 10 },
  });
  erneuern();
}

export async function tarifAendern(formData: FormData) {
  await verlangeLeitungAktion();

  const id = String(formData.get("id") ?? "").trim();
  const daten = tarifLesen(formData);
  if (!id || !daten.name) return;

  if (daten.empfohlen) await empfehlungBereinigen(id);

  await prisma.tarif.update({ where: { id }, data: daten });
  erneuern();
}

export async function tarifLoeschen(id: string) {
  await verlangeLeitungAktion();

  await prisma.tarif.delete({ where: { id } });
  erneuern();
}

/* -------------------------------------------------------- Zusatzangebote */

function angebotLesen(formData: FormData) {
  const symbol = String(formData.get("symbol") ?? "").trim();

  return {
    name: feld(formData, "name"),
    text: feld(formData, "text") || null,
    preis: feld(formData, "preis") || null,
    // Nur bekannte Sinnbilder durchlassen - ein unbekannter Wert würde
    // als leere Fläche enden.
    symbol: istSymbol(symbol) ? symbol : "sonstiges",
    // getAll: Die Standorte kommen als mehrere Haken mit demselben Namen.
    nurStudios: formData.getAll("nurStudios").map(String).filter(Boolean),
    aktiv: formData.get("aktiv") !== null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function angebotAnlegen(formData: FormData) {
  await verlangeLeitungAktion();

  const daten = angebotLesen(formData);
  if (!daten.name) return;

  const letztes = await prisma.zusatzangebot.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.zusatzangebot.create({
    data: { ...daten, sortOrder: daten.sortOrder || (letztes?.sortOrder ?? 0) + 10 },
  });
  erneuern();
}

export async function angebotAendern(formData: FormData) {
  await verlangeLeitungAktion();

  const id = String(formData.get("id") ?? "").trim();
  const daten = angebotLesen(formData);
  if (!id || !daten.name) return;

  await prisma.zusatzangebot.update({ where: { id }, data: daten });
  erneuern();
}

export async function angebotLoeschen(id: string) {
  await verlangeLeitungAktion();

  await prisma.zusatzangebot.delete({ where: { id } });
  erneuern();
}

/* ------------------------------------------------------------ Preistext */

export async function textSpeichern(formData: FormData) {
  await verlangeLeitungAktion();

  const key = String(formData.get("key") ?? "").trim();
  // Nur bekannte Schlüssel - sonst ließen sich beliebige Einträge in die
  // Tabelle schreiben, die nie jemand sieht und nie jemand löscht.
  if (!textDefinitionen.some((eintrag) => eintrag.key === key)) return;

  const wert = String(formData.get("wert") ?? "").trim().slice(0, 600);

  await prisma.siteText.upsert({
    where: { key },
    create: { key: key as TextKey, wert },
    update: { wert },
  });
  erneuern();
}
