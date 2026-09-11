"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import { sendKundenbereichEmail } from "@/lib/email";
import {
  emailNormalisieren,
  emailPlausibel,
  GUELTIG_MINUTEN,
  zugangErstellen,
  zugangsLink,
} from "@/lib/kundenbereich";

export type ActionResult = { ok: boolean; message: string };

/**
 * Die immer gleiche Antwort.
 *
 * Sie steht als Konstante da, damit niemand sie versehentlich an einer
 * Stelle anders formuliert. Genau darin liegt der Schutz: Ob es zu dieser
 * Adresse Termine gibt, ob die Adresse überhaupt existiert, ob gerade zu
 * oft angefordert wurde - alles beantwortet dieses eine Satzpaar. Sonst
 * wäre das Formular eine Auskunftsstelle darüber, wer hier Kunde ist.
 */
const IMMER_GLEICH =
  "Wenn es zu dieser Adresse Termine gibt, ist der Link unterwegs. " +
  `Er gilt ${GUELTIG_MINUTEN} Minuten - schau auch im Spam-Ordner nach.`;

export async function zugangAnfordern(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  // Zehn Anforderungen je Stunde und Anschluss. Großzügig genug für ein
  // Büro mit gemeinsamer Leitung, eng genug gegen einen Reihenversuch.
  const limit = checkRateLimit(`kundenbereich:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    // Die einzige Ausnahme von der immer gleichen Antwort - und sie
    // verrät nichts über die eingegebene Adresse, sondern nur über den
    // eigenen Anschluss.
    return { ok: false, message: waitMessage(limit.retryAfterSeconds) };
  }

  const email = emailNormalisieren(String(formData.get("email") ?? ""));
  if (!emailPlausibel(email)) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  // Der Versand läuft nach der Antwort weiter. Sonst hinge die Seite an
  // der Zustellzeit des Mailanbieters - und eine langsame Antwort ist
  // selbst schon eine Auskunft darüber, dass es hier etwas zu tun gab.
  after(async () => {
    try {
      const buchungen = await prisma.booking.findMany({
        // Ohne Rücksicht auf Groß- und Kleinschreibung: An der Anfrage
        // steht die Adresse so, wie sie jemand getippt hat - also auch
        // mal "Max@Example.de". Hier kommt sie kleingeschrieben an, und
        // ein genauer Vergleich fände dann nichts. Der Betroffene bekäme
        // keine Mail und wüsste nicht, warum.
        where: { email: { equals: email, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { name: true },
      });

      // Keine Termine, keine Mail. Eine Nachricht "zu dir haben wir
      // nichts" wäre die Bestätigung, dass die Adresse zugestellt werden
      // kann - und eine Mail an jemanden, der nie hier war.
      if (buchungen.length === 0) return;

      const schluessel = await zugangErstellen(email);
      if (!schluessel) return;

      await sendKundenbereichEmail({
        email,
        name: buchungen[0].name.split(" ")[0] || null,
        link: zugangsLink(schluessel),
        gueltigMinuten: GUELTIG_MINUTEN,
      });
    } catch (error) {
      // Der Besucher hat seine Antwort längst. Hier bleibt nur, den
      // Fehler zu hinterlassen, statt ihn verschwinden zu lassen.
      console.error("Zugangslink konnte nicht verschickt werden:", error);
    }
  });

  return { ok: true, message: IMMER_GLEICH };
}
