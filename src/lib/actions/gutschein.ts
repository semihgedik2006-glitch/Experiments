"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGutscheinEingangEmail, sendGutscheinInternEmail, TEAM_EMAIL } from "@/lib/email";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import { isVisible } from "@/lib/site-toggles";
import { emailNormalisieren, emailPlausibel } from "@/lib/kundenbereich";
import {
  STARTPAKET_WERT,
  WERT_STUFEN,
  artText,
} from "@/lib/gutschein";
import { freierGutscheinCode } from "@/lib/gutschein-code";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Einen Gutschein über die Website anfragen.
 *
 * Es wird nichts bezahlt und nichts verschickt außer zwei Mails: eine an
 * den Käufer ("angekommen, das Studio meldet sich"), eine ans Studio. Der
 * Code entsteht schon jetzt, gilt aber erst, wenn das Studio ihn nach dem
 * Bezahlen ausstellt.
 */

const GRENZEN = { name: 80, email: 160, telefon: 40, fuer: 60, widmung: 140 } as const;

function feld(formData: FormData, name: string, grenze: number): string {
  return String(formData.get(name) ?? "").trim().slice(0, grenze);
}

export async function gutscheinAnfragen(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  // Ist die Seite ausgeschaltet, nimmt auch die Aktion nichts an - sie
  // ließe sich sonst ohne die Seite aufrufen.
  if (!(await isVisible("gutscheine"))) {
    return { ok: false, message: "Gutscheine können gerade nicht online angefragt werden." };
  }

  const ip = await getClientIp();
  const limit = checkRateLimit(`gutschein:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, message: waitMessage(limit.retryAfterSeconds) };
  }

  const erfolg = {
    ok: true,
    message: "Danke! Deine Anfrage ist angekommen - das Studio meldet sich bei dir.",
  };

  // Bot-Falle wie im Kontaktformular.
  if (String(formData.get("website") ?? "").trim()) return erfolg;

  const auswahl = String(formData.get("auswahl") ?? "");
  const art = auswahl === "startpaket" ? "startpaket" : "wert";
  const betrag =
    art === "startpaket" ? Math.round(STARTPAKET_WERT) : Number(auswahl.replace("wert-", ""));
  if (art === "wert" && !(WERT_STUFEN as readonly number[]).includes(betrag)) {
    return { ok: false, message: "Bitte wähle einen Gutschein aus." };
  }

  const name = feld(formData, "name", GRENZEN.name);
  const emailRoh = feld(formData, "email", GRENZEN.email);
  const telefon = feld(formData, "telefon", GRENZEN.telefon);
  const fuer = feld(formData, "fuer", GRENZEN.fuer);
  const widmung = feld(formData, "widmung", GRENZEN.widmung);
  const studioId = String(formData.get("studioId") ?? "").trim();

  if (!name) return { ok: false, message: "Bitte gib deinen Namen an." };
  const email = emailRoh ? emailNormalisieren(emailRoh) : "";
  if (!email || !emailPlausibel(email)) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse an." };
  }
  if (!telefon) {
    return { ok: false, message: "Bitte gib eine Telefonnummer an - das Studio ruft dich zum Abholen an." };
  }

  const studio = studioId
    ? await prisma.studioLocation.findUnique({
        where: { id: studioId },
        select: { id: true, name: true, email: true, phone: true, street: true, postalCode: true, city: true },
      })
    : null;
  if (!studio) return { ok: false, message: "Bitte wähle das Studio, in dem du abholen möchtest." };

  const code = await freierGutscheinCode();
  await prisma.gutschein.create({
    data: {
      code,
      art,
      betrag,
      studioId: studio.id,
      kaeuferName: name,
      kaeuferEmail: email,
      kaeuferTelefon: telefon,
      fuer: fuer || null,
      widmung: widmung || null,
    },
  });

  const angaben = {
    kaeuferName: name,
    kaeuferEmail: email,
    kaeuferTelefon: telefon,
    bezeichnung: artText(art, betrag),
    fuer: fuer || null,
    widmung: widmung || null,
    studioName: studio.name,
    studioAdresse: `${studio.street}, ${studio.postalCode} ${studio.city}`,
    studioTelefon: studio.phone,
    antwortAn: studio.email,
  };

  // Nach der Antwort: Der Käufer soll nicht auf den Mailanbieter warten.
  const an = studio.email?.trim() || TEAM_EMAIL;
  after(async () => {
    await sendGutscheinEingangEmail(angaben);
    if (an) await sendGutscheinInternEmail(an, angaben);
  });

  revalidatePath("/admin/gutscheine");
  return erfolg;
}
