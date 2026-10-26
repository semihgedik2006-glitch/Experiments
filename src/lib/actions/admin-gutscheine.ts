"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeAdminAktion, verlangeStudioRecht } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";
import { emailNormalisieren } from "@/lib/kundenbereich";
import {
  STARTPAKET_WERT,
  WERT_STUFEN,
  artText,
  gueltigBisAb,
  gutscheinCodeNormalisieren,
} from "@/lib/gutschein";
import { freierGutscheinCode } from "@/lib/gutschein-code";
import type { GutscheinStatus } from "@/generated/prisma/enums";

/**
 * Gutscheine verwalten.
 *
 * Eine Studioleitung verwaltet die Gutscheine ihres Standorts - sie
 * kassiert, sie händigt aus, sie löst ein. Geprüft wird gegen den Standort
 * am Gutschein, nicht gegen den im Formular.
 */

function erneuern() {
  revalidatePath("/admin/gutscheine");
  revalidatePath("/admin/kennzahlen");
}

async function laden(id: string) {
  const gutschein = await prisma.gutschein.findUnique({
    where: { id },
    select: { id: true, code: true, studioId: true, status: true, art: true, betrag: true },
  });
  await verlangeStudioRecht(gutschein?.studioId);
  return gutschein;
}

async function statusSetzen(
  id: string,
  von: GutscheinStatus[],
  nach: GutscheinStatus,
  extra: Record<string, Date | null> = {},
) {
  const gutschein = await laden(id);
  if (!gutschein || !von.includes(gutschein.status)) return;

  await prisma.gutschein.update({ where: { id }, data: { status: nach, ...extra } });
  erneuern();

  await protokollieren({
    art: "STATUS",
    bereich: "Gutschein",
    betreff: `${artText(gutschein.art, gutschein.betrag)} (${gutschein.code})`,
    detail: `${gutschein.status} → ${nach}`,
    studioId: gutschein.studioId,
  });
}

/** Bezahlt: Ab jetzt gilt der Code - drei Jahre zum Jahresende. */
export async function gutscheinAusstellen(id: string) {
  const jetzt = new Date();
  await statusSetzen(id, ["ANGEFRAGT"], "AUSGESTELLT", {
    ausgestelltAm: jetzt,
    gueltigBis: gueltigBisAb(jetzt),
  });
}

export async function gutscheinEinloesen(id: string) {
  await statusSetzen(id, ["AUSGESTELLT"], "EINGELOEST", { eingeloestAm: new Date() });
}

/** Eine Einlösung zurücknehmen - wenn am Tresen falsch geklickt wurde. */
export async function einloesungZuruecknehmen(id: string) {
  await statusSetzen(id, ["EINGELOEST"], "AUSGESTELLT", { eingeloestAm: null });
}

export async function gutscheinStornieren(id: string) {
  await statusSetzen(id, ["ANGEFRAGT", "AUSGESTELLT"], "STORNIERT");
}

/**
 * Im Studio verkauft: gleich ausgestellt, ohne Umweg über die Anfrage.
 *
 * Das ist der häufigere Fall - wer im Studio steht, fragt nicht online an.
 * Damit stehen trotzdem alle Gutscheine an einer Stelle, und die Zahl
 * der verkauften Gutscheine stimmt.
 */
export async function gutscheinVorOrtVerkaufen(formData: FormData) {
  const studioId = String(formData.get("studioId") ?? "").trim() || null;
  await verlangeStudioRecht(studioId);

  const auswahl = String(formData.get("auswahl") ?? "");
  const art = auswahl === "startpaket" ? "startpaket" : "wert";
  const betrag =
    art === "startpaket" ? Math.round(STARTPAKET_WERT) : Number(auswahl.replace("wert-", ""));
  if (art === "wert" && !(WERT_STUFEN as readonly number[]).includes(betrag)) return;

  const kaeuferName = String(formData.get("kaeuferName") ?? "").trim().slice(0, 80);
  if (!kaeuferName) return;
  const email = String(formData.get("kaeuferEmail") ?? "").trim().slice(0, 160);
  const fuer = String(formData.get("fuer") ?? "").trim().slice(0, 60);
  const widmung = String(formData.get("widmung") ?? "").trim().slice(0, 140);

  const jetzt = new Date();
  const code = await freierGutscheinCode();
  await prisma.gutschein.create({
    data: {
      code,
      art,
      betrag,
      studioId,
      kaeuferName,
      kaeuferEmail: email ? emailNormalisieren(email) : null,
      fuer: fuer || null,
      widmung: widmung || null,
      vorOrt: true,
      status: "AUSGESTELLT",
      ausgestelltAm: jetzt,
      gueltigBis: gueltigBisAb(jetzt),
    },
  });
  erneuern();

  await protokollieren({
    art: "ANGELEGT",
    bereich: "Gutschein",
    betreff: `${artText(art, betrag)} (${code})`,
    detail: "im Studio verkauft",
    studioId,
  });
}

export async function gutscheinNotizSpeichern(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const gutschein = await laden(id);
  if (!gutschein) return;
  const notiz = String(formData.get("notiz") ?? "").trim().slice(0, 300);
  await prisma.gutschein.update({ where: { id }, data: { notiz: notiz || null } });
  erneuern();
}

/**
 * Am Tresen: Code eintippen, Gutschein finden.
 *
 * Gibt nur die Kennung zurück - die Seite zeigt den Gutschein dann selbst
 * an, mit den Rechten des angemeldeten Zugangs.
 */
export async function gutscheinSuchen(code: string): Promise<string | null> {
  // Erst die Anmeldung, dann die Suche: Sonst verriete die Antwort auch
  // ohne Zugang, ob es einen Code gibt.
  await verlangeAdminAktion();
  const gefunden = await prisma.gutschein.findUnique({
    where: { code: gutscheinCodeNormalisieren(code) },
    select: { id: true, studioId: true },
  });
  if (!gefunden) return null;
  await verlangeStudioRecht(gefunden.studioId);
  return gefunden.id;
}
