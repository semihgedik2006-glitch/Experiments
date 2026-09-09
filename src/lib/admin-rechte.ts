import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

/**
 * Wer ist angemeldet und was darf er.
 *
 * Zwei Rollen:
 *
 * LEITUNG sieht und ändert alles.
 *
 * STUDIOLEITUNG sieht nur den eigenen Standort - dessen Buchungsanfragen,
 * Termine und Studiodaten. Blog, Kommentare, Newsletter, Sichtbarkeit und
 * Datensicherung bleiben außen vor: Das sind Entscheidungen für die ganze
 * Marke, nicht für einen Standort.
 *
 * Wichtig: Diese Funktionen entscheiden, was angezeigt wird. Das allein
 * genügt nicht. Wer eine Kennung kennt, kann eine Serveraktion auch ohne
 * die passende Schaltfläche auslösen - deshalb prüft jede ändernde Aktion
 * die Rechte noch einmal selbst (siehe verlangeStudioRecht).
 */

export type AdminKontext = {
  id: string;
  email: string;
  name: string | null;
  istLeitung: boolean;
  /** Bei STUDIOLEITUNG der zugeordnete Standort, sonst null. */
  studioId: string | null;
  studioName: string | null;
};

/**
 * cache() bündelt die Abfrage innerhalb einer Anfrage: Layout, Navigation
 * und Seite fragen dieselben Daten ab, die Datenbank sieht davon eine
 * Abfrage.
 */
export const aktuellerAdmin = cache(async (): Promise<AdminKontext | null> => {
  const adminId = await getAdminSession();
  if (!adminId) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    include: { studio: { select: { id: true, name: true } } },
  });
  if (!admin) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    istLeitung: admin.role === "LEITUNG",
    studioId: admin.role === "LEITUNG" ? null : admin.studioId,
    studioName: admin.role === "LEITUNG" ? null : (admin.studio?.name ?? null),
  };
});

/** Für Seiten: ohne Anmeldung zurück zur Anmeldung. */
export async function verlangeAdmin(): Promise<AdminKontext> {
  const admin = await aktuellerAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Für Bereiche, die nur die Leitung sieht. */
export async function verlangeLeitung(): Promise<AdminKontext> {
  const admin = await verlangeAdmin();
  // Bewusst zurück auf die Übersicht statt einer Fehlermeldung: Wer hier
  // landet, hat sich verlaufen oder eine alte Adresse geöffnet.
  if (!admin.istLeitung) redirect("/admin");
  return admin;
}

/**
 * Für Serveraktionen. Wirft statt umzuleiten - eine Aktion hat keine
 * Seite, auf die sie umleiten könnte.
 */
export async function verlangeAdminAktion(): Promise<AdminKontext> {
  const admin = await aktuellerAdmin();
  if (!admin) throw new Error("Nicht autorisiert.");
  return admin;
}

export async function verlangeLeitungAktion(): Promise<AdminKontext> {
  const admin = await verlangeAdminAktion();
  if (!admin.istLeitung) throw new Error("Dafür fehlt die Berechtigung.");
  return admin;
}

/**
 * Prüft, ob dieser Zugang etwas an diesem Standort ändern darf.
 *
 * Der Standort kommt aus dem Datensatz, den die Aktion ändern will, nicht
 * aus dem Formular - sonst könnte man ihn mitschicken und sich damit
 * selbst die Erlaubnis erteilen.
 */
export async function verlangeStudioRecht(studioId: string | null | undefined) {
  const admin = await verlangeAdminAktion();
  if (admin.istLeitung) return admin;
  if (!studioId || studioId !== admin.studioId) {
    throw new Error("Dafür fehlt die Berechtigung.");
  }
  return admin;
}

/**
 * Einschränkung für Abfragen: undefined heißt "alles", ein Wert heißt
 * "nur dieser Standort". Ein Zugang ohne zugeordneten Standort bekommt
 * eine Kennung, die es nicht gibt - dann sieht er nichts statt alles.
 */
export function studioEinschraenkung(admin: AdminKontext): string | undefined {
  if (admin.istLeitung) return undefined;
  return admin.studioId ?? "__ohne-standort__";
}
