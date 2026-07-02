"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/newsletter";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPost(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const adminId = await getAdminSession();
  if (!adminId) return { ok: false, message: "Nicht autorisiert." };

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title || !excerpt || !content) {
    return { ok: false, message: "Bitte fülle alle Pflichtfelder aus." };
  }

  const slug = slugify(title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, message: "Ein Artikel mit diesem Titel existiert bereits." };
  }

  await prisma.blogPost.create({
    data: { title, slug, excerpt, content, published, publishedAt: published ? new Date() : null },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(
  id: string,
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const adminId = await getAdminSession();
  if (!adminId) return { ok: false, message: "Nicht autorisiert." };

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title || !excerpt || !content) {
    return { ok: false, message: "Bitte fülle alle Pflichtfelder aus." };
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return { ok: false, message: "Artikel nicht gefunden." };

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      excerpt,
      content,
      published,
      publishedAt: published ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);

  return { ok: true, message: "Artikel wurde gespeichert." };
}

export async function deletePost(id: string) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
