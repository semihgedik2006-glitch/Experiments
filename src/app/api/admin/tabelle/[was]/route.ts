import { prisma } from "@/lib/prisma";
import { aktuellerAdmin, studioEinschraenkung } from "@/lib/admin-rechte";
import { formatDate } from "@/lib/format";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";

/**
 * Buchungen und Newsletter-Abonnenten als Tabelle zum Weiterverarbeiten.
 *
 * Ausgegeben wird CSV mit Semikolon als Trennzeichen: Excel in deutscher
 * Einstellung erwartet das Semikolon und würde eine kommagetrennte Datei in
 * eine einzige Spalte kippen.
 *
 * Am Anfang steht ein sogenanntes BOM. Ohne dieses Zeichen zeigt Excel
 * Umlaute als Buchstabensalat an - "Hürth" wird zu "HÃ¼rth". Andere
 * Programme überspringen es.
 *
 * Eine Studioleitung bekommt nur die Buchungen ihres Standorts; die
 * Abonnentenliste gehört zur Marke und bleibt der Leitung vorbehalten.
 */

function feld(wert: unknown): string {
  const text = wert === null || wert === undefined ? "" : String(wert);
  // Anführungszeichen verdoppeln, alles einschließen. Ohne das würde ein
  // Semikolon in einer Nachricht die Spalten verschieben.
  return `"${text.replace(/"/g, '""')}"`;
}

function alsCsv(kopf: string[], zeilen: unknown[][]): string {
  const inhalt = [kopf, ...zeilen].map((zeile) => zeile.map(feld).join(";")).join("\r\n");
  return "﻿" + inhalt + "\r\n";
}

const statusText: Record<string, string> = {
  PENDING: "Offen",
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ was: string }> },
) {
  const admin = await aktuellerAdmin();
  if (!admin) return new Response("Nicht autorisiert.", { status: 401 });

  const { was } = await params;
  const datum = new Date().toISOString().slice(0, 10);

  if (was === "buchungen") {
    const nurStudio = studioEinschraenkung(admin);

    const buchungen = await prisma.booking.findMany({
      where: nurStudio ? { studioId: nurStudio } : undefined,
      include: {
        slot: true,
        studio: { select: { name: true } },
        promotion: { select: { code: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const csv = alsCsv(
      [
        "Eingegangen am",
        "Name",
        "E-Mail",
        "Telefon",
        "Status",
        "Termin",
        "Uhrzeit",
        "Studio",
        "Erreichbar",
        "Personen",
        "Terminwunsch",
        "Aktionscode",
        "Kampagne",
        "Kam über",
        "Seite",
        "Nachricht",
        "Interner Vermerk",
      ],
      buchungen.map((b) => [
        formatDate(b.createdAt),
        b.name,
        b.email,
        b.phone,
        statusText[b.status] ?? b.status,
        b.slot ? formatDate(b.slot.date) : "kein fester Termin",
        b.slot ? `${b.slot.startTime} - ${b.slot.endTime}` : "",
        b.studio?.name ?? "",
        erreichbarkeitText(b.erreichbarkeit),
        b.zuZweit ? "2" : "1",
        b.terminWunsch ?? "",
        b.promotion?.code ?? "",
        b.herkunftKampagne ?? "",
        b.herkunftQuelle ?? "",
        b.herkunftSeite ?? "",
        b.message ?? "",
        b.internalNote ?? "",
      ]),
    );

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="koerperformen-buchungen-${datum}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (was === "newsletter") {
    if (!admin.istLeitung) {
      return new Response("Dafür fehlt die Berechtigung.", { status: 403 });
    }

    const abonnenten = await prisma.newsletterSubscriber.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const csv = alsCsv(
      ["E-Mail", "Angemeldet am"],
      abonnenten.map((a) => [a.email, formatDate(a.createdAt)]),
    );

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="koerperformen-newsletter-${datum}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response("Unbekannte Tabelle.", { status: 404 });
}
