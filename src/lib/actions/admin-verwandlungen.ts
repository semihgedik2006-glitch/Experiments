"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeAdminAktion, verlangeStudioRecht } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";
import { darfErscheinen, EINWILLIGUNG_FORMEN, GRENZEN } from "@/lib/verwandlung";

/**
 * Vorher-Nachher-Bilder pflegen.
 *
 * Die eine Regel, die diese Datei von allen anderen Adminaktionen
 * unterscheidet: EIN EINTRAG OHNE DOKUMENTIERTE EINWILLIGUNG WIRD NICHT
 * VERÖFFENTLICHT. Das Häkchen "zeigen" wird dann beim Speichern
 * zurückgesetzt - nicht beim Anzeigen übersprungen.
 *
 * Der Unterschied ist nicht theoretisch. Wer nur in der Ausgabe filtert,
 * hat einen Datensatz, der auf "sichtbar" steht und nur zufällig nicht
 * erscheint; beim nächsten neuen Bereich, der dieselbe Tabelle liest,
 * erscheint er dann doch. Hier steht in der Datenbank, was gilt.
 *
 * Rechte: wie bei den Trainerprofilen. Eine Studioleitung pflegt die
 * Fälle ihres Standorts - sie kennt die Menschen und hat die
 * Einwilligung in der Hand. Geprüft wird gegen den Standort am
 * Datensatz, nicht gegen den im Formular.
 */

function erneuern() {
  revalidatePath("/admin/verwandlungen");
  // Wie bei den Kundenstimmen der ganze Rahmen: Das erste freigegebene
  // Bildpaar lässt "Erfolge" im Menü wieder auftauchen, und das Menü
  // steht im Layout.
  revalidatePath("/", "layout");
}

function feld(formData: FormData, name: keyof typeof GRENZEN): string {
  return String(formData.get(name) ?? "").trim().slice(0, GRENZEN[name]);
}

/**
 * Das Datum der Einwilligung.
 *
 * Leeres Feld heißt null - und damit "nicht veröffentlichen". Ein Datum
 * in der Zukunft wird ebenfalls verworfen: Eine Einwilligung, die erst
 * nächsten Monat vorliegt, liegt heute nicht vor.
 *
 * Hier wird ausdrücklich NICHT auf datumAusText zurückgegriffen, obwohl
 * es dasselbe Format liest: Dessen Notlösung bei Unsinn ist "heute" -
 * praktisch für eine Kalenderansicht, fatal für ein Nachweisdatum. Aus
 * einem Tippfehler würde eine Einwilligung, die es nie gab.
 */
function einwilligungsDatum(roh: string): Date | null {
  const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(roh);
  if (!treffer) return null;

  const [jahr, monat, tag] = treffer.slice(1).map(Number);
  const datum = new Date(jahr, monat - 1, tag);
  const echt =
    datum.getFullYear() === jahr && datum.getMonth() === monat - 1 && datum.getDate() === tag;
  if (!echt) return null;

  const morgen = new Date();
  morgen.setHours(0, 0, 0, 0);
  morgen.setDate(morgen.getDate() + 1);

  return datum < morgen ? datum : null;
}

