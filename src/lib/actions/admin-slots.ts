"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { syncSlotsForTemplate, deleteUnbookedFutureSlotsForTemplate } from "@/lib/slot-templates";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function createSlot(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const adminId = await getAdminSession();
  if (!adminId) return { ok: false, message: "Nicht autorisiert." };

  const studioId = String(formData.get("studioId") ?? "");
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
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  await prisma.availabilitySlot.delete({ where: { id } });
  revalidatePath("/admin/verfuegbarkeit");
  revalidatePath("/probetermin");
}

const weekdayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export async function createSlotTemplate(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const adminId = await getAdminSession();
  if (!adminId) return { ok: false, message: "Nicht autorisiert." };

  const studioId = String(formData.get("studioId") ?? "");
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
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  await deleteUnbookedFutureSlotsForTemplate(id);
  await prisma.slotTemplate.delete({ where: { id } });

  revalidatePath("/admin/verfuegbarkeit");
  revalidatePath("/probetermin");
}
