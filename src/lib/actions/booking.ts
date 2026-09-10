"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import {
  sendAnfrageEingangEmail,
  sendAnfrageInternEmail,
  TEAM_EMAIL,
  type AnfrageAngaben,
} from "@/lib/email";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import { neuerVerwaltungsSchluessel } from "@/lib/termin-angaben";
import { istErreichbarkeit } from "@/lib/erreichbarkeit";
import { aktionscodePruefen } from "@/lib/aktionscode";
import { herkunftAusFormular } from "@/lib/herkunft";
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
  const studioIdRoh = String(formData.get("studioId") ?? "").trim();
  const erreichbarkeit = String(formData.get("erreichbarkeit") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  // Gekürzt statt abgewiesen: Der Wunsch ist ein Zusatz, an dem keine
  // Anfrage scheitern soll. 200 Zeichen sind mehr als jede Zeitangabe
  // braucht.
  const terminWunsch = String(formData.get("terminWunsch") ?? "").trim().slice(0, 200);

  if (!name || !email || !phone) {
    return { ok: false, message: "Bitte fülle alle Pflichtfelder aus." };
  }

  // Nur eine der vorgesehenen Zeitspannen. Das Feld kommt aus einer
  // Auswahl, aber ein Formular lässt sich auch ohne Browser abschicken -
  // ungeprüft stünde hier beliebiger Text.
  if (!istErreichbarkeit(erreichbarkeit)) {
    return {
      ok: false,
      message: "Bitte sag uns, wann wir dich telefonisch am besten erreichen.",
    };
  }

  // Der Standort wird gegen die Datenbank geprüft, nicht geglaubt. Sonst
  // ließe sich eine beliebige Kennung mitschicken und die Anfrage landete
  // bei einem Studio, das es nicht gibt.
  const studio = studioIdRoh
    ? await prisma.studioLocation.findUnique({
        where: { id: studioIdRoh },
        select: { id: true },
      })
    : null;

  // Gibt es überhaupt Studios, muss eines dabei sein. Ist noch keines
  // angelegt, soll eine Anfrage trotzdem durchgehen - sie ohne Standort
  // anzunehmen ist besser, als einen Interessenten wegzuschicken.
  if (!studio) {
    const gibtStudios = (await prisma.studioLocation.count()) > 0;
    if (gibtStudios) {
      return { ok: false, message: "Bitte wähle oben das Studio aus, in dem du trainieren möchtest." };
    }
  }

  // Der Code wird geprüft, bevor die Anfrage entsteht: Eine angenommene
  // Anfrage mit einem Code, den es nicht gibt, führt später im Studio zu
  // einem unangenehmen Gespräch.
  const codePruefung = await aktionscodePruefen(String(formData.get("aktionsCode") ?? ""));
  if (!codePruefung.ok) {
    return { ok: false, message: codePruefung.meldung };
  }

  if (slotId) {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: { bookings: { where: { status: { not: "CANCELLED" } } } },
    });

    if (!slot) {
      return { ok: false, message: "Dieser Termin existiert nicht mehr. Bitte wähle einen anderen." };
    }

    // Termin und Standort müssen zusammenpassen. Im Formular ist das immer
    // so - die Zeiten stammen aus dem gewählten Studio. Ohne Prüfung
    // stünde an der Anfrage aber ein Standort, an dem der Termin gar nicht
    // stattfindet, und die Studioleitung sähe eine Buchung für einen
    // Termin, den sie nicht hat.
    if (studio && slot.studioId !== studio.id) {
      return { ok: false, message: "Termin und Studio passen nicht zusammen. Bitte wähle die Zeit noch einmal." };
    }

    if (slot.bookings.length >= slot.capacity) {
      return { ok: false, message: "Dieser Termin ist leider bereits ausgebucht. Bitte wähle einen anderen." };
    }
  }

  const herkunft = herkunftAusFormular(formData);

  const buchung = await prisma.booking.create({
    data: {
      slotId,
      studioId: studio?.id ?? null,
      name,
      email,
      phone,
      message: message || null,
      terminWunsch: terminWunsch || null,
      erreichbarkeit,
      promotionId: codePruefung.aktion?.id ?? null,
      herkunftSeite: herkunft.seite,
      herkunftKampagne: herkunft.kampagne,
      herkunftQuelle: herkunft.quelle,
      manageToken: neuerVerwaltungsSchluessel(),
    },
    include: { slot: true, studio: { select: { name: true, email: true } } },
  });

  // Die beiden Mails laufen NACH der Antwort.
  //
  // Grund: Zwei Anfragen an den Mailanbieter kosten zusammen leicht eine
  // Sekunde. Die Buchung steht zu diesem Zeitpunkt bereits in der
  // Datenbank - der Besucher hat also nichts davon, darauf zu warten, und
  // ein Ausfall des Anbieters darf nicht so aussehen, als sei die Anfrage
  // fehlgeschlagen.
  after(async () => {
    const angaben: AnfrageAngaben = {
      id: buchung.id,
      name: buchung.name,
      email: buchung.email,
      phone: buchung.phone,
      erreichbarkeit: erreichbarkeitText(buchung.erreichbarkeit),
      studioName: buchung.studio?.name ?? null,
      terminZeile: buchung.slot
        ? `${formatDate(buchung.slot.date)} um ${buchung.slot.startTime} Uhr`
        : "kein fester Termin - individuell abzustimmen",
      terminWunsch: buchung.terminWunsch,
      nachricht: buchung.message,
      aktionsCode: codePruefung.aktion?.code ?? null,
      herkunft: [herkunft.kampagne, herkunft.quelle, herkunft.seite]
        .filter(Boolean)
        .join(" · ") || null,
    };

    await sendAnfrageEingangEmail(angaben);

    // An das Studio, sonst an die Sammeladresse. Gibt es beides nicht,
    // unterbleibt die Benachrichtigung - eine Mail an eine geratene
    // Adresse wäre schlimmer als keine.
    const an = buchung.studio?.email?.trim() || TEAM_EMAIL;
    if (an) {
      const ok = await sendAnfrageInternEmail(an, angaben);
      if (ok) {
        await prisma.booking.update({
          where: { id: buchung.id },
          data: { studioBenachrichtigtAm: new Date() },
        });
      }
    }
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return {
    ok: true,
    message: "Danke für deine Anfrage! Wir melden uns in Kürze zur Bestätigung deines Probetermins.",
  };
}
