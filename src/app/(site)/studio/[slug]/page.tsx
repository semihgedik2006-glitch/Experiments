import type { Metadata } from "next";
import { StudioDetailSeite, studioMetadaten, studioSlugs } from "@/components/seiten/studio-detail";

export function generateStaticParams() {
  return studioSlugs();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return studioMetadaten("de", (await params).slug);
}

export default async function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  return <StudioDetailSeite sprache="de" slug={(await params).slug} />;
}
