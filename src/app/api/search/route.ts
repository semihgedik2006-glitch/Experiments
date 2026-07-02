import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staticSearchEntries } from "@/lib/search-data";
import { faqItems } from "@/lib/faq-data";

type SearchResult = { type: string; title: string; description: string; href: string };

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const pageResults: SearchResult[] = staticSearchEntries
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.keywords.some((keyword) => keyword.toLowerCase().includes(query)),
    )
    .map((entry) => ({
      type: "Seite",
      title: entry.title,
      description: entry.description,
      href: entry.href,
    }));

  const faqResults: SearchResult[] = faqItems
    .filter(
      (item) =>
        item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query),
    )
    .map((item) => ({
      type: "FAQ",
      title: item.question,
      description: item.answer,
      href: "/#faq",
    }));

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { title: true, excerpt: true, content: true, slug: true },
  });

  const blogResults: SearchResult[] = posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query),
    )
    .map((post) => ({
      type: "Blog",
      title: post.title,
      description: post.excerpt,
      href: `/blog/${post.slug}`,
    }));

  const results = [...pageResults, ...blogResults, ...faqResults].slice(0, 12);

  return NextResponse.json({ results });
}