function lesen(formData: FormData) {
  const einwilligungAm = einwilligungsDatum(String(formData.get("einwilligungAm") ?? "").trim());
  const form = feld(formData, "einwilligungForm");

  return {
    name: feld(formData, "name"),
    zeitraum: feld(formData, "zeitraum"),
    kontext: feld(formData, "kontext"),
    text: String(formData.get("text") ?? "").trim().slice(0, GRENZEN.text) || null,
    vorherUrl: feld(formData, "vorherUrl"),
    nachherUrl: feld(formData, "nachherUrl"),
    einwilligungAm,
    // Die Form nur, wenn sie aus der Auswahl stammt - ein freier Text
    // wäre beim Nachweis keine belastbare Angabe.
    einwilligungForm: (EINWILLIGUNG_FORMEN as readonly string[]).includes(form) ? form : null,
    einwilligungNotiz: feld(formData, "einwilligungNotiz") || null,
    aktiv: formData.get("aktiv") !== null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

/**
 * Die Stelle, an der die Regel greift.
 *
 * Sie steht bewusst zwischen Lesen und Schreiben und nicht im Formular:
 * Ein Formular lässt sich umgehen, diese Zeile nicht.
 */
function freigabeDurchsetzen(daten: ReturnType<typeof lesen>) {
  return { ...daten, aktiv: daten.aktiv && darfErscheinen(daten) };
}

export async function verwandlungAnlegen(formData: FormData) {
  const studioRoh = String(formData.get("studioId") ?? "").trim();
  // Ohne Standort ist es ein Eintrag der Marke - den darf nur anlegen,
  // wer ohnehin alle Standorte sieht.
  await verlangeStudioRecht(studioRoh || null);

  const daten = freigabeDurchsetzen(lesen(formData));
  // Ein Eintrag ohne Bilder und ohne Namen ist kein Entwurf, sondern ein
  // Fehlklick.
  if (!daten.name || (!daten.vorherUrl && !daten.nachherUrl)) return;

  const letzte = await prisma.verwandlung.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.verwandlung.create({
    data: {
      ...daten,
      studioId: studioRoh || null,
      sortOrder: daten.sortOrder || (letzte?.sortOrder ?? 0) + 10,
    },
  });

  await protokollieren({
    art: "ANGELEGT",
    bereich: "Inhalte",
    betreff: `Vorher-Nachher: ${daten.name}`,
    // Die Einwilligung gehört ins Protokoll, weil genau sie später
    // belegt werden muss - und zwar mit Datum, nicht aus dem Gedächtnis.
    detail: daten.einwilligungAm
      ? `Einwilligung vom ${daten.einwilligungAm.toLocaleDateString("de-DE")}`
      : "ohne Einwilligung angelegt, nicht veröffentlicht",
    studioId: studioRoh || null,
  });

  erneuern();
}

export async function verwandlungAendern(formData: FormData) {
  await verlangeAdminAktion();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const vorhanden = await prisma.verwandlung.findUnique({
    where: { id },
    select: { studioId: true, name: true, aktiv: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId ?? null);
  if (!vorhanden) return;

  const daten = freigabeDurchsetzen(lesen(formData));
  if (!daten.name) return;

  await prisma.verwandlung.update({ where: { id }, data: daten });

  await protokollieren({
    art: vorhanden.aktiv === daten.aktiv ? "GEAENDERT" : "STATUS",
    bereich: "Inhalte",
    betreff: `Vorher-Nachher: ${daten.name}`,
    detail:
      vorhanden.aktiv === daten.aktiv
        ? null
        : daten.aktiv
          ? "veröffentlicht"
          : "aus der Anzeige genommen",
    studioId: vorhanden.studioId,
  });

  erneuern();
}

/**
 * Einen Eintrag sofort aus der Anzeige nehmen.
 *
 * Getrennt vom Formular, weil das der eilige Fall ist: Widerruft jemand
 * die Einwilligung, muss das Bild binnen Minuten weg sein und nicht erst
 * nach dem Ausfüllen von acht Feldern. Der Widerruf ist jederzeit
 * möglich (Art. 7 Abs. 3 DSGVO), und die Seite muss ihm folgen können.
 */
export async function verwandlungVerbergen(id: string) {
  await verlangeAdminAktion();

  const vorhanden = await prisma.verwandlung.findUnique({
    where: { id },
    select: { studioId: true, name: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId ?? null);
  if (!vorhanden) return;

  await prisma.verwandlung.update({ where: { id }, data: { aktiv: false } });

  await protokollieren({
    art: "STATUS",
    bereich: "Inhalte",
    betreff: `Vorher-Nachher: ${vorhanden.name}`,
    detail: "sofort aus der Anzeige genommen",
    studioId: vorhanden.studioId,
  });

  erneuern();
}

export async function verwandlungLoeschen(id: string) {
  await verlangeAdminAktion();

  const vorhanden = await prisma.verwandlung.findUnique({
    where: { id },
    select: { studioId: true, name: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId ?? null);
  if (!vorhanden) return;

  await prisma.verwandlung.delete({ where: { id } });

  await protokollieren({
    art: "GELOESCHT",
    bereich: "Inhalte",
    betreff: `Vorher-Nachher: ${vorhanden.name}`,
    studioId: vorhanden.studioId,
  });

  erneuern();
}
