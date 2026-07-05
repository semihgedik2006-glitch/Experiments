"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { formatDate } from "@/lib/format";
import type { BookingStatus } from "@/generated/prisma/enums";

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { slot: { include: { studio: true } } },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  if (status === "CONFIRMED") {
    try {
      await sendBookingConfirmedEmail({
        to: booking.email,
        name: booking.name,
        dateLabel: formatDate(booking.slot.date),
        startTime: booking.slot.startTime,
        studioName: booking.slot.studio.name,
      });
    } catch (error) {
      // The booking status is already saved - a flaky email provider
      // shouldn't make this action look like it failed.
      console.error("Bestätigungs-E-Mail konnte nicht gesendet werden:", error);
    }
  }
}
