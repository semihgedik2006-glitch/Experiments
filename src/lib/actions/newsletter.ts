"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";

export type ActionResult = { ok: boolean; message: string };

export async function subscribeNewsletter(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`newsletter:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, message: waitMessage(limit.retryAfterSeconds) };
  }

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
    revalidatePath("/admin/newsletter");
    revalidatePath("/admin");
    return { ok: true, message: "Danke! Du erhältst jetzt unseren Newsletter." };
  } catch {
    return { ok: false, message: "Da ist etwas schiefgelaufen. Bitte versuch es später erneut." };
  }
}
