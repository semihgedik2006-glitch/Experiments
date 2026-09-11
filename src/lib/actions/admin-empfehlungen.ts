"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { codeNormalisieren } from "@/lib/aktionscode";
import { codeVorschlag, freierCode } from "@/lib/empfehlung";
import { protokollieren } from "@/lib/protokoll";

/**
 * Empfehlungscodes verwalten.
 *
 * Eine Studioleitung darf die Codes ihres Standorts anlegen und ändern -
 * sie kennt die Mitglieder, sie zahlt die Prämie aus. Geprüft wird immer
 * gegen den Standort am Datensatz und nicht gegen den im Formular.
 */

function erneuern() {
  revalidatePath("/admin/empfehlungen");
  revalidatePath("/admin/bookings");
}

const GRENZEN = { name: 80, email: 160, phone: 40, praemie: 80, notiz: 300 } as const;

function feld(formData: FormData, name: keyof typeof GRENZEN): string {
  return String(formData.get(name) ?? "").trim().slice(0, GRENZEN[name]);
}

function lesen(formData: FormData) {
  return {
    name: feld(formData, "name"),
    email: feld(formData, "email") || null,
    phone: feld(formData, "phone") || null,
    praemie: feld(formData, "praemie") || null,
    notiz: feld(formData, "notiz") || null,
    aktiv: formData.get("aktiv") !== null,
  };
}

export async function empfehlungAnlegen(formData: FormData) {
  const studioId = String(formData.get("studioId") ?? "").trim() || null;
  await verlangeStudioRecht(studioId);

  const daten = lesen(formData);
  if (!daten.name) return;

  // Ein leer gelassenes Codefeld ergibt einen Vorschlag aus dem Namen.
  // Ein Code, den niemand diktieren kann, wird nicht weitergegeben.
  const wunsch = codeNormalisieren(String(formData.get("code") ?? "")) || codeVorschlag(daten.name);
  const code = await freierCode(wunsch);

  await prisma.empfehlung.create({ data: { ...daten, code, studioId } });
  erneuern();

  await protokollieren({
    art: "ANGELEGT",
    bereich: "Empfehlung",
    betreff: `${daten.name} (${code})`,
    studioId,
  });
}

export async function empfehlungAendern(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const vorhanden = await prisma.empfehlung.findUnique({
    where: { id },
    select: { studioId: true, code: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId);
  if (!vorhanden) return;

  const daten = lesen(formData);
  if (!daten.name) return;

  // Den Code nur ändern, wenn tatsächlich ein anderer eingetragen wurde.
  // Ein geänderter Code macht jeden weitergegebenen Zettel ungültig -
  // das soll nicht nebenbei passieren, weil jemand den Namen korrigiert.
  const wunsch = codeNormalisieren(String(formData.get("code") ?? ""));
  const code = wunsch && wunsch !== vorhanden.code ? await freierCode(wunsch, id) : undefined;

  await prisma.empfehlung.update({
    where: { id },
    data: { ...daten, ...(code ? { code } : {}) },
  });
  erneuern();

  await protokollieren({
    art: "GEAENDERT",
    bereich: "Empfehlung",
    betreff: `${daten.name} (${code ?? vorhanden.code})`,
    detail: code ? `Code geändert, vorher ${vorhanden.code}` : null,
    studioId: vorhanden.studioId,
  });
}

export async function empfehlungLoeschen(id: string) {
  const vorhanden = await prisma.empfehlung.findUnique({
    where: { id },
    select: { studioId: true, name: true, code: true, _count: { select: { bookings: true } } },
  });
  await verlangeStudioRecht(vorhanden?.studioId);
  if (!vorhanden) return;

  // Die geworbenen Anfragen bleiben stehen; ihre Verknüpfung wird gelöst
  // (onDelete: SetNull). Sie zu löschen wäre falsch - das sind Menschen,
  // die einen Termin haben.
  await prisma.empfehlung.delete({ where: { id } });
  erneuern();

  await protokollieren({
    art: "GELOESCHT",
    bereich: "Empfehlung",
    betreff: `${vorhanden.name} (${vorhanden.code})`,
    detail:
      vorhanden._count.bookings > 0
        ? `${vorhanden._count.bookings} geworbene Anfragen bleiben bestehen`
        : null,
    studioId: vorhanden.studioId,
  });
}

/**
 * Die Prämie für eine geworbene Anfrage als abgerechnet markieren.
 *
 * Am Buchungsdatensatz und nicht am Code: Ein Code wirbt mehrfach, und
 * jede geworbene Person ist eine eigene Prämie.
 */
export async function praemieUmschalten(bookingId: string) {
  const buchung = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { studioId: true, name: true, praemieGutgeschrieben: true },
  });
  await verlangeStudioRecht(buchung?.studioId);
  if (!buchung) return;

  const neu = !buchung.praemieGutgeschrieben;
  await prisma.booking.update({
    where: { id: bookingId },
    data: { praemieGutgeschrieben: neu },
  });
  erneuern();

  await protokollieren({
    art: "GEAENDERT",
    bereich: "Empfehlung",
    betreff: `Prämie für ${buchung.name}`,
    detail: neu ? "als gutgeschrieben markiert" : "Markierung zurückgenommen",
    studioId: buchung.studioId,
  });
}
