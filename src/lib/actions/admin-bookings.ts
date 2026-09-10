"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { neuerVerwaltungsSchluessel, terminAngaben } from "@/lib/termin-angaben";
import { wartelisteBenachrichtigen } from "@/lib/warteliste";
import type { BookingStatus } from "@/generated/prisma/enums";

export async function updateBookingStatus(id: string, status: BookingStatus) {
  // Der Standort steht am Datensatz selbst, nicht im Formular - sonst
  // ließe er sich mitschicken und man erteilte sich damit die Erlaubnis.
  // Alte Anfragen aus der Zeit vor dieser Spalte haben keinen; die darf
  // weiterhin nur die Leitung bearbeiten.
  const zugehoerig = await prisma.booking.findUnique({
    where: { id },
    select: { manageToken: true, studioId: true },
  });
  await verlangeStudioRecht(zugehoerig?.studioId);

  // Vor dem Bestätigen sicherstellen, dass ein Schlüssel für den
  // persönlichen Link vorhanden ist. Buchungen aus der Zeit davor haben
  // noch keinen; ohne ihn stünde in der Mail kein Weg zum Absagen.
  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status,
      ...(zugehoerig?.manageToken ? {} : { manageToken: neuerVerwaltungsSchluessel() }),
    },
    include: { slot: { include: { studio: true } }, studio: true },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  // Wird eine Buchung storniert, wird ihr Platz frei - und der Nächste auf
  // der Warteliste bekommt Bescheid. Nach der Antwort, damit das Stornieren
  // im Adminbereich nicht auf den Mailanbieter wartet.
  if (status === "CANCELLED" && booking.slotId) {
    const slotId = booking.slotId;
    after(async () => {
      await wartelisteBenachrichtigen(slotId);
    });
  }

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

/**
 * Interner Vermerk an einer Buchung.
 *
 * Steht nur im Adminbereich und geht in keine E-Mail an den Gast - dafür
 * ist "will lieber abends" oder "ruft morgen zurück" auch nicht gedacht.
 */
export async function notizSpeichern(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const zugehoerig = await prisma.booking.findUnique({
    where: { id },
    select: { studioId: true },
  });
  await verlangeStudioRecht(zugehoerig?.studioId);

  const notiz = String(formData.get("internalNote") ?? "").trim();
  await prisma.booking.update({
    where: { id },
    // Leeres Feld heißt "keine Notiz" - sonst stünde dort eine leere
    // Zeichenkette und die Anzeige zeigte einen leeren Kasten.
    data: { internalNote: notiz || null },
  });

  revalidatePath("/admin/bookings");
}
