import type { Metadata } from "next";
import { BeitragSeite, beitragMetadaten } from "@/components/seiten/beitrag";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return beitragMetadaten("en", (await params).slug);
}

export default async function BlogPostPage({ params }: Props) {
  return <BeitragSeite sprache="en" slug={(await params).slug} />;
}
