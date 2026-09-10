import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNachfassInternEmail, sendReminderEmail, TEAM_EMAIL } from "@/lib/email";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";
import { terminAngaben } from "@/lib/termin-angaben";

/** Ab wann eine offene Anfrage als liegengeblieben gilt. */
const NACHFASS_NACH_TAGEN = 3;

/** Wie lange das Mail-Protokoll aufgehoben wird. */
const PROTOKOLL_TAGE = 90;

/**
 * Der tägliche Lauf.
 *
 * Drei Dinge, alle einmal am Tag (siehe vercel.json):
 *
 * 1. Erinnerung am Vortag an alle, deren bestätigter Termin morgen ansteht.
 * 2. Erinnerung an das Studio, wenn eine Anfrage zu lange offen liegt.
 * 3. Aufräumen im Mail-Protokoll.
 *
 * Alle drei in einem Weg statt in dreien: Es ist derselbe Takt, dieselbe
 * Absicherung, und jeder weitere Zeitplan ist eine weitere Stelle, an der
 * jemand vergisst, das Geheimnis zu setzen.
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
    include: { slot: { include: { studio: true } }, studio: true },
  });

  let verschickt = 0;
  const fehler: string[] = [];

  for (const buchung of buchungen) {
    try {
      const ok = await sendReminderEmail(terminAngaben(buchung));
      if (!ok) {
        fehler.push(buchung.id);
        continue;
      }
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

  const nachfass = await nachfassen();
  const aufgeraeumt = await altesProtokollLoeschen();

  return NextResponse.json({
    ok: true,
    tag: morgen.toISOString().slice(0, 10),
    gefunden: buchungen.length,
    verschickt,
    fehlgeschlagen: fehler.length,
    nachfass,
    protokollGeloescht: aufgeraeumt,
  });
}

/**
 * Anfragen, die zu lange offen liegen.
 *
 * Eine Anfrage, auf die drei Tage niemand geantwortet hat, ist praktisch
 * verloren - in der Zwischenzeit hat der Interessent woanders angefragt.
 * Diese Erinnerung geht deshalb an das Studio, nicht an den Gast: Ihm zu
 * schreiben, dass wir uns nicht gemeldet haben, macht die Sache nicht
 * besser.
 *
 * Gruppiert je Standort, damit eine Studioleitung nur ihre eigenen
 * Anfragen bekommt - und eine Mail statt fünf.
 */
async function nachfassen() {
  const grenze = new Date(Date.now() - NACHFASS_NACH_TAGEN * 24 * 60 * 60 * 1000);

  const offen = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: grenze },
      // Nur einmal erinnern. Ohne diesen Merker stünde dieselbe Anfrage
      // jeden Tag erneut in der Mail, und nach drei Tagen liest sie
      // niemand mehr.
      nachfassGesendetAm: null,
    },
    include: { studio: { select: { id: true, name: true, email: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  if (offen.length === 0) return { anfragen: 0, mails: 0 };

  // Nach Empfänger bündeln: Standortadresse, sonst die Sammeladresse.
  const gruppen = new Map<string, typeof offen>();
  for (const anfrage of offen) {
    const an = anfrage.studio?.email?.trim() || TEAM_EMAIL;
    if (!an) continue;
    gruppen.set(an, [...(gruppen.get(an) ?? []), anfrage]);
  }

  let mails = 0;
  for (const [an, anfragen] of gruppen) {
    const ok = await sendNachfassInternEmail(
      an,
      anfragen.map((a) => ({
        name: a.name,
        phone: a.phone,
        erreichbarkeit: erreichbarkeitText(a.erreichbarkeit),
        tage: Math.floor((Date.now() - a.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
      })),
    );
    if (!ok) continue;
    mails++;
    await prisma.booking.updateMany({
      where: { id: { in: anfragen.map((a) => a.id) } },
      data: { nachfassGesendetAm: new Date() },
    });
  }

  return { anfragen: offen.length, mails };
}

/**
 * Altes aus dem Mail-Protokoll entfernen.
 *
 * Es enthält E-Mail-Adressen. Für die Frage "ist die Bestätigung
 * rausgegangen" braucht man höchstens ein paar Monate zurück - alles
 * darüber hinaus ist eine Sammlung ohne Zweck.
 */
async function altesProtokollLoeschen() {
  const grenze = new Date(Date.now() - PROTOKOLL_TAGE * 24 * 60 * 60 * 1000);
  const { count } = await prisma.mailLog.deleteMany({
    where: { createdAt: { lt: grenze } },
  });
  return count;
}
