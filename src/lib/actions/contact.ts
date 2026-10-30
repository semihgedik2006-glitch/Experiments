"use server";

import { revalidatePath } from "@/lib/revalidieren";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendKontaktInternEmail, TEAM_EMAIL } from "@/lib/email";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/newsletter";
import { spracheAusText } from "@/lib/sprache";

export async function sendContactMessage(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const en = spracheAusText(String(formData.get("sprache") ?? "")) === "en";
  const danke = en
    ? "Thank you for your message! We will get back to you as soon as possible."
    : "Danke für deine Nachricht! Wir melden uns so schnell wie möglich.";
  const ip = await getClientIp();
  const limit = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, message: waitMessage(limit.retryAfterSeconds, en ? "en" : "de") };
  }

  // Bot-Falle: echte Besucher füllen dieses Feld nie aus.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: true, message: danke };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  // Von der englischen Seite: Das Studio soll vor dem Antworten sehen,
  // dass auf Englisch zurückgeschrieben werden sollte.
  const betreff = String(formData.get("subject") ?? "").trim();
  const subject = en && betreff ? `[Englisch] ${betreff}` : betreff;
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !betreff || !message) {
    return { ok: false, message: en ? "Please fill in all required fields." : "Bitte fülle alle Pflichtfelder aus." };
  }

  await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, subject, message },
  });

  // Nach der Antwort: Der Absender soll nicht auf den Mailanbieter warten.
  // Ohne diese Benachrichtigung erfährt von einer Nachricht nur, wer den
  // Adminbereich öffnet - und das tut niemand stündlich.
  const an = TEAM_EMAIL;
  if (an) {
    after(async () => {
      await sendKontaktInternEmail(an, {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      });
    });
  }

  revalidatePath("/admin/nachrichten");
  revalidatePath("/admin");

  return { ok: true, message: danke };
}
