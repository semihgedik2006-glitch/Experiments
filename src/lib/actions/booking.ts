"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function createBooking(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`booking:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, message: waitMessage(limit.retryAfterSeconds) };
  }

  // Bot-Falle: echte Besucher füllen dieses Feld nie aus.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: true, message: "Danke für deine Anfrage! Wir melden uns in Kürze zur Bestätigung deines Probetermins." };
  }

  const slotId = String(formData.get("slotId") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !phone) {
    return { ok: false, message: "Bitte fülle alle Pflichtfelder aus." };
  }

  if (slotId) {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: { bookings: { where: { status: { not: "CANCELLED" } } } },
    });

    if (!slot) {
      return { ok: false, message: "Dieser Termin existiert nicht mehr. Bitte wähle einen anderen." };
    }

    if (slot.bookings.length >= slot.capacity) {
      return { ok: false, message: "Dieser Termin ist leider bereits ausgebucht. Bitte wähle einen anderen." };
    }
  }

  await prisma.booking.create({
    data: { slotId, name, email, phone, message: message || null },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return {
    ok: true,
    message: "Danke für deine Anfrage! Wir melden uns in Kürze zur Bestätigung deines Probetermins.",
  };
}
