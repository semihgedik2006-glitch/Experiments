import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { DruckKnopf } from "@/components/admin/druck-knopf";
import { GutscheinKarte } from "@/components/gutschein/gutschein-karte";

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
      <GutscheinKarte gutschein={g} studio={g.studio} />
      <DruckKnopf />
    </div>
  );
}
