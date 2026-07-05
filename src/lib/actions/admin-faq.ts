"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// FAQ appears on these public pages - refresh them all after any change.
const faqPaths = ["/", "/preise", "/ems-training", "/admin/faq"];

function revalidateFaq() {
  for (const path of faqPaths) revalidatePath(path);
}

async function requireAdmin() {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");
}

export async function createFaqItem(formData: FormData) {
  await requireAdmin();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;

  const last = await prisma.faqItem.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.faqItem.create({
    data: { question, answer, sortOrder: (last?.sortOrder ?? 0) + 10 },
  });
  revalidateFaq();
}

export async function updateFaqItem(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  if (!id || !question || !answer) return;

  await prisma.faqItem.update({
    where: { id },
    data: { question, answer, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 },
  });
  revalidateFaq();
}

export async function deleteFaqItem(id: string) {
  await requireAdmin();

  await prisma.faqItem.delete({ where: { id } });
  revalidateFaq();
}
