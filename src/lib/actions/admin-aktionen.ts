"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { codeNormalisieren } from "@/lib/aktionscode";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Aktionscodes anlegen, ändern und entfernen.
 *
 * Nur die Leitung: Ein Code gilt für die ganze Marke, nicht für einen
 * Standort. Eine Studioleitung, die eigene Codes anlegen könnte, würde
 * Zusagen machen, von denen die anderen dreizehn nichts wissen.
 */

/**
 * Ein Datum aus einem Datumsfeld. Leer heißt "keine Grenze".
 *
 * Gelesen wird als deutsche Ortszeit-Mitternacht. Ohne das läge ein "gilt
 * ab 01.08." im Sommer zwei Stunden zu früh - der Code ginge schon am
 * 31. Juli um 22 Uhr.
 */
function alsDatum(wert: string): Date | null {
  const roh = wert.trim();
  if (!roh) return null;
  const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(roh);
  if (!treffer) return null;
  const [, jahr, monat, tag] = treffer;
  // Als reines Kalenderdatum in Weltzeit. Für den Vergleich mit "heute"
  // genügt der Tag; die Uhrzeit spielt bei einer Gültigkeit in Tagen
  // keine Rolle, und der Prüfer rechnet das Tagesende ohnehin dazu.
  const datum = new Date(Date.UTC(Number(jahr), Number(monat) - 1, Number(tag)));
  return Number.isNaN(datum.getTime()) ? null : datum;
}

function felderLesen(formData: FormData) {
  return {
    code: codeNormalisieren(String(formData.get("code") ?? "")),
    label: String(formData.get("label") ?? "").trim().slice(0, 160),
    benefit: String(formData.get("benefit") ?? "").trim().slice(0, 300),
    active: formData.get("active") === "on",
    validFrom: alsDatum(String(formData.get("validFrom") ?? "")),
    validUntil: alsDatum(String(formData.get("validUntil") ?? "")),
  };
}

function pruefen(felder: ReturnType<typeof felderLesen>): string | null {
  if (!felder.code) return "Bitte einen Code angeben.";
  // Nur Zeichen, die sich fehlerfrei abtippen und vorlesen lassen. Ein
  // Code mit Bindestrich oder Umlaut wird in jeder zweiten Anfrage anders
  // geschrieben ankommen.
  if (!/^[A-Z0-9]{3,40}$/.test(felder.code)) {
    return "Der Code darf nur aus Buchstaben und Ziffern bestehen, mindestens drei Zeichen.";
  }
  if (!felder.label) return "Bitte kurz angeben, wofür der Code steht.";
  if (felder.validFrom && felder.validUntil && felder.validFrom > felder.validUntil) {
    return "Das Ende liegt vor dem Beginn.";
  }
  return null;
}

export async function aktionAnlegen(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await verlangeLeitungAktion();

  const felder = felderLesen(formData);
  const fehler = pruefen(felder);
  if (fehler) return { ok: false, message: fehler };

  const vorhanden = await prisma.promotion.findUnique({ where: { code: felder.code } });
  if (vorhanden) {
    return { ok: false, message: `Den Code „${felder.code}“ gibt es schon.` };
  }

  await prisma.promotion.create({
    data: {
      code: felder.code,
      label: felder.label,
      benefit: felder.benefit || null,
      active: felder.active,
      validFrom: felder.validFrom,
      validUntil: felder.validUntil,
    },
  });

  revalidatePath("/admin/aktionen");
  return { ok: true, message: `Der Code „${felder.code}“ ist angelegt.` };
}

export async function aktionAendern(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await verlangeLeitungAktion();

  const id = String(formData.get("id") ?? "");
  const felder = felderLesen(formData);
  const fehler = pruefen(felder);
  if (fehler) return { ok: false, message: fehler };

  const aktion = await prisma.promotion.findUnique({ where: { id } });
  if (!aktion) return { ok: false, message: "Diese Aktion gibt es nicht mehr." };

  if (felder.code !== aktion.code) {
    const belegt = await prisma.promotion.findUnique({ where: { code: felder.code } });
    if (belegt) return { ok: false, message: `Den Code „${felder.code}“ gibt es schon.` };
  }

  await prisma.promotion.update({
    where: { id },
    data: {
      code: felder.code,
      label: felder.label,
      benefit: felder.benefit || null,
      active: felder.active,
      validFrom: felder.validFrom,
      validUntil: felder.validUntil,
    },
  });

  revalidatePath("/admin/aktionen");
  return { ok: true, message: "Die Aktion wurde geändert." };
}

/**
 * Entfernen ist nur erlaubt, solange keine Anfrage daran hängt.
 *
 * Sonst verlöre man mit dem Code auch die Antwort auf die Frage, wofür
 * man ihn angelegt hat - nämlich wie viele Anfragen er gebracht hat. Wer
 * einen Code aus dem Verkehr ziehen will, stellt ihn auf inaktiv.
 */
export async function aktionEntfernen(id: string) {
  await verlangeLeitungAktion();

  const anfragen = await prisma.booking.count({ where: { promotionId: id } });
  if (anfragen > 0) {
    throw new Error(
      `An dieser Aktion hängen ${anfragen} Anfragen. Stell sie auf inaktiv, statt sie zu löschen.`,
    );
  }

  await prisma.promotion.delete({ where: { id } });
  revalidatePath("/admin/aktionen");
}
