"use server";

import { revalidatePath } from "@/lib/revalidieren";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { KOPIE_SCHLUESSEL } from "@/lib/email";

/**
 * Wer eine Kopie jeder neuen Anfrage bekommt (siehe kopieEmpfaenger).
 * Leeres Feld heißt: keine Kopie. Ungültige Adressen fallen weg, statt
 * dass eine Mail an eine Fantasieadresse geht.
 */
export async function kopieAdresseSpeichern(formData: FormData) {
  await verlangeLeitungAktion();
  const adressen = String(formData.get("adressen") ?? "")
    .split(/[,;\s]+/)
    .map((a) => a.trim())
    .filter((a) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a));
  const wert = adressen.join(", ");
  await prisma.siteText.upsert({
    where: { key: KOPIE_SCHLUESSEL },
    create: { key: KOPIE_SCHLUESSEL, wert },
    update: { wert },
  });
  revalidatePath("/admin/mails");
}
