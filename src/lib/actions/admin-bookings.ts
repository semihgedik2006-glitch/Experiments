"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { neuerVerwaltungsSchluessel, terminAngaben } from "@/lib/termin-angaben";
import type { BookingStatus } from "@/generated/prisma/enums";

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  // Vor dem Bestätigen sicherstellen, dass ein Schlüssel für den
  // persönlichen Link vorhanden ist. Buchungen aus der Zeit davor haben
  // noch keinen; ohne ihn stünde in der Mail kein Weg zum Absagen.
  const vorher = await prisma.booking.findUnique({ where: { id }, select: { manageToken: true } });

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status,
      ...(vorher?.manageToken ? {} : { manageToken: neuerVerwaltungsSchluessel() }),
    },
    include: { slot: { include: { studio: true } } },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  if (status === "CONFIRMED") {
    try {
      await sendBookingConfirmedEmail(terminAngaben(booking));
    } catch (error) {
      // The booking status is already saved - a flaky email provider
      // shouldn't make this action look like it failed.
      console.error("Bestätigungs-E-Mail konnte nicht gesendet werden:", error);
    }
  }
}
