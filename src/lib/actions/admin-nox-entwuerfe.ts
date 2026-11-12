"use server";

import { revalidatePath } from "@/lib/revalidieren";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";

const FAQ_PFADE = ["/", "/preise", "/ems-training", "/admin/faq"];

export async function entwurfUebernehmen(formData: FormData) {
  await verlangeLeitungAktion();
  const id = String(formData.get("id") ?? "");
  const e = id ? await prisma.noxEntwurf.findUnique({ where: { id } }) : null;
  if (!e) return;

  if (e.art === "faq" && e.frage) {
    const vorhanden = await prisma.faqItem.findUnique({ where: { question: e.frage } });
    if (vorhanden) {
      await prisma.faqItem.update({ where: { id: vorhanden.id }, data: { answer: e.text, answerEn: e.textEn ?? vorhanden.answerEn, questionEn: e.frageEn ?? vorhanden.questionEn } });
    } else {
      const letzte = await prisma.faqItem.findFirst({ orderBy: { sortOrder: "desc" } });
      await prisma.faqItem.create({ data: { question: e.frage, answer: e.text, questionEn: e.frageEn, answerEn: e.textEn, sortOrder: (letzte?.sortOrder ?? 0) + 10 } });
    }
    await prisma.noxEntwurf.delete({ where: { id } });
    await protokollieren({ art: vorhanden ? "GEAENDERT" : "ANGELEGT", bereich: "FAQ", betreff: `„${e.frage.slice(0, 80)}“`, detail: "Vorschlag von Nox übernommen" });
    for (const pfad of FAQ_PFADE) revalidatePath(pfad);
    return;
  }

  if (e.art === "studio" && e.studioId && (e.feld === "intro" || e.feld === "anfahrt")) {
    const studio = await prisma.studioLocation.findUnique({ where: { id: e.studioId }, select: { name: true } });
    if (!studio) {
      await prisma.noxEntwurf.delete({ where: { id } });
      revalidatePath("/admin/studios");
      return;
    }
    const daten = e.feld === "intro" ? { intro: e.text, ...(e.textEn ? { introEn: e.textEn } : {}) } : { anfahrt: e.text, ...(e.textEn ? { anfahrtEn: e.textEn } : {}) };
    await prisma.studioLocation.update({ where: { id: e.studioId }, data: daten });
    await prisma.noxEntwurf.delete({ where: { id } });
    await protokollieren({ art: "GEAENDERT", bereich: "Studio", betreff: `${e.feld === "intro" ? "Einleitung" : "Anfahrt"} ${studio.name}`, detail: "Vorschlag von Nox übernommen" });
    for (const pfad of ["/", "/studio", "/admin/studios"]) revalidatePath(pfad);
    revalidatePath("/studio/[slug]", "page");
  }
}

export async function entwurfVerwerfen(formData: FormData) {
  await verlangeLeitungAktion();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.noxEntwurf.deleteMany({ where: { id } });
  revalidatePath("/admin/faq");
  revalidatePath("/admin/studios");
}
