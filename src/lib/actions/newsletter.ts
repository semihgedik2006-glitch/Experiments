"use server";

import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: boolean; message: string };

export async function subscribeNewsletter(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return { ok: true, message: "Danke! Du erhältst jetzt unseren Newsletter." };
  } catch {
    return { ok: false, message: "Da ist etwas schiefgelaufen. Bitte versuch es später erneut." };
  }
}
