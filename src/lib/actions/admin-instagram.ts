"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { INSTAGRAM_ZUGANG, schluesselErneuern } from "@/lib/instagram";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Den Instagram-Zugang hinterlegen, prüfen oder entfernen.
 *
 * Nur die Leitung: Das Konto gehört der Marke, nicht einem Standort.
 *
 * Der Schlüssel wird nach dem Speichern nie wieder angezeigt - auch nicht
 * dem, der ihn eingetragen hat. Wer ihn hat, kann im Namen des Kontos
 * lesen; ein Feld, in dem er zum Kopieren bereitsteht, ist eine Kopie zu
 * viel. Zum Ändern wird er neu eingefügt.
 */

/** Ein Schlüssel von Meta ist lang und besteht aus Buchstaben und Ziffern. */
const MUSTER = /^[A-Za-z0-9._-]{40,600}$/;

export async function instagramSpeichern(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await verlangeLeitungAktion();

  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { ok: false, message: "Bitte füg den Zugangsschlüssel ein." };
  if (!MUSTER.test(token)) {
    return {
      ok: false,
      message:
        "Das sieht nicht nach einem Zugangsschlüssel aus. Er ist sehr lang und enthält " +
        "keine Leerzeichen - achte darauf, wirklich alles zu kopieren.",
    };
  }

  await prisma.externerZugang.upsert({
    where: { id: INSTAGRAM_ZUGANG },
    create: { id: INSTAGRAM_ZUGANG, token, letzterFehler: null },
    // Ablaufdatum und Fehler zurücksetzen: Es ist ein neuer Schlüssel, die
    // Angaben zum alten wären ab jetzt falsch.
    update: { token, laeuftAb: null, erneuertAm: null, letzterFehler: null },
  });

  // Sofort verlängern lassen. Zwei Fliegen: Der Schlüssel bekommt sein
  // Ablaufdatum, und ein Tippfehler fällt hier auf statt erst dann, wenn
  // die Wand leer bleibt.
  const ergebnis = await schluesselErneuern();

  revalidatePath("/admin/instagram");
  revalidatePath("/");

  if (!ergebnis.ok) {
    return {
      ok: false,
      message:
        `Gespeichert, aber Instagram hat ihn nicht angenommen: ${ergebnis.meldung} ` +
        "Ein frisch erzeugter Schlüssel lässt sich erst nach 24 Stunden verlängern - " +
        "in dem Fall einfach morgen noch einmal prüfen.",
    };
  }

  return { ok: true, message: "Verbunden. Die Wand erscheint auf der Startseite." };
}

/** Von Hand prüfen und verlängern - derselbe Weg, den der Tageslauf geht. */
export async function instagramPruefen(): Promise<ActionResult> {
  await verlangeLeitungAktion();

  const ergebnis = await schluesselErneuern();
  revalidatePath("/admin/instagram");
  revalidatePath("/");

  return { ok: ergebnis.ok, message: ergebnis.meldung };
}

export async function instagramTrennen() {
  await verlangeLeitungAktion();

  await prisma.externerZugang.deleteMany({ where: { id: INSTAGRAM_ZUGANG } });
  revalidatePath("/admin/instagram");
  revalidatePath("/");
}
