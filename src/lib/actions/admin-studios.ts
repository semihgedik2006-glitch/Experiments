"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// Studio data appears on these public pages.
const studioPaths = ["/", "/studio", "/kontakt", "/impressum", "/probetermin", "/admin/studios"];

function revalidateStudios() {
  for (const path of studioPaths) revalidatePath(path);
}

async function requireAdmin() {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");
}

function readStudioForm(formData: FormData) {
  const latitude = String(formData.get("latitude") ?? "").trim();
  const longitude = String(formData.get("longitude") ?? "").trim();

  return {
    name: String(formData.get("name") ?? "").trim(),
    street: String(formData.get("street") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    mapEmbedUrl: String(formData.get("mapEmbedUrl") ?? "").trim(),
    openingHours: String(formData.get("openingHours") ?? "").trim(),
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createStudio(formData: FormData) {
  await requireAdmin();

  const data = readStudioForm(formData);
  if (!data.name || !data.street || !data.postalCode || !data.city) return;

  const last = await prisma.studioLocation.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.studioLocation.create({
    data: { ...data, sortOrder: data.sortOrder || (last?.sortOrder ?? 0) + 10 },
  });
  revalidateStudios();
}

export async function updateStudio(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const data = readStudioForm(formData);
  if (!id || !data.name || !data.street || !data.postalCode || !data.city) return;

  await prisma.studioLocation.update({ where: { id }, data });
  revalidateStudios();
}

export async function deleteStudio(id: string) {
  await requireAdmin();

  await prisma.studioLocation.delete({ where: { id } });
  revalidateStudios();
}

/** Ergebnis eines Sammel-Imports, wird der Seite als Rückmeldung angezeigt. */
export type ImportResult = { added: number; skipped: string[] };

/**
 * Mehrere Studios auf einmal anlegen.
 *
 * Erwartet je Zeile einen Standort, die Felder durch Semikolon getrennt:
 *   Name; Straße Hausnr; PLZ; Ort; Telefon; E-Mail; Breitengrad; Längengrad
 *
 * Gedacht für die Ersteinrichtung mit vielen Standorten - das Formular
 * vierzehnmal auszufüllen wäre mühsam und fehleranfällig. Die
 * Öffnungszeiten gelten für alle importierten Standorte gleich und lassen
 * sich danach je Studio anpassen.
 *
 * Zeilen ohne Koordinaten werden bewusst abgelehnt statt stillschweigend
 * angelegt: Ein Studio ohne Koordinaten schaltet die Standortabfrage bei
 * der Terminbuchung für alle Studios ab.
 */
export async function importStudios(
  _previous: ImportResult | null,
  formData: FormData,
): Promise<ImportResult> {
  await requireAdmin();

  const raw = String(formData.get("rows") ?? "");
  const openingHours = String(formData.get("openingHours") ?? "").trim();
  const result: ImportResult = { added: 0, skipped: [] };

  const last = await prisma.studioLocation.findFirst({ orderBy: { sortOrder: "desc" } });
  let sortOrder = (last?.sortOrder ?? 0) + 10;

  // Bereits angelegte Namen merken, damit ein zweiter Durchlauf oder eine
  // doppelte Zeile kein zweites Studio gleichen Namens erzeugt.
  const vorhanden = new Set(
    (await prisma.studioLocation.findMany({ select: { name: true } })).map((studio) =>
      studio.name.trim().toLowerCase(),
    ),
  );

  for (const [index, line] of raw.split("\n").entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(";").map((part) => part.trim());
    const [name, street, postalCode, city, phone, email, latitude, longitude] = parts;

    const problem = !name || !street || !postalCode || !city
      ? "Name, Straße, PLZ und Ort sind Pflicht"
      : !latitude || !longitude
        ? "Koordinaten fehlen"
        : Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))
          ? "Koordinaten sind keine Zahlen"
          : null;

    if (problem) {
      result.skipped.push(`Zeile ${index + 1}: ${problem}`);
      continue;
    }

    if (vorhanden.has(name.trim().toLowerCase())) {
      result.skipped.push(`Zeile ${index + 1}: "${name}" ist bereits angelegt`);
      continue;
    }
    vorhanden.add(name.trim().toLowerCase());

    await prisma.studioLocation.create({
      data: {
        name,
        street,
        postalCode,
        city,
        phone: phone ?? "",
        email: email ?? "",
        // Bleibt leer: Die Karte wird dann aus der Anschrift abgeleitet.
        mapEmbedUrl: "",
        openingHours,
        latitude: Number(latitude),
        longitude: Number(longitude),
        sortOrder,
      },
    });
    sortOrder += 10;
    result.added += 1;
  }

  revalidateStudios();
  return result;
}
