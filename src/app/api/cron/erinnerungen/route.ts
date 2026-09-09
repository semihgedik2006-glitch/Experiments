import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { terminAngaben } from "@/lib/termin-angaben";

/**
 * Erinnerung am Vortag.
 *
 * Läuft einmal täglich (siehe vercel.json) und schreibt allen, deren
 * bestätigter Termin am nächsten Tag ansteht.
 *
 * Zwei Dinge, die hier leicht schiefgehen:
 *
 * Doppelte Mails. Läuft der Lauf zweimal - weil er wiederholt wird, weil
 * jemand ihn von Hand anstößt - bekäme jeder Gast zwei Erinnerungen.
 * Deshalb wird reminderSentAt gesetzt und vorher geprüft.
 *
 * Der falsche Tag. "Morgen" heißt der Kalendertag in deutscher Ortszeit,
 * nicht 24 Stunden ab jetzt. Der Lauf startet nachts; ohne diese
 * Unterscheidung wäre die Grenze mitten am Tag und träfe mal den einen,
 * mal den anderen Termin.
 */

function tagesGrenzenMorgen() {
  // Der heutige Kalendertag in deutscher Ortszeit.
  const heuteText = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [jahr, monat, tag] = heuteText.split("-").map(Number);

  // Die Termine liegen als Kalendertag in der Datenbank (Mitternacht).
  // Verglichen wird deshalb ebenfalls auf Tagesebene.
  const morgen = new Date(Date.UTC(jahr, monat - 1, tag + 1, 0, 0, 0));
  const uebermorgen = new Date(Date.UTC(jahr, monat - 1, tag + 2, 0, 0, 0));
  return { morgen, uebermorgen };
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const { morgen, uebermorgen } = tagesGrenzenMorgen();

  const buchungen = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderSentAt: null,
      slot: { is: { date: { gte: morgen, lt: uebermorgen } } },
    },
    include: { slot: { include: { studio: true } } },
  });

  let verschickt = 0;
  const fehler: string[] = [];

  for (const buchung of buchungen) {
    try {
      await sendReminderEmail(terminAngaben(buchung));
      // Erst nach erfolgreichem Versand vermerken - schlägt der Versand
      // fehl, soll der Lauf am nächsten Tag es noch einmal versuchen
      // können, statt die Erinnerung stillschweigend zu verlieren.
      await prisma.booking.update({
        where: { id: buchung.id },
        data: { reminderSentAt: new Date() },
      });
      verschickt++;
    } catch (error) {
      // Eine fehlgeschlagene Mail darf die übrigen nicht aufhalten.
      console.error(`Erinnerung für Buchung ${buchung.id} fehlgeschlagen:`, error);
      fehler.push(buchung.id);
    }
  }

  return NextResponse.json({
    ok: true,
    tag: morgen.toISOString().slice(0, 10),
    gefunden: buchungen.length,
    verschickt,
    fehlgeschlagen: fehler.length,
  });
}
