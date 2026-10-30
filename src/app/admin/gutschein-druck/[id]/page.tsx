import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { DruckKnopf } from "@/components/admin/druck-knopf";
import { formatDate } from "@/lib/format";
import { artText, betragText } from "@/lib/gutschein-verwaltung";

export const metadata: Metadata = {
  title: "Gutschein drucken",
  robots: { index: false, follow: false },
};

/**
 * Der Gutschein zum Ausdrucken - eine Karte, eine Seite.
 *
 * Außerhalb des Adminrahmens, damit Menü und Kopfzeile nicht mitgedruckt
 * werden. Gedruckt werden kann nur ein ausgestellter Gutschein: Ein Code,
 * der noch nicht bezahlt ist, gehört nicht auf Papier.
 */
export default async function GutscheinDruckSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await verlangeAdmin();
  const { id } = await params;
  const eingeschraenkt = studioEinschraenkung(admin);

  const g = await prisma.gutschein.findFirst({
    where: { id, status: "AUSGESTELLT", ...(eingeschraenkt ? { studioId: eingeschraenkt } : {}) },
    include: { studio: { select: { name: true, street: true, postalCode: true, city: true, phone: true } } },
  });
  if (!g) return notFound();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 bg-white px-6 py-10 text-neutral-900">
      <div className="w-full rounded-3xl border-2 border-[#527012] p-10 print:border">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#527012]">
          Gutschein
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          Körper<span className="text-[#527012]">formen</span>
        </p>

        <p className="mt-8 text-4xl font-bold">{betragText(g.art, g.betrag)}</p>
        <p className="mt-1 text-lg">{artText(g.art, g.betrag)}</p>

        {g.fuer && <p className="mt-6 text-xl">für {g.fuer}</p>}
        {g.widmung && <p className="mt-2 text-lg italic">„{g.widmung}“</p>}

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-neutral-200 pt-6 text-sm">
          <div>
            <p className="text-neutral-500">Code</p>
            <p className="font-mono text-xl font-semibold tracking-wider">{g.code}</p>
          </div>
          <div className="text-right">
            <p className="text-neutral-500">Gültig bis</p>
            <p className="font-semibold">{g.gueltigBis ? formatDate(g.gueltigBis) : "-"}</p>
          </div>
        </div>

        {g.studio && (
          <p className="mt-6 text-xs text-neutral-500">
            Einlösbar bei {g.studio.name}, {g.studio.street}, {g.studio.postalCode} {g.studio.city}
            {g.studio.phone ? ` · Telefon ${g.studio.phone}` : ""}. Keine Barauszahlung; ein
            Restbetrag bleibt auf dem Gutschein erhalten.
          </p>
        )}
      </div>
      <DruckKnopf />
    </div>
  );
}
