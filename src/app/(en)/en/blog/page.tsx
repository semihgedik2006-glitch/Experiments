import { BlogSeite, blogMetadaten } from "@/components/seiten/blog";
import type { SuchParams } from "@/lib/admin-list";

export const metadata = blogMetadaten("en");

export default function BlogPage({ searchParams }: { searchParams: Promise<SuchParams> }) {
  return <BlogSeite sprache="en" searchParams={searchParams} />;
}
