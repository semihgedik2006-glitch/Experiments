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

export async function replyToComment(parentId: string, formData: FormData) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const parent = await prisma.comment.findUnique({
    where: { id: parentId },
    include: { post: { select: { slug: true } } },
  });
  if (!parent) return;

  await prisma.comment.create({
    data: {
      postId: parent.postId,
      parentId,
      authorName: "Körperformen Team",
      content,
      isTeam: true,
      approved: true,
    },
  });

  revalidatePath("/admin/kommentare");
  revalidatePath(`/blog/${parent.post.slug}`);
}
