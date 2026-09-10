"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";

/**
 * Antwortvorlagen verwalten.
 *
 * Nur die Leitung: Eine Vorlage ist der Wortlaut, in dem die Marke nach
 * außen spricht. Vierzehn Standorte mit vierzehn eigenen Fassungen wären
 * das Gegenteil dessen, wofür eine Vorlage da ist.
 *
 * Benutzt werden dürfen die Vorlagen dagegen von jedem Zugang - siehe die
 * Buchungs- und Nachrichtenseiten.
 */

/** Vorlagen erscheinen an drei Stellen. */
function auffrischen() {
  revalidatePath("/admin/vorlagen");
  revalidatePath("/admin/nachrichten");
  revalidatePath("/admin/bookings");
}

export async function vorlageAnlegen(formData: FormData) {
  await verlangeLeitungAktion();

  const titel = String(formData.get("titel") ?? "").trim();
  const betreff = String(formData.get("betreff") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  if (!titel || !betreff || !text) return;

  // Ans Ende der Liste. In Zehnerschritten, damit sich später eine Vorlage
  // dazwischenschieben lässt, ohne alle anderen neu zu nummerieren.
  const letzte = await prisma.antwortvorlage.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.antwortvorlage.create({
    data: { titel, betreff, text, sortOrder: (letzte?.sortOrder ?? 0) + 10 },
  });
  auffrischen();
}

export async function vorlageSpeichern(formData: FormData) {
  await verlangeLeitungAktion();

  const id = String(formData.get("id") ?? "");
  const titel = String(formData.get("titel") ?? "").trim();
  const betreff = String(formData.get("betreff") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  // Ein Kontrollkästchen schickt nichts mit, wenn es aus ist.
  const aktiv = formData.get("aktiv") === "on";
  if (!id || !titel || !betreff || !text) return;

  await prisma.antwortvorlage.update({
    where: { id },
    data: {
      titel,
      betreff,
      text,
      aktiv,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });
  auffrischen();
}

export async function vorlageLoeschen(id: string) {
  await verlangeLeitungAktion();
  await prisma.antwortvorlage.delete({ where: { id } });
  auffrischen();
}
