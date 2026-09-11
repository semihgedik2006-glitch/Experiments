"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";

/**
 * Einen Eintrag von der Warteliste nehmen.
 *
 * Der übliche Fall: Es wurde telefoniert, die Person hat einen anderen
 * Termin bekommen oder es sich anders überlegt. Dann soll sie nicht bei
 * der nächsten Stornierung noch eine Mail bekommen.
 *
 * Der Standort kommt aus dem Datensatz, nicht aus dem Formular - sonst
 * ließe sich damit ein fremder Eintrag löschen.
 */
export async function wartelisteEintragLoeschen(id: string) {
  const eintrag = await prisma.warteliste.findUnique({
    where: { id },
    select: { studioId: true, name: true },
  });
  if (!eintrag) return;

  await verlangeStudioRecht(eintrag.studioId);
  await prisma.warteliste.delete({ where: { id } });

  revalidatePath("/admin/warteliste");
  await protokollieren({
    art: "GELOESCHT",
    bereich: "Warteliste",
    betreff: eintrag.name,
    studioId: eintrag.studioId,
  });
}
