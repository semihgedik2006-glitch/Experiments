"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function approveComment(id: string) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  const comment = await prisma.comment.update({
    where: { id },
    data: { approved: true },
    include: { post: { select: { slug: true } } },
  });

  revalidatePath("/admin/kommentare");
  revalidatePath(`/blog/${comment.post.slug}`);
}

export async function deleteComment(id: string) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  const comment = await prisma.comment.delete({
    where: { id },
    include: { post: { select: { slug: true } } },
  });

  revalidatePath("/admin/kommentare");
  revalidatePath(`/blog/${comment.post.slug}`);
}
