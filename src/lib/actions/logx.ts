"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verlangeStudioRecht } from "@/lib/admin-rechte";
import { freieZeiten, logxZugang, verbindungTesten, type FreierTag } from "@/lib/logx";

/**
 * Freie Probetraining-Zeiten eines Studios aus LogX - für das
 * Anfrageformular. Gibt nur Tage, Uhrzeiten und die undurchsichtigen
 * Buchungsschlüssel heraus, nie den Zugang.
 *
 * Ohne LogX-Zugang, ohne freie Zeiten oder bei einer Störung: leer. Das
 * Formular zeigt dann einfach die Wunschzeiten wie bisher.
 */
export async function freieZeitenLaden(studioId: string): Promise<FreierTag[]> {
  if (!studioId) return [];
  const ip = await getClientIp();
  // Großzügig - ein Besucher, der zwischen Studios hin- und herklickt,
  // soll nicht ausgebremst werden; eine Maschine, die abfragt, schon.
  if (!checkRateLimit(`logx-zeiten:${ip}`, 40, 10 * 60 * 1000).allowed) return [];

  const studio = await prisma.studioLocation
    .findUnique({
      where: { id: studioId },
      select: { logxStudioHash: true, logxProfileId: true, logxApiKey: true },
    })
    .catch(() => null);
  const zugang = studio ? logxZugang(studio) : null;
  if (!zugang) return [];
  return freieZeiten(zugang);
}

/**
 * Für "Verbindung testen" im Adminbereich. Prüft die Angaben aus dem
 * Formular, auch vor dem Speichern. Ist kein neuer Schlüssel eingetippt,
 * wird der gespeicherte benutzt.
 */
export async function logxVerbindungTesten(
  studioId: string | null,
  angaben: { hash: string; profil: string; schluessel: string },
): Promise<{ ok: boolean; zeilen: string[] }> {
  await verlangeStudioRecht(studioId);

  const gespeichert = studioId
    ? await prisma.studioLocation.findUnique({ where: { id: studioId }, select: { logxApiKey: true } })
    : null;
  const profil = Number.parseInt(angaben.profil, 10);
  const zugang = logxZugang({
    logxStudioHash: angaben.hash.trim() || null,
    logxProfileId: Number.isFinite(profil) && profil > 0 ? profil : null,
    logxApiKey: angaben.schluessel.trim() || gespeichert?.logxApiKey || null,
  });
  if (!zugang) {
    return { ok: false, zeilen: ["Bitte Studio-Kennung (Hash) und API-Schlüssel eintragen."] };
  }
  return verbindungTesten(zugang);
}
