"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import { sendCancelledByGuestEmail, sendMovedByGuestEmail } from "@/lib/email";
import { terminAngaben } from "@/lib/termin-angaben";
import { wartelisteBenachrichtigen } from "@/lib/warteliste";
import { passtNoch } from "@/lib/kapazitaet";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Absagen und Verschieben durch den Gast selbst.
 *
 * Der Schlüssel aus dem Link ist der einzige Nachweis. Er ist mit 32 Byte
 * Zufall nicht zu erraten - trotzdem ist eine Zugriffsbegrenzung gesetzt:
 * Sie kostet nichts und macht aus einem theoretischen Ratversuch auch
 * keinen praktischen.
 *
 * Ein Termin in der Vergangenheit lässt sich nicht mehr ändern. Sonst
 * könnte ein Gast am Folgetag noch absagen, und im Studio stünde die
 * Auswertung auf dem Kopf.
 */

const NICHT_GEFUNDEN = "Dieser Link gehört zu keinem Termin mehr.";

function istVorbei(datum: Date): boolean {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return datum < heute;
}

async function ladeBuchung(token: string) {
  if (!token) return null;
  return prisma.booking.findUnique({
    where: { manageToken: token },
    include: { slot: { include: { studio: true } }, studio: true },
  });
}

export async function terminAbsagen(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "").trim();

  const ip = await getClientIp();
  const limit = checkRateLimit(`termin:${ip}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return { ok: false, message: waitMessage(limit.retryAfterSeconds) };

  const buchung = await ladeBuchung(token);
  if (!buchung) return { ok: false, message: NICHT_GEFUNDEN };

  if (buchung.status === "CANCELLED") {
    return { ok: true, message: "Dieser Termin war bereits abgesagt." };
  }
  if (buchung.slot && istVorbei(buchung.slot.date)) {
    return { ok: false, message: "Dieser Termin liegt in der Vergangenheit." };
  }

  const abgesagt = await prisma.booking.update({
    where: { id: buchung.id },
    data: { status: "CANCELLED" },
    include: { slot: { include: { studio: true } }, studio: true },
  });

  try {
    await sendCancelledByGuestEmail(terminAngaben(abgesagt));
  } catch (error) {
    // Die Absage steht bereits in der Datenbank - eine hakelnde
    // Mailzustellung darf sie nicht rückgängig aussehen lassen.
    console.error("Absage-Bestätigung konnte nicht gesendet werden:", error);
  }

  // Der Platz ist jetzt frei - der Nächste auf der Warteliste bekommt
  // Bescheid.
  await wartelisteBenachrichtigen(buchung.slotId);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/probetermin");

  return { ok: true, message: "Dein Termin ist abgesagt. Wir haben dir eine Bestätigung geschickt." };
}

export async function terminVerschieben(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "").trim();
  const neuerSlotId = String(formData.get("slotId") ?? "").trim();

  const ip = await getClientIp();
  const limit = checkRateLimit(`termin:${ip}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return { ok: false, message: waitMessage(limit.retryAfterSeconds) };

  const buchung = await ladeBuchung(token);
  if (!buchung) return { ok: false, message: NICHT_GEFUNDEN };
  if (!neuerSlotId) return { ok: false, message: "Bitte wähle eine neue Uhrzeit." };

  if (buchung.status === "CANCELLED") {
    return {
      ok: false,
      message: "Dieser Termin wurde abgesagt. Bitte buche einen neuen Probetermin.",
    };
  }
  if (buchung.slot && istVorbei(buchung.slot.date)) {
    return { ok: false, message: "Dieser Termin liegt in der Vergangenheit." };
  }

  const ziel = await prisma.availabilitySlot.findUnique({
    where: { id: neuerSlotId },
    include: { bookings: { where: { status: { not: "CANCELLED" } } } },
  });

  if (!ziel) return { ok: false, message: "Diese Zeit gibt es nicht mehr. Bitte wähle eine andere." };
  if (istVorbei(ziel.date)) {
    return { ok: false, message: "Diese Zeit liegt in der Vergangenheit." };
  }
  // Verschieben heißt: andere Zeit, gleicher Ort. Die Seite bietet auch
  // nur Zeiten des eigenen Studios an - aber die Kennung ließe sich von
  // Hand austauschen, und dann stünde die Anfrage plötzlich bei einem
  // anderen Standort im Kalender, ohne dass dort jemand davon weiß.
  const eigenesStudio = buchung.studioId ?? buchung.slot?.studioId ?? null;
  if (eigenesStudio && ziel.studioId !== eigenesStudio) {
    return {
      ok: false,
      message: "Diese Zeit gehört zu einem anderen Studio. Für einen Wechsel des Standorts buche bitte einen neuen Probetermin.",
    };
  }
  // Die eigene Buchung zählt nicht gegen die Kapazität des Ziels - sie
  // steht ja noch am alten Termin.
  //
  // Gezählt werden Plätze, nicht Buchungen: Wer zu zweit kommt, braucht
  // auch nach dem Verschieben zwei. Vorher wurden hier Buchungen gezählt,
  // und ein Paar wäre in einen Termin mit einem freien Platz gerutscht.
  const andere = ziel.bookings.filter((b) => b.id !== buchung.id);
  if (!passtNoch(ziel.capacity, andere, buchung.zuZweit)) {
    return {
      ok: false,
      message: buchung.zuZweit
        ? "Für diese Zeit sind nicht mehr zwei Plätze frei. Bitte wähle eine andere."
        : "Diese Zeit ist inzwischen ausgebucht. Bitte wähle eine andere.",
    };
  }

  const verschoben = await prisma.booking.update({
    where: { id: buchung.id },
    data: {
      slotId: ziel.id,
      // Anfragen von vor der Standortspalte haben noch keinen Standort.
      // Beim Verschieben ist er hier bekannt - dann setzen wir ihn gleich,
      // statt die Lücke weiterzuschleppen.
      studioId: ziel.studioId,
      // Die Erinnerung gilt dem neuen Termin - der Merker muss zurück,
      // sonst bliebe sie aus.
      reminderSentAt: null,
    },
    include: { slot: { include: { studio: true } }, studio: true },
  });

  try {
    await sendMovedByGuestEmail(terminAngaben(verschoben));
  } catch (error) {
    console.error("Bestätigung der Verlegung konnte nicht gesendet werden:", error);
  }

  // Die alte Zeit ist jetzt frei - wer dafür auf der Warteliste steht,
  // bekommt Bescheid. Die neue Zeit war frei, sonst wäre der Wechsel
  // abgelehnt worden.
  await wartelisteBenachrichtigen(buchung.slotId);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/verfuegbarkeit");
  revalidatePath("/probetermin");

  return { ok: true, message: "Dein Termin wurde verschoben. Die Bestätigung ist unterwegs." };
}
