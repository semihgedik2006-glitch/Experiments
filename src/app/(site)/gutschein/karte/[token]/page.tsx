import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DruckKnopf } from "@/components/admin/druck-knopf";
import { GutscheinKarte } from "@/components/gutschein/gutschein-karte";

export const metadata: Metadata = {
  title: "Dein Gutschein",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Die Gutscheinkarte für den Käufer - verlinkt in der Mail nach dem
 * Online-Kauf. Zum Ausdrucken oder als Link zum Weiterschicken.
 *
 * Gezeigt wird sie, solange der Gutschein gilt oder eingelöst ist; ein
 * stornierter Gutschein ergibt 404, damit niemand mit einem ungültigen
 * Code im Studio steht.
 */
export default async function GutscheinKarteSeite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-f0-9]{48}$/.test(token)) notFound();

  const g = await prisma.gutschein.findUnique({ where: { karteToken: token } });
  if (!g || g.status === "STORNIERT" || g.status === "ANGEFRAGT") notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-16">
      {g.status === "EINGELOEST" && (
        <p className="rounded-full bg-surface px-4 py-2 text-sm print:hidden">
          Dieser Gutschein wurde bereits eingelöst.
        </p>
      )}
      <GutscheinKarte gutschein={g} />
      <DruckKnopf />
    </div>
  );
}
