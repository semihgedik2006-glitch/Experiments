import type { Metadata } from "next";
import { FrageSeite, frageMetadaten } from "@/components/seiten/frage";
import { FRAGEN } from "@/lib/fragen";

export function generateStaticParams() {
  return FRAGEN.map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return frageMetadaten("de", (await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <FrageSeite sprache="de" slug={(await params).slug} />;
}
