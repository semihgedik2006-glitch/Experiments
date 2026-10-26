import type { Metadata } from "next";
import { FrageSeite, frageMetadaten } from "@/components/seiten/frage";
import { FRAGE_SLUG_EN, frageAusSlugEn } from "@/lib/fragen";

export function generateStaticParams() {
  return Object.values(FRAGE_SLUG_EN).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return frageMetadaten("en", frageAusSlugEn((await params).slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <FrageSeite sprache="en" slug={frageAusSlugEn((await params).slug)} />;
}
