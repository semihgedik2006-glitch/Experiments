"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeAdminAktion } from "@/lib/admin-rechte";
import { checkRateLimit, resetRateLimit, waitMessage } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Der eigene Zugang: Name und Passwort ändern.
 *
 * Bisher konnte das nur die Leitung, und zwar für alle - eine Studioleitung
 * musste also anrufen, um ihr eigenes Passwort zu wechseln. Das führt in der
 * Praxis dazu, dass Startpasswörter jahrelang stehen bleiben und im
 * Zweifel per Nachricht weitergereicht wurden.
 *
 * Das alte Passwort wird mitverlangt. Nicht, weil die Anmeldung nicht
 * genügte, sondern wegen des offenen Rechners: Wer sich fünf Minuten an
 * einen unbeaufsichtigten Bildschirm setzt, soll den Zugang nicht
 * übernehmen können, indem er einfach ein neues Passwort setzt.
 */

const MIN_PASSWORT = 10;

// Die Prüfung des alten Passworts ist eine Rateprobe wie die Anmeldung -
// also dieselbe Strenge. Gezählt wird pro Zugang, nicht pro IP-Adresse:
// Angemeldet ist man ohnehin schon, und wer im Studio hinter demselben
// Anschluss sitzt, soll sich nicht gegenseitig aussperren.
const VERSUCHE = 5;
const FENSTER_MS = 15 * 60 * 1000;

export async function eigenesPasswortAendern(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ich = await verlangeAdminAktion();

  const alt = String(formData.get("alt") ?? "");
  const neu = String(formData.get("neu") ?? "");
  const wiederholung = String(formData.get("wiederholung") ?? "");

  if (!alt || !neu) {
    return { ok: false, message: "Bitte das bisherige und das neue Passwort eingeben." };
  }

  if (neu.length < MIN_PASSWORT) {
    return { ok: false, message: `Das neue Passwort braucht mindestens ${MIN_PASSWORT} Zeichen.` };
  }

  // Die Wiederholung fängt den Tippfehler ab. Ohne sie merkt man ihn erst
  // beim nächsten Anmelden - und weiß dann nicht, was man getippt hat.
  if (neu !== wiederholung) {
    return { ok: false, message: "Die beiden neuen Passwörter stimmen nicht überein." };
  }

  if (neu === alt) {
    return { ok: false, message: "Das neue Passwort ist dasselbe wie das bisherige." };
  }

  const schluessel = `passwort:${ich.id}`;
  const grenze = checkRateLimit(schluessel, VERSUCHE, FENSTER_MS);
  if (!grenze.allowed) {
    return { ok: false, message: waitMessage(grenze.retryAfterSeconds) };
  }

  const zugang = await prisma.adminUser.findUnique({ where: { id: ich.id } });
  if (!zugang) return { ok: false, message: "Diesen Zugang gibt es nicht mehr." };

  const stimmt = await bcrypt.compare(alt, zugang.passwordHash);
  if (!stimmt) {
    return { ok: false, message: "Das bisherige Passwort ist falsch." };
  }

  await prisma.adminUser.update({
    where: { id: ich.id },
    data: { passwordHash: await bcrypt.hash(neu, 10) },
  });

  resetRateLimit(schluessel);

  // Die Anmeldung bleibt bestehen: Das Sitzungsmerkmal hängt an der
  // Kennung, nicht am Passwort. Wer sich gerade selbst abmelden möchte,
  // findet den Knopf im Menü - erzwungenes Abmelden nach einer Änderung,
  // die man selbst ausgelöst hat, ist nur lästig.
  return { ok: true, message: "Das Passwort wurde geändert. Beim nächsten Anmelden gilt das neue." };
}

export async function eigenenNamenAendern(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ich = await verlangeAdminAktion();

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);

  await prisma.adminUser.update({
    where: { id: ich.id },
    data: { name: name || null },
  });

  revalidatePath("/admin", "layout");
  return { ok: true, message: name ? "Der Name wurde geändert." : "Der Name wurde entfernt." };
}
