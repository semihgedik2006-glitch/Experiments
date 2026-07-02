"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function sendContactMessage(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
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

  return { ok: true, message: "Danke für deine Nachricht! Wir melden uns so schnell wie möglich." };
}
