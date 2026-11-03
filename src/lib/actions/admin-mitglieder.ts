"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeAdminAktion, verlangeStudioRecht } from "@/lib/admin-rechte";
import { protokollieren } from "@/lib/protokoll";
import { emailNormalisieren, emailPlausibel } from "@/lib/kundenbereich";
import { logxDateiAuswerten } from "@/lib/logx-import";
import { neuerMitgliedSchluessel } from "@/lib/mitglieder";

/**
 * Mitglieder verwalten.
 *
 * Eine Studioleitung pflegt die Mitglieder ihres Standorts. Der Import ist
 * der Leitung vorbehalten, wenn er Mitglieder ohne Standort anlegt - eine
 * Studioleitung importiert immer in ihren eigenen.
 */

function erneuern() {
  revalidatePath("/admin/mitglieder");
  revalidatePath("/admin/mitgliederpflege");
  revalidatePath("/admin/kennzahlen");
}

/** "2026-11-02" aus einem Datumsfeld - oder null. */
function datum(formData: FormData, name: string): Date | null {
  const roh = String(formData.get(name) ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(roh)) return null;
  const d = new Date(`${roh}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function laufzeit(formData: FormData): number | null {
  const wert = Number(formData.get("laufzeitMonate"));
  return wert === 12 || wert === 24 ? wert : null;
}

function emailAus(formData: FormData): string | null {
  const roh = String(formData.get("email") ?? "").trim().slice(0, 160);
  if (!roh) return null;
  const email = emailNormalisieren(roh);
  return emailPlausibel(email) ? email : null;
}

/** Ein neues Mitglied von Hand eintragen - der Normalfall bei Vertragsabschluss. */
export async function mitgliedAnlegen(formData: FormData) {
  const studioId = String(formData.get("studioId") ?? "").trim() || null;
  await verlangeStudioRecht(studioId);

  const vorname = String(formData.get("vorname") ?? "").trim().slice(0, 60);
  const nachname = String(formData.get("nachname") ?? "").trim().slice(0, 60);
  if (!vorname || !nachname) return;

  const logxNummer = String(formData.get("logxNummer") ?? "").trim().slice(0, 20) || null;
  const werbung = formData.get("werbungErlaubt") !== null;

  await prisma.mitglied.create({
    data: {
      vorname,
      nachname,
      email: emailAus(formData),
      logxNummer,
      studioId,
      vertragsbeginn: datum(formData, "vertragsbeginn"),
      laufzeitMonate: laufzeit(formData),
      token: neuerMitgliedSchluessel(),
      werbungErlaubt: werbung,
      werbungErlaubtAm: werbung ? new Date() : null,
      werbungQuelle: werbung ? "Formular im Studio" : null,
    },
  });
  erneuern();

  await protokollieren({
    art: "ANGELEGT",
    bereich: "Mitglied",
    betreff: `${vorname} ${nachname}`,
    studioId,
  });
}

export async function mitgliedAendern(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const vorhanden = await prisma.mitglied.findUnique({
    where: { id },
    select: { studioId: true, werbungErlaubt: true, vorname: true, nachname: true },
  });
  const admin = await verlangeStudioRecht(vorhanden?.studioId);
  if (!vorhanden) return;

  const werbung = formData.get("werbungErlaubt") !== null;
  // Den Standort ändert nur die Leitung - und nur sie darf einem Mitglied
  // ohne Standort einen geben.
  const neuesStudio = admin.istLeitung
    ? String(formData.get("studioId") ?? "").trim() || null
    : vorhanden.studioId;

  await prisma.mitglied.update({
    where: { id },
    data: {
      email: emailAus(formData),
      studioId: neuesStudio,
      vertragsbeginn: datum(formData, "vertragsbeginn"),
      laufzeitMonate: laufzeit(formData),
      werbungErlaubt: werbung,
      // Datum und Quelle nur beim Wechsel - sonst überschreibt jedes
      // Speichern den Nachweis, wann die Einwilligung gegeben wurde.
      ...(werbung !== vorhanden.werbungErlaubt
        ? {
            werbungErlaubtAm: werbung ? new Date() : null,
            werbungQuelle: werbung ? "Formular im Studio" : null,
          }
        : {}),
    },
  });
  erneuern();

  await protokollieren({
    art: "GEAENDERT",
    bereich: "Mitglied",
    betreff: `${vorhanden.vorname} ${vorhanden.nachname}`,
    detail:
      werbung !== vorhanden.werbungErlaubt
        ? `Werbe-Einwilligung ${werbung ? "erteilt" : "zurückgenommen"}`
        : null,
    studioId: neuesStudio,
  });
}

async function vermerken(id: string, feld: "gespraechAm" | "nachgehaktAm", wert: boolean) {
  const vorhanden = await prisma.mitglied.findUnique({
    where: { id },
    select: { studioId: true, vorname: true, nachname: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId);
  if (!vorhanden) return;
  await prisma.mitglied.update({ where: { id }, data: { [feld]: wert ? new Date() : null } });
  erneuern();
  await protokollieren({
    art: "GEAENDERT",
    bereich: "Mitglied",
    betreff: `${vorhanden.vorname} ${vorhanden.nachname}`,
    detail:
      feld === "gespraechAm"
        ? wert
          ? "Gespräch vor Laufzeitende geführt"
          : "Gespräch zurückgesetzt"
        : wert
          ? "nach Umfrage angerufen"
          : "Anruf zurückgesetzt",
    studioId: vorhanden.studioId,
  });
}

export async function gespraechGefuehrt(id: string) {
  await vermerken(id, "gespraechAm", true);
}

export async function gespraechZuruecksetzen(id: string) {
  await vermerken(id, "gespraechAm", false);
}

export async function nachgehakt(id: string) {
  await vermerken(id, "nachgehaktAm", true);
}

export async function mitgliedLoeschen(id: string) {
  const vorhanden = await prisma.mitglied.findUnique({
    where: { id },
    select: { studioId: true, vorname: true, nachname: true },
  });
  await verlangeStudioRecht(vorhanden?.studioId);
  if (!vorhanden) return;
  await prisma.mitglied.delete({ where: { id } });
  erneuern();
  await protokollieren({
    art: "GELOESCHT",
    bereich: "Mitglied",
    betreff: `${vorhanden.vorname} ${vorhanden.nachname}`,
    studioId: vorhanden.studioId,
  });
}

export type ImportErgebnis = {
  ok: boolean;
  meldung: string;
  details?: string[];
};

/**
 * Die Adressliste aus LogX übernehmen.
 *
 * Abgleich über die Kundennummer. Was passiert:
 *
 * - Status "Mitglied", noch nicht da: wird angelegt.
 * - Schon da: Name, E-Mail und Status werden aktualisiert. Vertragsbeginn
 *   und Laufzeit bleiben - sie stehen nicht im Export, und ein Import darf
 *   nicht löschen, was im Studio nachgetragen wurde.
 * - Schon da, jetzt "Ehemaliges Mitglied": wird inaktiv. Das ist ein
 *   Abgang, und er wird gezählt.
 * - Interessenten, Kunden, Personal und Ehemalige, die wir nicht kennen:
 *   werden übergangen. Wer kein Mitglied ist, braucht keine Mitglieder-Mail.
 *
 * Die Einwilligung in Werbung kommt aus der Spalte "Newsletter" - sie wird
 * gesetzt und auch wieder entzogen, wenn sie in LogX entzogen wurde. Eine
 * Einwilligung aus einer anderen Quelle (Mitgliederbereich, Formular im
 * Studio) nimmt der Import nicht zurück.
 */
export async function mitgliederImportieren(
  _prev: ImportErgebnis | undefined,
  formData: FormData,
): Promise<ImportErgebnis> {
  const admin = await verlangeAdminAktion();
  const gewaehlt = String(formData.get("studioId") ?? "").trim() || null;
  // Eine Studioleitung importiert immer in ihren eigenen Standort.
  const studioId = admin.istLeitung ? gewaehlt : admin.studioId;
  await verlangeStudioRecht(studioId);

  const datei = formData.get("datei");
  if (!(datei instanceof File) || datei.size === 0) {
    return { ok: false, meldung: "Bitte eine Datei auswählen." };
  }
  if (datei.size > 900 * 1024) {
    return { ok: false, meldung: "Die Datei ist zu groß (höchstens 900 KB)." };
  }

  const ergebnis = logxDateiAuswerten(datei.name, Buffer.from(await datei.arrayBuffer()));
  if (!ergebnis.ok) return { ok: false, meldung: ergebnis.grund };

  const bekannt = new Map(
    (
      await prisma.mitglied.findMany({
        where: { logxNummer: { in: ergebnis.zeilen.map((z) => z.logxNummer) } },
        select: {
          id: true,
          logxNummer: true,
          aktiv: true,
          studioId: true,
          werbungErlaubt: true,
          werbungQuelle: true,
        },
      })
    ).map((m) => [m.logxNummer as string, m]),
  );

  let neu = 0;
  let aktualisiert = 0;
  let abgaenge = 0;
  let uebergangen = 0;
  let fremd = 0;
  const jetzt = new Date();

  for (const zeile of ergebnis.zeilen) {
    const istMitglied = zeile.status === "Mitglied";
    const istEhemalig = zeile.status === "Ehemaliges Mitglied";
    const vorhanden = bekannt.get(zeile.logxNummer);

    if (!vorhanden) {
      if (!istMitglied) {
        uebergangen++;
        continue;
      }
      await prisma.mitglied.create({
        data: {
          logxNummer: zeile.logxNummer,
          vorname: zeile.vorname || "-",
          nachname: zeile.nachname,
          email: zeile.email,
          studioId,
          token: neuerMitgliedSchluessel(),
          werbungErlaubt: zeile.newsletter,
          werbungErlaubtAm: zeile.newsletter ? jetzt : null,
          werbungQuelle: zeile.newsletter ? "LogX-Newsletter" : null,
        },
      });
      neu++;
      continue;
    }

    // Ein Mitglied eines anderen Standorts fasst eine Studioleitung nicht an.
    if (!admin.istLeitung && vorhanden.studioId && vorhanden.studioId !== admin.studioId) {
      fremd++;
      continue;
    }

    const aktiv = istMitglied ? true : istEhemalig ? false : vorhanden.aktiv;
    if (vorhanden.aktiv && !aktiv) abgaenge++;

    const werbungAusLogx = vorhanden.werbungQuelle === "LogX-Newsletter" || !vorhanden.werbungErlaubt;
    await prisma.mitglied.update({
      where: { id: vorhanden.id },
      data: {
        vorname: zeile.vorname || "-",
        nachname: zeile.nachname,
        email: zeile.email,
        aktiv,
        studioId: vorhanden.studioId ?? studioId,
        ...(werbungAusLogx && zeile.newsletter !== vorhanden.werbungErlaubt
          ? {
              werbungErlaubt: zeile.newsletter,
              werbungErlaubtAm: zeile.newsletter ? jetzt : null,
              werbungQuelle: zeile.newsletter ? "LogX-Newsletter" : null,
            }
          : {}),
      },
    });
    aktualisiert++;
  }

  erneuern();
  await protokollieren({
    art: "ANGELEGT",
    bereich: "Mitglied",
    betreff: `LogX-Import: ${neu} neu, ${aktualisiert} aktualisiert`,
    detail: abgaenge > 0 ? `${abgaenge} Abgänge seit dem letzten Import` : null,
    studioId,
  });

  const details = [
    `${neu} Mitglieder neu angelegt`,
    `${aktualisiert} bereits bekannte aktualisiert`,
    abgaenge > 0 ? `${abgaenge} davon sind seit dem letzten Import ausgetreten` : null,
    `${uebergangen} Einträge übergangen (Interessenten, Ehemalige, Kunden, Personal)`,
    fremd > 0 ? `${fremd} gehören zu einem anderen Standort und wurden nicht geändert` : null,
    ergebnis.unbrauchbar > 0
      ? `${ergebnis.unbrauchbar} ${ergebnis.unbrauchbar === 1 ? "Zeile" : "Zeilen"} ohne Kundennummer oder Namen`
      : null,
    ergebnis.ignoriert.length > 0
      ? `Nicht übernommen (bleibt in LogX): ${ergebnis.ignoriert.join(", ")}`
      : null,
  ].filter((z): z is string => z !== null);

  return { ok: true, meldung: "Import abgeschlossen.", details };
}
