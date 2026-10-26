"use server";

import { revalidatePath } from "@/lib/revalidieren";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { enText } from "@/lib/admin-englisch";

// FAQ appears on these public pages - refresh them all after any change.
const faqPaths = ["/", "/preise", "/ems-training", "/admin/faq"];
// (Die englischen Gegenstücke erneuert revalidatePath von selbst.)

function revalidateFaq() {
  for (const path of faqPaths) revalidatePath(path);
}

async function requireAdmin() {
  await verlangeLeitungAktion();
}

export async function createFaqItem(formData: FormData) {
  await requireAdmin();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;
  const questionEn = enText(formData, "questionEn", 200);
  const answerEn = enText(formData, "answerEn", 2000);

  const last = await prisma.faqItem.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.faqItem.create({
    data: { question, answer, questionEn, answerEn, sortOrder: (last?.sortOrder ?? 0) + 10 },
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
    data: {
      question,
      answer,
      questionEn: enText(formData, "questionEn", 200),
      answerEn: enText(formData, "answerEn", 2000),
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });
  revalidateFaq();
}

export async function deleteFaqItem(id: string) {
  await requireAdmin();

  await prisma.faqItem.delete({ where: { id } });
  revalidateFaq();
}
