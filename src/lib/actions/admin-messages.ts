"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";

export async function markMessageRead(id: string) {
  await verlangeLeitungAktion();

  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/nachrichten");
  revalidatePath("/admin");
}
