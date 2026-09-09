"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Zugänge anlegen, ändern und entfernen - nur durch die Leitung.
 *
 * Zwei Regeln, die den Bereich davor schützen, sich selbst auszusperren:
 *
 * Es muss immer mindestens eine Leitung geben. Wer die letzte herabstuft
 * oder löscht, käme an keinen Bereich mehr heran, in dem sich das
 * rückgängig machen ließe - dann hilft nur noch ein Eingriff in die
 * Datenbank.
 *
 * Der eigene Zugang lässt sich nicht löschen und nicht selbst herabstufen.
 * Beides ist fast immer ein Versehen.
 */

const MIN_PASSWORT = 10;

function passwortPruefen(passwort: string): string | null {
  if (passwort.length < MIN_PASSWORT) {
    return `Das Passwort braucht mindestens ${MIN_PASSWORT} Zeichen.`;
  }
  return null;
}

async function anzahlLeitungen(ausser?: string) {
  return prisma.adminUser.count({
    where: { role: "LEITUNG", ...(ausser ? { id: { not: ausser } } : {}) },
  });
}

export async function zugangAnlegen(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await verlangeLeitungAktion();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const passwort = String(formData.get("passwort") ?? "");
  const rolle = String(formData.get("rolle") ?? "STUDIOLEITUNG");
  const studioId = String(formData.get("studioId") ?? "").trim();

  if (!email || !passwort) {
    return { ok: false, message: "Bitte E-Mail und Passwort angeben." };
  }
  const passwortFehler = passwortPruefen(passwort);
  if (passwortFehler) return { ok: false, message: passwortFehler };

  const istLeitung = rolle === "LEITUNG";
  if (!istLeitung && !studioId) {
    return { ok: false, message: "Bitte den Standort wählen, für den dieser Zugang gilt." };
  }

  const vorhanden = await prisma.adminUser.findUnique({ where: { email } });
  if (vorhanden) {
    return { ok: false, message: "Für diese E-Mail gibt es bereits einen Zugang." };
  }

  await prisma.adminUser.create({
    data: {
      email,
      name: name || null,
      passwordHash: await bcrypt.hash(passwort, 10),
      role: istLeitung ? "LEITUNG" : "STUDIOLEITUNG",
      studioId: istLeitung ? null : studioId,
    },
  });

  revalidatePath("/admin/team");
  return { ok: true, message: `Zugang für ${email} wurde angelegt.` };
}

export async function zugangAendern(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ich = await verlangeLeitungAktion();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rolle = String(formData.get("rolle") ?? "");
  const studioId = String(formData.get("studioId") ?? "").trim();
  const passwort = String(formData.get("passwort") ?? "");

  const zugang = await prisma.adminUser.findUnique({ where: { id } });
  if (!zugang) return { ok: false, message: "Diesen Zugang gibt es nicht mehr." };

  const istLeitung = rolle === "LEITUNG";

  if (!istLeitung && !studioId) {
    return { ok: false, message: "Bitte den Standort wählen, für den dieser Zugang gilt." };
  }

  if (zugang.role === "LEITUNG" && !istLeitung) {
    if (id === ich.id) {
      return {
        ok: false,
        message: "Den eigenen Zugang kannst du nicht herabstufen - sonst sperrst du dich aus.",
      };
    }
    if ((await anzahlLeitungen(id)) === 0) {
      return {
        ok: false,
        message: "Das ist die letzte Leitung. Lege zuerst eine weitere an.",
      };
    }
  }

  if (passwort) {
    const fehler = passwortPruefen(passwort);
    if (fehler) return { ok: false, message: fehler };
  }

  await prisma.adminUser.update({
    where: { id },
    data: {
      name: name || null,
      role: istLeitung ? "LEITUNG" : "STUDIOLEITUNG",
      studioId: istLeitung ? null : studioId,
      // Leeres Feld heißt "Passwort unverändert lassen" - sonst müsste man
      // es bei jeder Namensänderung neu eingeben.
      ...(passwort ? { passwordHash: await bcrypt.hash(passwort, 10) } : {}),
    },
  });

  revalidatePath("/admin/team");
  return {
    ok: true,
    message: passwort ? "Zugang und Passwort wurden geändert." : "Zugang wurde geändert.",
  };
}

export async function zugangEntfernen(id: string) {
  const ich = await verlangeLeitungAktion();

  if (id === ich.id) throw new Error("Den eigenen Zugang kannst du nicht löschen.");

  const zugang = await prisma.adminUser.findUnique({ where: { id } });
  if (!zugang) return;

  if (zugang.role === "LEITUNG" && (await anzahlLeitungen(id)) === 0) {
    throw new Error("Das ist die letzte Leitung - sie kann nicht gelöscht werden.");
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/team");
}
