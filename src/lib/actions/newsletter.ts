"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import { neuerAbmeldeSchluessel } from "@/lib/newsletter";

export type ActionResult = { ok: boolean; message: string };

export async function subscribeNewsletter(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`newsletter:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, message: waitMessage(limit.retryAfterSeconds) };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      // Beim erneuten Eintragen bleibt der bestehende Schlüssel stehen:
      // Ein alter Abmeldelink, der noch in einem Postfach liegt, soll
      // weiter funktionieren.
      update: {},
      create: { email, abmeldeToken: neuerAbmeldeSchluessel() },
    });
    revalidatePath("/admin/newsletter");
    revalidatePath("/admin");
    return { ok: true, message: "Danke! Du erhältst jetzt unseren Newsletter." };
  } catch {
    return { ok: false, message: "Da ist etwas schiefgelaufen. Bitte versuch es später erneut." };
  }
}

/**
 * Abmeldung über den persönlichen Link.
 *
 * Bewusst eine Aktion und kein Aufruf der Seite: Postfächer und
 * Sicherheitsprogramme rufen Links in E-Mails vorab auf, um sie zu prüfen.
 * Würde schon das Öffnen abmelden, verschwänden Abonnenten, die den Link
 * nie angeklickt haben. Die Seite zeigt deshalb erst einen Knopf - ein
 * Klick, mehr verlangt § 7 UWG auch nicht.
 *
 * Keine Rückfrage "sind Sie sicher": Wer abmelden will, will abmelden.
 *
 * Ein unbekannter Schlüssel meldet Erfolg statt eines Fehlers. Zwei
 * Gründe: Wer den Link zweimal anklickt, soll nicht plötzlich eine
 * Fehlermeldung sehen - und die Seite soll nicht ausplaudern, welche
 * Schlüssel es gibt.
 */
export async function abmeldenVomNewsletter(token: string): Promise<ActionResult> {
  const sauber = token.trim();
  if (!sauber) {
    return { ok: false, message: "Dieser Abmeldelink ist unvollständig." };
  }

  try {
    await prisma.newsletterSubscriber.deleteMany({ where: { abmeldeToken: sauber } });
    revalidatePath("/admin/newsletter");
    revalidatePath("/admin");
    return { ok: true, message: "Du bist abgemeldet." };
  } catch {
    return {
      ok: false,
      message:
        "Die Abmeldung hat gerade nicht geklappt. Versuch es bitte gleich noch einmal - " +
        "oder schreib uns kurz, dann machen wir es von Hand.",
    };
  }
}
