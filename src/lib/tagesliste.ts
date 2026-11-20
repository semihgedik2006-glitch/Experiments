import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";
import { FORTSCHRITT_LABEL, UNBEARBEITET } from "@/lib/fortschritt";
import { siteConfig } from "@/lib/site-config";

/**
 * Die Tagesliste: jeden Morgen eine Mail an jedes Studio.
 *
 * Darin steht, was heute zu tun ist - wen noch niemand erreicht hat und
 * wer heute zum Termin kommt. Das ersetzt nicht den Adminbereich, es holt
 * ihn in den Posteingang: Wer morgens die Mails liest, sieht die Liste,
 * ohne sich erst anmelden zu müssen.
 *
 * Bewusst nur, wenn es etwas gibt. Eine tägliche Mail "heute nichts" wird
 * nach einer Woche ungelesen weggeklickt - und dann auch an dem Tag, an
 * dem etwas drinsteht.
 *
 * Einmal pro Studio und Tag (MailLog). Läuft der Auslöser zweimal, etwa
 * weil Vercel ihn wiederholt, bekommt niemand die Liste doppelt.
 */

type Ergebnis = { studios: number; verschickt: number; uebersprungen: number; fehlgeschlagen: number };

/** Der heutige Kalendertag in deutscher Ortszeit, als UTC-Mitternacht. */
export function heuteGrenzen(jetzt: Date = new Date()) {
  const text = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(jetzt);
  const [jahr, monat, tag] = text.split("-").map(Number);
  return {
    heute: new Date(Date.UTC(jahr, monat - 1, tag)),
    morgen: new Date(Date.UTC(jahr, monat - 1, tag + 1)),
    // Für den Vergleich mit createdAt der MailLog: Beginn des Tages
    // reicht hier ungefähr - eine Stunde Zeitzonenversatz ist egal, solange
    // der Lauf einmal am Morgen kommt.
    tagText: text,
  };
}

export async function tageslistenVerschicken(
  senden: (an: string, betreff: string, text: string) => Promise<boolean>,
  jetzt: Date = new Date(),
): Promise<Ergebnis> {
  const { heute, morgen } = heuteGrenzen(jetzt);
  const ergebnis: Ergebnis = { studios: 0, verschickt: 0, uebersprungen: 0, fehlgeschlagen: 0 };

  const studios = await prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } });

  for (const studio of studios) {
    ergebnis.studios += 1;
    const an = studio.email?.trim();
    if (!an) {
      ergebnis.uebersprungen += 1;
      continue;
    }

    // Schon heute verschickt? Dann nicht noch einmal.
    const schon = await prisma.mailLog.findFirst({
      where: { art: "TAGESLISTE", empfaenger: an, ok: true, createdAt: { gte: heute } },
      select: { id: true },
    });
    if (schon) {
      ergebnis.uebersprungen += 1;
      continue;
    }

    const [offen, termine] = await Promise.all([
      prisma.booking.findMany({
        where: {
          studioId: studio.id,
          fortschritt: { in: UNBEARBEITET },
          status: { not: "CANCELLED" },
        },
        orderBy: { createdAt: "asc" },
        take: 30,
      }),
      prisma.booking.findMany({
        where: {
          status: "CONFIRMED",
          OR: [
            { studioId: studio.id, slot: { is: { date: { gte: heute, lt: morgen } } } },
            { slot: { is: { studioId: studio.id, date: { gte: heute, lt: morgen } } } },
            { studioId: studio.id, slotId: null, terminTag: { gte: heute, lt: morgen } },
          ],
        },
        include: { slot: true },
      }),
    ]);

    if (offen.length === 0 && termine.length === 0) {
      ergebnis.uebersprungen += 1;
      continue;
    }

    const uhrzeit = (b: (typeof termine)[number]) => b.slot?.startTime ?? b.terminUhrzeit ?? "";
    termine.sort((a, b) => uhrzeit(a).localeCompare(uhrzeit(b)));

    const ort = studio.name.replace(/^Körperformen\s+/i, "");
    const zeilen: string[] = [`Guten Morgen ${ort},`, "", `hier ist eure Liste für ${formatDate(heute)}.`];

    if (termine.length > 0) {
      zeilen.push("", `HEUTE IM STUDIO (${termine.length})`);
      for (const b of termine) {
        zeilen.push(`- ${uhrzeit(b) ? `${uhrzeit(b)} Uhr` : "Uhrzeit offen"}: ${b.name}, ${b.phone}${b.zuZweit ? " (zu zweit)" : ""}`);
      }
    }

    if (offen.length > 0) {
      zeilen.push("", `NOCH ZU ERREICHEN (${offen.length}, älteste zuerst)`);
      for (const b of offen) {
        const teile = [
          `- ${b.name}, ${b.phone}`,
          `  eingegangen ${formatDate(b.createdAt)} · ${FORTSCHRITT_LABEL[b.fortschritt]}`,
          `  erreichbar: ${erreichbarkeitText(b.erreichbarkeit)}`,
        ];
        if (b.terminWunsch) teile.push(`  Wunschzeit: ${b.terminWunsch}`);
        if (b.sprache === "en") teile.push("  bitte auf Englisch zurückrufen");
        zeilen.push(...teile);
      }
    }

    zeilen.push(
      "",
      "Den Stand tragt ihr direkt bei der Anfrage ein (angerufen, nicht erreicht, war da ...):",
      `${siteConfig.url}/admin/bookings?studio=${studio.id}`,
      "",
      "Diese Mail kommt nur an Tagen, an denen etwas ansteht.",
    );

    const betreff = `Tagesliste ${ort}: ${termine.length} ${termine.length === 1 ? "Termin" : "Termine"}, ${offen.length} offen`;
    const ok = await senden(an, betreff, zeilen.join("\n")).catch(() => false);
    if (ok) ergebnis.verschickt += 1;
    else ergebnis.fehlgeschlagen += 1;
  }

  return ergebnis;
}
