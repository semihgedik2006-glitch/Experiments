"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";
import { syncSlotsForTemplate, deleteUnbookedFutureSlotsForTemplate } from "@/lib/slot-templates";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function createSlot(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const studioId = String(formData.get("studioId") ?? "");
  // Der Standort steht im Formular - genau deshalb muss er geprüft werden.
  // Eine Studioleitung darf keinen Termin an einem fremden Standort anlegen,
  // auch nicht durch einen veränderten Wert im Formular.
  await verlangeStudioRecht(studioId);

  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const capacity = Number(formData.get("capacity") ?? 1);

  if (!studioId || !date || !startTime || !endTime || !capacity) {
    return { ok: false, message: "Bitte alle Felder ausfüllen." };
  }

  await prisma.availabilitySlot.create({
    data: { studioId, date: new Date(date), startTime, endTime, capacity },
  });

  revalidatePath("/admin/verfuegbarkeit");
  revalidatePath("/probetermin");

  return { ok: true, message: "Termin wurde angelegt." };
}

export async function deleteSlot(id: string) {
  // Der Standort kommt aus dem Datensatz selbst, nicht von außen.
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id },
    // Datum und Zeit werden für das Protokoll gebraucht: Nach dem
    // Löschen lässt sich nicht mehr nachsehen, welcher Termin es war.
    select: {
      studioId: true,
      date: true,
      startTime: true,
      _count: { select: { bookings: true } },
    },
  });
  await verlangeStudioRecht(slot?.studioId);

  await prisma.availabilitySlot.delete({ where: { id } });
  revalidatePath("/admin/verfuegbarkeit");
  revalidatePath("/probetermin");

  if (slot) {
    await protokollieren({
      art: "GELOESCHT",
      bereich: "Termin",
      betreff: `${slot.date.toLocaleDateString("de-DE")} um ${slot.startTime} Uhr`,
      detail:
        slot._count.bookings > 0
          ? `mit ${slot._count.bookings} ${slot._count.bookings === 1 ? "Buchung" : "Buchungen"}`
          : null,
      studioId: slot.studioId,
    });
  }
}

const weekdayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export async function createSlotTemplate(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const studioId = String(formData.get("studioId") ?? "");
  await verlangeStudioRecht(studioId);

  const weekday = Number(formData.get("weekday") ?? -1);
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const capacity = Number(formData.get("capacity") ?? 1);

  if (!studioId || weekday < 0 || weekday > 6 || !startTime || !endTime || !capacity) {
    return { ok: false, message: "Bitte alle Felder ausfüllen." };
  }

  const template = await prisma.slotTemplate.create({
    data: { studioId, weekday, startTime, endTime, capacity },
  });
  await syncSlotsForTemplate(template);

  revalidatePath("/admin/verfuegbarkeit");
  revalidatePath("/probetermin");

  return {
    ok: true,
    message: `Wiederkehrender Termin jeden ${weekdayNames[weekday]} wurde angelegt und für die nächsten Wochen eingetragen.`,
  };
}

export async function deleteSlotTemplate(id: string) {
  const template = await prisma.slotTemplate.findUnique({
    where: { id },
    select: { studioId: true },
  });
  await verlangeStudioRecht(template?.studioId);

  await deleteUnbookedFutureSlotsForTemplate(id);
  const geloescht = await prisma.slotTemplate.delete({ where: { id } });

  revalidatePath("/admin/verfuegbarkeit");
  revalidatePath("/probetermin");

  await protokollieren({
    art: "GELOESCHT",
    bereich: "Termin",
    betreff: `Wiederkehrend: ${weekdayNames[geloescht.weekday]} ${geloescht.startTime} Uhr`,
    detail: "samt der künftigen unbelegten Termine dieser Reihe",
    studioId: geloescht.studioId,
  });
}
