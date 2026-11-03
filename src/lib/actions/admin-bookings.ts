"use server";

import { revalidatePath } from "@/lib/revalidieren";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { sendBookingConfirmedEmail, sendNichtErschienenEmail } from "@/lib/email";
import { neuerVerwaltungsSchluessel, terminAngaben } from "@/lib/termin-angaben";
import { wartelisteBenachrichtigen } from "@/lib/warteliste";
import type { BookingStatus } from "@/generated/prisma/enums";
import { FORTSCHRITT_LABEL, fortschrittAusText } from "@/lib/fortschritt";
import { pfad } from "@/lib/i18n/pfade";
import { siteConfig } from "@/lib/site-config";
import { protokollieren } from "@/lib/protokoll";
import { STATUS_LABEL } from "@/lib/buchung-status";

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  /** Beim Bestätigen ohne festen Platz: der mit dem Gast vereinbarte Termin. */
  termin: { tag: Date; uhrzeit: string } | null = null,
) {
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
      ...(termin ? { terminTag: termin.tag, terminUhrzeit: termin.uhrzeit } : {}),
      ...(zugehoerig?.manageToken ? {} : { manageToken: neuerVerwaltungsSchluessel() }),
    },
    include: { slot: { include: { studio: true } }, studio: true },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  // Der Fall, für den es das Protokoll überhaupt gibt: "Wer hat diese
  // Buchung storniert?" war bisher nicht zu beantworten.
  await protokollieren({
    art: "STATUS",
    bereich: "Buchung",
    betreff: `Anfrage von ${booking.name}`,
    detail: `auf „${STATUS_LABEL[status]}“ gesetzt`,
    studioId: booking.studioId,
  });

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

/**
 * Fortschritt einer Anfrage setzen: angerufen, nicht erreicht, war da ...
 *
 * Steht neben dem Buchungsstatus und ändert ihn nicht - "Termin vereinbart"
 * bestätigt nichts und verschickt keine Bestätigung. Dafür gibt es weiter
 * den Knopf "Bestätigen".
 *
 * Eine Ausnahme mit Folgen: "Nicht erschienen" schickt dem Gast einmal
 * eine freundliche Mail mit dem Weg zu einem neuen Termin. Einmal heißt
 * einmal - wer den Schalter hin- und herschiebt, verschickt sie nicht
 * zweimal (nichtErschienenGesendetAm).
 */
export async function fortschrittSetzen(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fortschritt = fortschrittAusText(String(formData.get("fortschritt") ?? ""));
  if (!fortschritt) return;

  const zugehoerig = await prisma.booking.findUnique({
    where: { id },
    select: { studioId: true },
  });
  await verlangeStudioRecht(zugehoerig?.studioId);

  const booking = await prisma.booking.update({
    where: { id },
    data: { fortschritt, fortschrittAm: new Date() },
    include: { studio: true, slot: { include: { studio: true } } },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/auswertung");

  await protokollieren({
    art: "STATUS",
    bereich: "Buchung",
    betreff: `Anfrage von ${booking.name}`,
    detail: `Fortschritt „${FORTSCHRITT_LABEL[fortschritt]}“`,
    studioId: booking.studioId,
  });

  if (fortschritt === "NICHT_ERSCHIENEN" && !booking.nichtErschienenGesendetAm) {
    const ort = booking.studio ?? booking.slot?.studio ?? null;
    const sprache = booking.sprache === "en" ? "en" : "de";
    const ziel = ort ? `/studio/${ort.slug}` : "/probetermin";
    const gesendet = await sendNichtErschienenEmail({
      email: booking.email,
      name: booking.name,
      studioName: ort?.name ?? null,
      neuerTerminLink: `${siteConfig.url}${pfad(sprache, ziel)}#termin`,
      antwortAn: ort?.email?.trim() || null,
      sprache,
    }).catch((error) => {
      console.error("Mail 'nicht erschienen' konnte nicht gesendet werden:", error);
      return false;
    });
    // Nur bei Erfolg merken: Ging sie nicht raus (etwa weil der Versand
    // noch nicht eingerichtet ist), darf ein späteres erneutes Setzen sie
    // nachholen.
    if (gesendet) {
      await prisma.booking.update({
        where: { id },
        data: { nichtErschienenGesendetAm: new Date() },
      });
    }
  }
}
