"use server";

import { revalidatePath } from "@/lib/revalidieren";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import {
  KOPIE_SCHLUESSEL,
  kopieEmpfaenger,
  sendAnfrageInternEmail,
  sendAnfrageKopieEmail,
  type AnfrageAngaben,
} from "@/lib/email";

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

/**
 * Probeversand: eine erfundene Anfrage, nur an die Kopie-Adresse(n).
 *
 * Kein Eintrag in der Datenbank, keine Mail ans Studio, keine an einen
 * Kunden. Es kommen zwei Mails: so sieht die Mail im Studio aus, und so
 * die Kopie. Beide stehen danach im Protokoll.
 */
export async function testAnfrageSenden() {
  await verlangeLeitungAktion();
  const an = await kopieEmpfaenger();
  const angaben: AnfrageAngaben = {
    id: "test",
    name: "TEST - Max Mustermann",
    email: "max.mustermann@example.com",
    phone: "0221 1234567",
    erreichbarkeit: "werktags ab 17 Uhr",
    studioName: "Körperformen Teststudio",
    terminZeile: "Wunsch: nächste Woche abends - Termin abstimmen",
    ziel: "Rücken stärken",
    nachricht: "Das ist eine Testanfrage aus dem Adminbereich - bitte nicht zurückrufen.",
    aktionsCode: null,
    herkunft: "Probeversand",
    sprache: "de",
  };
  for (const adresse of an) {
    await sendAnfrageInternEmail(adresse, angaben);
    await sendAnfrageKopieEmail(adresse, angaben, { adresse: "(Teststudio)", ok: true });
  }
  revalidatePath("/admin/mails");
}
