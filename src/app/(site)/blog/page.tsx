import { BlogSeite, blogMetadaten } from "@/components/seiten/blog";
import type { SuchParams } from "@/lib/admin-list";

export const metadata = blogMetadaten("de");

export default function BlogPage({ searchParams }: { searchParams: Promise<SuchParams> }) {
  return <BlogSeite sprache="de" searchParams={searchParams} />;
}
