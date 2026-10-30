import type { Metadata } from "next";
import { ZielSeite, zielMetadaten } from "@/components/seiten/ziel";
import { ZIEL_SLUG_EN, zielAusSlugEn } from "@/lib/ziel-inhalte-en";

export function generateStaticParams() {
  return Object.values(ZIEL_SLUG_EN).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return zielMetadaten("en", zielAusSlugEn((await params).slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ZielSeite sprache="en" wert={zielAusSlugEn((await params).slug)} />;
}
