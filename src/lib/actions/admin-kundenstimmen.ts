"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";

/**
 * Kundenstimmen pflegen.
 *
 * Rechte wie bei den Trainerprofilen: Eine Studioleitung pflegt die
 * Stimmen ihres Standorts - sie kennt die Menschen, die sie geschrieben
 * haben. Stimmen ohne Standort gehören der Marke und bleiben der Leitung
 * vorbehalten. Geprüft wird gegen den Standort am Datensatz, nicht gegen
 * den im Formular.
 */

function erneuern() {
  revalidatePath("/admin/kundenstimmen");
  revalidatePath("/erfolgsgeschichten");
  // Die drei ersten Stimmen stehen auch auf der Startseite.
  revalidatePath("/");
}

const GRENZEN = { name: 60, text: 600, ziel: 60, einwilligungNotiz: 200 } as const;

function feld(formData: FormData, name: keyof typeof GRENZEN): string {
  return String(formData.get(name) ?? "").trim().slice(0, GRENZEN[name]);
}

/**
 * Das Datum der Zustimmung.
 *
 * Wie beim Vorher-Nachher-Bereich absichtlich ohne die Notlösung von
 * datumAusText: Dessen Rückfall auf "heute" wäre bei einem Nachweisdatum
 * fatal - aus einem Tippfehler würde eine Zustimmung, die es nie gab.
 */
function zustimmungsDatum(roh: string): Date | null {
  const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(roh.trim());
  if (!treffer) return null;

  const [jahr, monat, tag] = treffer.slice(1).map(Number);
  const datum = new Date(jahr, monat - 1, tag);
  const echt =
    datum.getFullYear() === jahr && datum.getMonth() === monat - 1 && datum.getDate() === tag;
  if (!echt) return null;

  const morgen = new Date();
  morgen.setHours(0, 0, 0, 0);
  morgen.setDate(morgen.getDate() + 1);

  return datum < morgen ? datum : null;
}

function lesen(formData: FormData) {
  // Monate: eine Zahl oder gar nichts. "seit Jahren" soll hier nicht
  // stehen können, wenn es acht Monate sind.
  const monateRoh = Number(String(formData.get("monate") ?? "").trim());
  const monate =
    Number.isFinite(monateRoh) && monateRoh > 0 && monateRoh < 600
      ? Math.round(monateRoh)
      : null;

  return {
    name: feld(formData, "name"),
    text: feld(formData, "text"),
    ziel: feld(formData, "ziel") || null,
    monate,
    einwilligungAm: zustimmungsDatum(String(formData.get("einwilligungAm") ?? "")),
    einwilligungNotiz: feld(formData, "einwilligungNotiz") || null,
    aktiv: formData.get("aktiv") !== null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function stimmeAnlegen(formData: FormData) {
  const studioRoh = String(formData.get("studioId") ?? "").trim();
  await verlangeStudioRecht(studioRoh || null);

  const daten = lesen(formData);
  if (!daten.name || !daten.text) return;

  const letzte = await prisma.kundenstimme.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.kundenstimme.create({
    data: {
      ...daten,
      studioId: studioRoh || null,
      sortOrder: daten.sortOrder || (letzte?.sortOrder ?? 0) + 10,
    },
  });

  await protokollieren({
    art: "ANGELEGT",
    bereich: "Inhalte",
    betreff: `Kundenstimme: ${daten.name}`,
    studioId: studioRoh || null,
  });

  erneuern();
}

export async function stimmeAendern(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const vorhanden = await prisma.kundenstimme.findUnique({
    where: { id },
    select: { studioId: true, aktiv: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId ?? null);
  if (!vorhanden) return;

  const daten = lesen(formData);
  if (!daten.name || !daten.text) return;

  await prisma.kundenstimme.update({ where: { id }, data: daten });

  await protokollieren({
    art: vorhanden.aktiv === daten.aktiv ? "GEAENDERT" : "STATUS",
    bereich: "Inhalte",
    betreff: `Kundenstimme: ${daten.name}`,
    detail:
      vorhanden.aktiv === daten.aktiv ? null : daten.aktiv ? "veröffentlicht" : "ausgeblendet",
    studioId: vorhanden.studioId,
  });

  erneuern();
}

export async function stimmeLoeschen(id: string) {
  const vorhanden = await prisma.kundenstimme.findUnique({
    where: { id },
    select: { studioId: true, name: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId ?? null);
  if (!vorhanden) return;

  await prisma.kundenstimme.delete({ where: { id } });

  await protokollieren({
    art: "GELOESCHT",
    bereich: "Inhalte",
    betreff: `Kundenstimme: ${vorhanden.name}`,
    studioId: vorhanden.studioId,
  });

  erneuern();
}
