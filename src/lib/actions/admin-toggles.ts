"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { toggleDefinitions } from "@/lib/site-toggles";
import { protokollieren } from "@/lib/protokoll";

/**
 * Sichtbarkeit der Bereiche speichern.
 *
 * Die Schalter wirken auf Menü, Startseite, Suche und Sitemap - deshalb
 * werden anschließend alle Seiten neu erzeugt, nicht nur die betroffene.
 */
export async function saveToggles(formData: FormData) {
  await verlangeLeitungAktion();

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

  // Festgehalten wird, WAS jetzt ausgeblendet ist - nicht, was sich
  // geändert hat. Eine Liste der Unterschiede wäre genauer, aber die
  // Frage hinterher lautet "warum war der Blog weg?", und darauf
  // antwortet der Zustand.
  const versteckt = toggleDefinitions
    .filter(({ key }) => formData.get(key) !== "on")
    .map(({ label }) => label);

  await protokollieren({
    art: "GEAENDERT",
    bereich: "Inhalte",
    betreff: "Sichtbarkeit der Bereiche",
    detail: versteckt.length
      ? `ausgeblendet: ${versteckt.join(", ")}`
      : "alle Bereiche sichtbar",
  });
}
