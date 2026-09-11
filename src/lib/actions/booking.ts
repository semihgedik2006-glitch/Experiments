"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import {
  sendAnfrageEingangEmail,
  sendAnfrageInternEmail,
  sendWartelisteInternEmail,
  TEAM_EMAIL,
  type AnfrageAngaben,
} from "@/lib/email";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import { neuerVerwaltungsSchluessel } from "@/lib/termin-angaben";
import { istErreichbarkeit } from "@/lib/erreichbarkeit";
import { istZiel, zielText } from "@/lib/ziel";
import { aktionscodePruefen } from "@/lib/aktionscode";
import { herkunftAusFormular } from "@/lib/herkunft";
import { passtNoch } from "@/lib/kapazitaet";
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
  const zuZweit = formData.get("zuZweit") === "on";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  // Gekürzt statt abgewiesen: Die Nachricht ist ein Zusatz, an dem keine
  // Anfrage scheitern soll.
  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);
  // Freiwillig, deshalb hier keine Abweisung: Ein Wert, den es nicht gibt,
  // wird stillschweigend verworfen. Er kommt aus einer Auswahl, aber ein
  // Formular lässt sich auch ohne Browser abschicken - ungeprüft stünde
  // hier beliebiger Text und liefe später in die Auswertung.
  const zielRoh = String(formData.get("ziel") ?? "").trim();
  const ziel = istZiel(zielRoh) ? zielRoh : null;

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

    // Voll? Dann auf die Warteliste statt in eine Fehlermeldung.
    //
    // Vorher endete dieser Fall mit "leider ausgebucht" - und damit
    // meistens im Abbruch. Dabei ist das jemand, der alles ausgefüllt hat
    // und genau weiß, wann er kann. Der Fall trifft zwei Gruppen: die,
    // die absichtlich eine belegte Zeit angeklickt haben, und die, bei
    // denen der Platz zwischen Aufrufen und Absenden weg war.
    if (!passtNoch(slot.capacity, slot.bookings, zuZweit)) {
      await prisma.warteliste.create({
        data: {
          slotId: slot.id,
          studioId: slot.studioId,
          name,
          email,
          phone,
          erreichbarkeit,
          zuZweit,
        },
      });

      // Das Studio erfährt davon sofort - genau wie bei einer regulären
      // Anfrage. Ein Wartender ist ein Interessent mit Telefonnummer;
      // meistens lässt sich mit einem Anruf und einer anderen Zeit
      // schneller etwas finden als durch Abwarten.
      const studioMail = await prisma.studioLocation
        .findUnique({ where: { id: slot.studioId }, select: { name: true, email: true } })
        .catch(() => null);
      const an = studioMail?.email?.trim() || TEAM_EMAIL;
      if (an) {
        after(async () => {
          await sendWartelisteInternEmail(an, {
            name,
            email,
            phone,
            erreichbarkeit: erreichbarkeitText(erreichbarkeit),
            terminZeile: `${formatDate(slot.date)} um ${slot.startTime} Uhr`,
            studioName: studioMail?.name ?? null,
            zuZweit,
          });
        });
      }

      revalidatePath("/admin/warteliste");
      return {
        ok: true,
        message: zuZweit
          ? "Für diese Zeit sind gerade nicht mehr zwei Plätze frei - wir haben dich auf die Warteliste gesetzt und melden uns, sobald etwas frei wird."
          : "Diese Zeit ist gerade belegt - wir haben dich auf die Warteliste gesetzt und melden uns, sobald etwas frei wird.",
      };
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
      ziel,
      erreichbarkeit,
      zuZweit,
      promotionId: codePruefung.aktion?.id ?? null,
      // Entweder das eine oder das andere - ein Code ist nie beides.
      empfehlungId: codePruefung.empfehlung?.id ?? null,
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
      // Als Beschriftung, nicht als gespeicherter Wert: In der Mail soll
      // "Rücken stärken" stehen und nicht "ruecken".
      ziel: buchung.ziel ? zielText(buchung.ziel) : null,
      nachricht: buchung.message,
      // Der Code steht in der Mail ans Studio, damit der Rückruf nicht
      // erst im Adminbereich nachsehen muss, warum jemand etwas erwartet.
      aktionsCode:
        codePruefung.aktion?.code ??
        (codePruefung.empfehlung
          ? `${codePruefung.empfehlung.code} (Empfehlung von ${codePruefung.empfehlung.werbender})`
          : null),
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
