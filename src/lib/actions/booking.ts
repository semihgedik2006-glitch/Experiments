"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/newsletter";

export async function createBooking(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const slotId = String(formData.get("slotId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!slotId || !name || !email || !phone) {
    return { ok: false, message: "Bitte fülle alle Pflichtfelder aus und wähle einen Termin." };
  }

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

  await prisma.booking.create({
    data: { slotId, name, email, phone, message: message || null },
  });

  return {
    ok: true,
    message: "Danke für deine Anfrage! Wir melden uns in Kürze zur Bestätigung deines Probetermins.",
  };
}
