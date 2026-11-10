import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";
import { zielText } from "@/lib/ziel";
import { STATUS_LABEL } from "@/lib/buchung-status";
import { FORTSCHRITT_LABEL } from "@/lib/fortschritt";
import { themenLesen } from "@/lib/blog-themen";
import { protokollieren } from "@/lib/protokoll";
import { revalidatePath } from "@/lib/revalidieren";
import { kurzKennung, noxSignaturPruefen, ohnePersonendaten, tagesbeginnKoeln } from "@/lib/nox";

/**
 * Schnittstelle für Nox.
 *
 * GET liefert, was seit einem Zeitpunkt neu ist, und die Tageszahlen -
 * OHNE Name, Mailadresse, Telefonnummer und Nachrichtentext. Nox ist ein
 * privater Assistent, der seine Daten an ein Sprachmodell gibt; dorthin
 * gehören keine Kundendaten.
 *
 * POST legt Entwürfe an: einen unveröffentlichten Blogbeitrag oder einen
 * inaktiven Aktionscode. Freigeben muss ein Mensch im Adminbereich.
 */

export const dynamic = "force-dynamic";

const NACHFASS_NACH_TAGEN = 2;

function pfadVon(request: NextRequest) {
  return request.nextUrl.pathname + request.nextUrl.search;
}

function erlaubt(request: NextRequest, body: string) {
  return noxSignaturPruefen({
    oeffentlich: process.env.NOX_PUBLIC_KEY,
    zeit: request.headers.get("x-nox-zeit"),
    signatur: request.headers.get("x-nox-signatur"),
    methode: request.method,
    pfad: pfadVon(request),
    body,
  });
}

