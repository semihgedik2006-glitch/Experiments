"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function createSlot(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const adminId = await getAdminSession();
  if (!adminId) return { ok: false, message: "Nicht autorisiert." };

  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const capacity = Number(formData.get("capacity") ?? 1);

  if (!date || !startTime || !endTime || !capacity) {
    return { ok: false, message: "Bitte alle Felder ausfüllen." };
  }

  await prisma.availabilitySlot.create({
    data: { date: new Date(date), startTime, endTime, capacity },
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
