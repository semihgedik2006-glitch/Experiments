"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function markMessageRead(id: string) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/nachrichten");
  revalidatePath("/admin");
}
