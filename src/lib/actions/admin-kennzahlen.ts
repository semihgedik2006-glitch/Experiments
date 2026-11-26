"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";
import { KENNZAHL_FELDER, monatAusText } from "@/lib/kennzahlen";

/**
 * Die Zahlen eines Monats für einen Standort speichern.
 *
 * Ein leeres Feld bleibt leer und wird nicht zur Null: "nicht erfasst" und
 * "keine Kündigung" sind zwei verschiedene Aussagen, und der Vergleich
 * wäre mit einer falschen Null schlechter als ohne Wert.
 */
export async function kennzahlSpeichern(formData: FormData) {
  const studioId = String(formData.get("studioId") ?? "").trim();
  await verlangeStudioRecht(studioId);
  const monat = monatAusText(String(formData.get("monat") ?? ""));
  if (!studioId || !monat) return;

  const werte = Object.fromEntries(
    KENNZAHL_FELDER.map(({ feld }) => {
      const roh = String(formData.get(feld) ?? "").trim();
      const zahl = Number(roh);
      return [feld, roh === "" || !Number.isFinite(zahl) || zahl < 0 ? null : Math.round(zahl)];
    }),
  );

  await prisma.kennzahl.upsert({
    where: { studioId_monat: { studioId, monat } },
    create: { studioId, monat, ...werte },
    update: werte,
  });
  revalidatePath("/admin/kennzahlen");

  await protokollieren({
    art: "GEAENDERT",
    bereich: "Kennzahlen",
    betreff: `Zahlen ${monat.toISOString().slice(0, 7)}`,
    studioId,
  });
}
