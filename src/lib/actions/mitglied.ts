"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Was ein Mitglied selbst tun kann - über den Schlüssel aus seinen Mails.
 *
 * Kein Konto, kein Passwort: Wer den Link hat, hat das Postfach, und
 * daraus kommt der Link. Mehr als das Folgende geht über ihn nicht:
 * eine Note abgeben, Mails abbestellen, Werbung erlauben oder untersagen.
 */

async function mitgliedZumSchluessel(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return prisma.mitglied.findUnique({
    where: { token },
    select: { id: true, studioId: true },
  });
}

export async function umfrageAbsenden(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`umfrage:${ip}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return { ok: false, message: waitMessage(limit.retryAfterSeconds) };

  const mitglied = await mitgliedZumSchluessel(String(formData.get("token") ?? ""));
  const note = Number(formData.get("note"));
  if (!mitglied) return { ok: false, message: "Dieser Link ist nicht (mehr) gültig." };
  if (!Number.isInteger(note) || note < 1 || note > 5) {
    return { ok: false, message: "Bitte wähle eine Note aus." };
  }
  const kommentar = String(formData.get("kommentar") ?? "").trim().slice(0, 600);

  await prisma.mitglied.update({
    where: { id: mitglied.id },
    data: {
      umfrageNote: note,
      umfrageKommentar: kommentar || null,
      umfrageAm: new Date(),
      // Eine neue Antwort ist ein neuer Anlass - auch wenn das Studio
      // sich nach der letzten schon gemeldet hat.
      nachgehaktAm: null,
    },
  });
  revalidatePath("/admin/mitgliederpflege");

  return {
    ok: true,
    message:
      note <= 3
        ? "Danke für deine Ehrlichkeit. Dein Studio meldet sich bei dir - wir wollen wissen, was wir besser machen können."
        : "Danke! Schön, dass es dir bei uns gefällt.",
  };
}

/** Mails abbestellen - oder wieder bestellen. Ein Klick, keine Rückfrage. */
export async function mailsUmschalten(token: string, abbestellen: boolean) {
  const mitglied = await mitgliedZumSchluessel(token);
  if (!mitglied) return;
  await prisma.mitglied.update({
    where: { id: mitglied.id },
    data: { mailsAbbestellt: abbestellen },
  });
  revalidatePath(`/mitglied/${token}`);
}

/**
 * Werbung per E-Mail erlauben oder untersagen.
 *
 * Gilt als Einwilligung, weil sie ausdrücklich, freiwillig und für einen
 * benannten Zweck gegeben wird - von jemandem, der über einen Link aus
 * seinem eigenen Postfach kommt. Zeitpunkt und Quelle werden für den
 * Nachweis festgehalten.
 */
export async function werbungUmschalten(token: string, erlauben: boolean) {
  const mitglied = await mitgliedZumSchluessel(token);
  if (!mitglied) return;
  await prisma.mitglied.update({
    where: { id: mitglied.id },
    data: {
      werbungErlaubt: erlauben,
      werbungErlaubtAm: erlauben ? new Date() : null,
      werbungQuelle: erlauben ? "Mitgliederbereich" : null,
    },
  });
  revalidatePath(`/mitglied/${token}`);
  revalidatePath("/admin/mitglieder");
}
