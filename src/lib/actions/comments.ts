"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function submitComment(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const authorName = String(formData.get("authorName") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const honeypot = String(formData.get("website") ?? "").trim();

  // Honeypot field - real users never fill this in, bots often do.
  if (honeypot) {
    return { ok: true, message: "Danke für deinen Kommentar! Er wird nach Prüfung freigeschaltet." };
  }

  if (!postId || !authorName || !content) {
    return { ok: false, message: "Bitte fülle Name und Kommentar aus." };
  }
  if (authorName.length > 80 || content.length > 2000) {
    return { ok: false, message: "Name oder Kommentar ist zu lang." };
  }

  await prisma.comment.create({ data: { postId, authorName, content } });

  if (slug) revalidatePath(`/blog/${slug}`);

  return { ok: true, message: "Danke für deinen Kommentar! Er wird nach Prüfung freigeschaltet." };
}
