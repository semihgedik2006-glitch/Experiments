"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";

/**
 * Trainerprofile pflegen.
 *
 * Rechte: Eine Studioleitung darf die Profile ihres Standorts anlegen,
 * ändern und löschen - sonst könnte sie nicht einmal einen neuen Kollegen
 * eintragen. Geprüft wird dabei immer gegen den Standort am Datensatz und
 * nicht gegen den, der im Formular steht: Sonst genügte ein geänderter
 * Wert im Formular, um sich die Erlaubnis selbst zu erteilen.
 */

/** Nach einer Änderung neu aufzubauende Seiten. */
function erneuern(slug?: string) {
  revalidatePath("/admin/trainer");
  // Die Standortseite zeigt die Profile. Ohne "page" würde nur die
  // Adressform erneuert und keine der vierzehn tatsächlichen Seiten.
  if (slug) revalidatePath(`/studio/${slug}`);
  else revalidatePath("/studio/[slug]", "page");
}

/** Grenzen. Was darüber hinausgeht, ist kein Profil mehr, sondern ein Aufsatz. */
const GRENZEN = { name: 80, rolle: 60, qualifikation: 160, text: 600, fotoUrl: 500 };

function kuerzen(formData: FormData, feld: keyof typeof GRENZEN): string {
  return String(formData.get(feld) ?? "").trim().slice(0, GRENZEN[feld]);
}

function lesen(formData: FormData) {
  return {
    name: kuerzen(formData, "name"),
    rolle: kuerzen(formData, "rolle") || null,
    qualifikation: kuerzen(formData, "qualifikation") || null,
    text: kuerzen(formData, "text") || null,
    fotoUrl: kuerzen(formData, "fotoUrl") || null,
    aktiv: formData.get("aktiv") !== null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function trainerAnlegen(formData: FormData) {
  const studioId = String(formData.get("studioId") ?? "");
  await verlangeStudioRecht(studioId);

  const daten = lesen(formData);
  if (!studioId || !daten.name) return;

  const studio = await prisma.studioLocation.findUnique({
    where: { id: studioId },
    select: { slug: true },
  });
  if (!studio) return;

  // Ans Ende einsortieren, wenn keine Reihenfolge angegeben wurde. Alle
  // auf 0 zu setzen hieße: Die Datenbank entscheidet, wer zuerst steht.
  const letzter = await prisma.trainer.findFirst({
    where: { studioId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.trainer.create({
    data: {
      ...daten,
      studioId,
      sortOrder: daten.sortOrder || (letzter?.sortOrder ?? 0) + 10,
    },
  });
  erneuern(studio.slug);
}

export async function trainerAendern(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const vorhanden = await prisma.trainer.findUnique({
    where: { id },
    select: { studioId: true, studio: { select: { slug: true } } },
  });
  // Der Standort kommt aus dem Datensatz, nicht aus dem Formular.
  await verlangeStudioRecht(vorhanden?.studioId);
  if (!vorhanden) return;

  const daten = lesen(formData);
  if (!daten.name) return;

  await prisma.trainer.update({ where: { id }, data: daten });
  erneuern(vorhanden.studio.slug);
}

export async function trainerLoeschen(id: string) {
  const vorhanden = await prisma.trainer.findUnique({
    where: { id },
    select: { studioId: true, studio: { select: { slug: true } } },
  });
  await verlangeStudioRecht(vorhanden?.studioId);
  if (!vorhanden) return;

  await prisma.trainer.delete({ where: { id } });
  erneuern(vorhanden.studio.slug);
}