function nein() {
  return Response.json({ ok: false, fehler: "Nicht autorisiert." }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!erlaubt(request, "")) return nein();

  const jetzt = new Date();
  const seitRoh = request.nextUrl.searchParams.get("seit");
  const seitDatum = seitRoh ? new Date(seitRoh) : new Date(jetzt.getTime() - 24 * 3_600_000);
  const seit = Number.isNaN(seitDatum.getTime()) ? new Date(jetzt.getTime() - 24 * 3_600_000) : seitDatum;
  const heute = tagesbeginnKoeln(jetzt);
  const liegtSeit = new Date(jetzt.getTime() - NACHFASS_NACH_TAGEN * 86_400_000);

  const [anfragen, nachrichten, warteliste, mailFehler, heuteNeu, heuteBestaetigt, heuteAbgesagt, offen, liegen] =
    await Promise.all([
      prisma.booking.findMany({
        where: { createdAt: { gt: seit } },
        select: {
          id: true,
          createdAt: true,
          status: true,
          fortschritt: true,
          ziel: true,
          erreichbarkeit: true,
          sprache: true,
          zuZweit: true,
          message: true,
          terminTag: true,
          terminUhrzeit: true,
          herkunftSeite: true,
          herkunftKampagne: true,
          herkunftQuelle: true,
          herkunftEinstieg: true,
          studio: { select: { name: true } },
          slot: { select: { date: true, startTime: true } },
          promotion: { select: { code: true } },
          empfehlung: { select: { id: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.contactMessage.findMany({
        where: { createdAt: { gt: seit } },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.warteliste.count({ where: { createdAt: { gt: seit } } }),
      prisma.mailLog.findMany({
        where: { createdAt: { gt: seit }, ok: false },
        select: { art: true, fehler: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.booking.count({ where: { createdAt: { gte: heute } } }),
      prisma.booking.count({ where: { createdAt: { gte: heute }, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { createdAt: { gte: heute }, status: "CANCELLED" } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "PENDING", fortschritt: "NEU", createdAt: { lt: liegtSeit } } }),
    ]);

  return Response.json({
    ok: true,
    stand: jetzt.toISOString(),
    anfragen: anfragen.map((b) => {
      const tag = b.slot?.date ?? b.terminTag;
      return {
        kennung: kurzKennung(b.id),
        erstellt: b.createdAt.toISOString(),
        studio: b.studio?.name ?? null,
        ziel: b.ziel ? zielText(b.ziel) : null,
        erreichbar: b.erreichbarkeit ? erreichbarkeitText(b.erreichbarkeit) : null,
        sprache: b.sprache,
        zuZweit: b.zuZweit,
        mitNachricht: Boolean(b.message?.trim()),
        status: STATUS_LABEL[b.status],
        fortschritt: FORTSCHRITT_LABEL[b.fortschritt],
        termin: tag ? `${tag.toISOString().slice(0, 10)} ${b.slot?.startTime ?? b.terminUhrzeit ?? ""}`.trim() : null,
        code: b.promotion?.code ?? (b.empfehlung ? "Empfehlung" : null),
        herkunft: [b.herkunftEinstieg, b.herkunftSeite, b.herkunftKampagne, b.herkunftQuelle].filter(Boolean).join(" · ") || null,
      };
    }),
    nachrichten: nachrichten.map((n) => ({ kennung: kurzKennung(n.id), erstellt: n.createdAt.toISOString() })),
    warteliste,
    mailFehler: mailFehler.map((m) => ({ art: m.art, fehler: ohnePersonendaten(m.fehler), zeit: m.createdAt.toISOString() })),
    heute: { anfragen: heuteNeu, bestaetigt: heuteBestaetigt, abgesagt: heuteAbgesagt },
    offen,
    liegenGeblieben: liegen,
  });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function datum(wert: unknown): Date | null {
  const text = String(wert ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const d = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (body.length > 100_000) return Response.json({ ok: false, fehler: "Zu groß." }, { status: 413 });
  if (!erlaubt(request, body)) return nein();

  let eingabe: Record<string, unknown>;
  try {
    eingabe = JSON.parse(body);
  } catch {
    return Response.json({ ok: false, fehler: "Kein JSON." }, { status: 400 });
  }

  if (eingabe.art === "blog_entwurf") {
    const title = String(eingabe.titel ?? "").trim().slice(0, 200);
    const excerpt = String(eingabe.auszug ?? "").trim().slice(0, 1000);
    const content = String(eingabe.inhalt ?? "").trim();
    if (!title || !excerpt || !content) {
      return Response.json({ ok: false, fehler: "Titel, Auszug und Inhalt fehlen." }, { status: 400 });
    }
    const slug = slugify(title);
    if (!slug) return Response.json({ ok: false, fehler: "Titel ergibt keine Adresse." }, { status: 400 });
    if (await prisma.blogPost.findUnique({ where: { slug } })) {
      return Response.json({ ok: false, fehler: "Einen Beitrag mit diesem Titel gibt es schon." }, { status: 409 });
    }
    const themen = themenLesen(Array.isArray(eingabe.themen) ? eingabe.themen.join(",") : String(eingabe.themen ?? ""));
    await prisma.blogPost.create({ data: { title, slug, excerpt, content, themen, published: false } });
    await protokollieren({ art: "ANGELEGT", bereich: "Blog", betreff: `Entwurf „${title}“`, detail: "von Nox, unveröffentlicht" });
    revalidatePath("/admin/blog");
    return Response.json({ ok: true, angelegt: "blog_entwurf", slug, admin: "/admin/blog" });
  }

  if (eingabe.art === "aktionscode") {
    const code = String(eingabe.code ?? "").trim().toUpperCase().replace(/\s+/g, "");
    const label = String(eingabe.label ?? "").trim().slice(0, 160);
    const benefit = String(eingabe.vorteil ?? "").trim().slice(0, 300) || null;
    const validFrom = datum(eingabe.gueltigAb);
    const validUntil = datum(eingabe.gueltigBis);
    if (!/^[A-Z0-9]{3,40}$/.test(code)) {
      return Response.json({ ok: false, fehler: "Code nur aus Buchstaben und Ziffern, mindestens drei." }, { status: 400 });
    }
    if (!label) return Response.json({ ok: false, fehler: "Wofür steht der Code?" }, { status: 400 });
    if (validFrom && validUntil && validFrom > validUntil) {
      return Response.json({ ok: false, fehler: "Ende liegt vor dem Beginn." }, { status: 400 });
    }
    if (await prisma.promotion.findUnique({ where: { code } })) {
      return Response.json({ ok: false, fehler: `Den Code ${code} gibt es schon.` }, { status: 409 });
    }
    await prisma.promotion.create({ data: { code, label, benefit, active: false, validFrom, validUntil } });
    await protokollieren({ art: "ANGELEGT", bereich: "Aktion", betreff: `Code ${code}`, detail: "von Nox, noch inaktiv" });
    revalidatePath("/admin/aktionen");
    return Response.json({ ok: true, angelegt: "aktionscode", code, admin: "/admin/aktionen" });
  }

  return Response.json({ ok: false, fehler: "Unbekannte Art." }, { status: 400 });
}
