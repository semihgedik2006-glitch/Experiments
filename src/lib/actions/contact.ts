"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function sendContactMessage(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, message: waitMessage(limit.retryAfterSeconds) };
  }

  // Bot-Falle: echte Besucher füllen dieses Feld nie aus.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: true, message: "Danke für deine Nachricht! Wir melden uns so schnell wie möglich." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    return { ok: false, message: "Bitte fülle alle Pflichtfelder aus." };
  }

  await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, subject, message },
  });

  revalidatePath("/admin/nachrichten");
  revalidatePath("/admin");

  return { ok: true, message: "Danke für deine Nachricht! Wir melden uns so schnell wie möglich." };
}
