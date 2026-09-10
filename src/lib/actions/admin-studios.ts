"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion, verlangeStudioRecht } from "@/lib/admin-rechte";
import { istGueltigerSlug, studioSlug } from "@/lib/slug";

// Studio data appears on these public pages.
const studioPaths = ["/", "/studio", "/kontakt", "/impressum", "/probetermin", "/admin/studios"];

function revalidateStudios() {
  for (const path of studioPaths) revalidatePath(path);
  // Die Standortseiten liegen unter einer gemeinsamen Adressform. Ohne
  // "page" würde nur die Adresse /studio/[slug] selbst erneuert und keine
  // der vierzehn tatsächlichen Seiten.
  revalidatePath("/studio/[slug]", "page");
  // In der Sitemap stehen Änderungsdaten der Standorte.
  revalidatePath("/sitemap.xml");
}

/**
 * Eine Adresse, die es noch nicht gibt.
 *
 * Zwei Standorte im selben Ort ergäben sonst zweimal dieselbe Adresse -
 * und die Datenbank würde den zweiten mit einem Fehler abweisen, statt
 * dass jemand etwas davon hätte.
 */
async function freierSlug(wunsch: string, ausser?: string): Promise<string> {
  const basis = wunsch || "studio";
  let kandidat = basis;

  for (let nummer = 2; nummer < 100; nummer++) {
    const belegt = await prisma.studioLocation.findUnique({
      where: { slug: kandidat },
      select: { id: true },
    });
    if (!belegt || belegt.id === ausser) return kandidat;
    kandidat = `${basis}-${nummer}`;
  }

  // Sollte nie eintreten - aber eine Kennung ist immer eindeutig.
  return `${basis}-${Date.now()}`;
}

/* Anlegen, Löschen und Sammel-Import verändern den Bestand aller
   Standorte - das bleibt der Leitung vorbehalten. Ändern darf eine
   Studioleitung dagegen den eigenen Standort, sonst könnte sie nicht
   einmal die Öffnungszeiten pflegen. */

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
    intro: String(formData.get("intro") ?? "").trim().slice(0, 600) || null,
    anfahrt: String(formData.get("anfahrt") ?? "").trim().slice(0, 800) || null,
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createStudio(formData: FormData) {
  await verlangeLeitungAktion();

  const data = readStudioForm(formData);
  if (!data.name || !data.street || !data.postalCode || !data.city) return;

  const last = await prisma.studioLocation.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.studioLocation.create({
    data: {
      ...data,
      // Die Adresse der Standortseite entsteht aus dem Namen. Von Hand
      // eintragen lässt sie sich danach beim Ändern.
      slug: await freierSlug(studioSlug(data.name)),
      sortOrder: data.sortOrder || (last?.sortOrder ?? 0) + 10,
    },
  });
  revalidateStudios();
}

export async function updateStudio(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  // Geprüft wird gegen die Kennung aus dem Formular - sie ist zugleich der
  // Standort, um den es geht. Eine fremde Kennung führt hier zum Abbruch.
  await verlangeStudioRecht(id);

  const data = readStudioForm(formData);
  if (!id || !data.name || !data.street || !data.postalCode || !data.city) return;

  // Die Adresse der Standortseite nur ändern, wenn sie mitgeschickt und
  // brauchbar ist. Ein leeres oder unsinniges Feld lässt die vorhandene
  // stehen - eine kaputte Adresse wäre schlimmer als eine unschöne.
  const slugWunsch = String(formData.get("slug") ?? "").trim().toLowerCase();
  const slug =
    slugWunsch && istGueltigerSlug(slugWunsch)
      ? await freierSlug(slugWunsch, id)
      : undefined;

  await prisma.studioLocation.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
  });
  revalidateStudios();
}

export async function deleteStudio(id: string) {
  await verlangeLeitungAktion();

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
  await verlangeLeitungAktion();

  const raw = String(formData.get("rows") ?? "").replace(/\r\n?/g, "\n");
  const openingHours = String(formData.get("openingHours") ?? "").replace(/\r\n?/g, "\n").trim();
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
        // Auch beim Sammel-Import: ohne Adresse der Standortseite gäbe es
        // die Seite nicht, und der Import ist genau der Weg, auf dem alle
        // vierzehn Standorte entstehen.
        slug: await freierSlug(studioSlug(name)),
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

/**
 * Öffnungszeiten für mehrere Studios auf einmal setzen.
 *
 * Erwartet Absätze, durch eine Leerzeile getrennt. Die erste Zeile eines
 * Absatzes ist der Studioname, alle weiteren sind die Öffnungszeiten:
 *
 *   Körperformen Hürth
 *   Montag - Freitag: 08:00 - 21:00 Uhr
 *   Samstag: 10:00 - 16:00 Uhr
 *
 *   Körperformen Brühl
 *   Montag - Freitag: 07:00 - 22:00 Uhr
 *
 * Bewusst dieses Format statt Semikolons: Öffnungszeiten sind mehrzeilig,
 * und so lässt sich die Liste schreiben und lesen wie sie später auf der
 * Website steht.
 *
 * Der Name muss genau einem vorhandenen Studio entsprechen; Groß- und
 * Kleinschreibung ist dabei egal. Passt er zu keinem, wird der Absatz
 * gemeldet statt stillschweigend übergangen - sonst bliebe ein Tippfehler
 * unbemerkt und die alten Zeiten stünden weiter auf der Seite.
 */
export async function importOpeningHours(
  _previous: ImportResult | null,
  formData: FormData,
): Promise<ImportResult> {
  await verlangeLeitungAktion();

  const raw = String(formData.get("blocks") ?? "").replace(/\r\n?/g, "\n");
  const result: ImportResult = { added: 0, skipped: [] };

  const studios = await prisma.studioLocation.findMany({ select: { id: true, name: true } });
  const byName = new Map(studios.map((studio) => [studio.name.trim().toLowerCase(), studio.id]));

  // Absätze trennen: eine oder mehrere Leerzeilen.
  const blocks = raw.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const name = lines[0];
    const hours = lines.slice(1).join("\n");

    if (!name) continue;

    if (lines.length < 2) {
      result.skipped.push(`"${name}": keine Öffnungszeiten angegeben`);
      continue;
    }

    const id = byName.get(name.toLowerCase());
    if (!id) {
      result.skipped.push(`"${name}": kein Studio mit diesem Namen gefunden`);
      continue;
    }

    await prisma.studioLocation.update({ where: { id }, data: { openingHours: hours } });
    result.added += 1;
  }

  revalidateStudios();
  return result;
}
