"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { toggleDefinitions } from "@/lib/site-toggles";

/**
 * Sichtbarkeit der Bereiche speichern.
 *
 * Die Schalter wirken auf Menü, Startseite, Suche und Sitemap - deshalb
 * werden anschließend alle Seiten neu erzeugt, nicht nur die betroffene.
 */
export async function saveToggles(formData: FormData) {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");

  // Ein nicht angehaktes Kontrollkästchen wird vom Browser gar nicht
  // gesendet - fehlt der Schlüssel, bedeutet das also "ausgeblendet".
  await Promise.all(
    toggleDefinitions.map(({ key }) =>
      prisma.siteToggle.upsert({
        where: { key },
        create: { key, visible: formData.get(key) === "on" },
        update: { visible: formData.get(key) === "on" },
      }),
    ),
  );

  // "layout" erneuert die Wurzel samt allem darunter - also Kopfzeile,
  // Fußzeile und sämtliche Seiten. Die Sitemap ist ein eigener Handler und
  // wird deshalb ausdrücklich mitgenannt.
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/sichtbarkeit");
}
