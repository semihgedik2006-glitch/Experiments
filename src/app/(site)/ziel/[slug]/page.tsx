import type { Metadata } from "next";
import { ZielSeite, zielMetadaten } from "@/components/seiten/ziel";
import { ZIEL_INHALTE } from "@/lib/ziel-inhalte";

export function generateStaticParams() {
  return ZIEL_INHALTE.map((z) => ({ slug: z.wert }));
}

// Nur die sechs Ziele - alles andere ist eine falsche Adresse.
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return zielMetadaten("de", (await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ZielSeite sprache="de" wert={(await params).slug} />;
}
