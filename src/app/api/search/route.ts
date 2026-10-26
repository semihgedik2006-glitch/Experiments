import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { staticSearchEntries, staticSearchEntriesEn } from "@/lib/search-data";
import { lokal } from "@/lib/i18n/lokal";
import { pfad } from "@/lib/i18n/pfade";
import { spracheAusText } from "@/lib/sprache";
import { getFaqItems } from "@/lib/data";
import { getToggles } from "@/lib/site-toggles";

type SearchResult = { type: string; title: string; description: string; href: string };

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  // Auf der englischen Seite wird in den englischen Texten gesucht, und die
  // Treffer führen auf die englischen Seiten.
  const sprache = spracheAusText(request.nextUrl.searchParams.get("sprache"));
  const en = sprache === "en";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Was ausgeblendet ist, darf auch die Suche nicht ausgeben - sonst führt
  // ein Treffer auf eine Seite, die mit 404 antwortet.
  const toggles = await getToggles();
  const hidden = new Set(
    Object.entries(toggles)
      .filter(([, visible]) => !visible)
      .map(([key]) => `/${key}`),
  );

  const pageResults: SearchResult[] = (en ? staticSearchEntriesEn : staticSearchEntries)
    .filter((entry) => !hidden.has(entry.href))
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.keywords.some((keyword) => keyword.toLowerCase().includes(query)),
    )
    .map((entry) => ({
      type: en ? "Page" : "Seite",
      title: entry.title,
      description: entry.description,
      href: pfad(sprache, entry.href),
    }));

  const faqItems = await getFaqItems();
  const faqResults: SearchResult[] = faqItems
    .map((item) => ({
      question: lokal(sprache, item.question, item.questionEn),
      answer: lokal(sprache, item.answer, item.answerEn),
    }))
    .filter(
      (item) =>
        item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query),
    )
    .map((item) => ({
      type: "FAQ",
      title: item.question,
      description: item.answer,
      href: en ? "/en#faq" : "/#faq",
    }));

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { title: true, excerpt: true, content: true, titleEn: true, excerptEn: true, contentEn: true, slug: true },
  });

  const blogResults: SearchResult[] = (toggles.blog ? posts : [])
    .map((post) => ({
      slug: post.slug,
      title: lokal(sprache, post.title, post.titleEn),
      excerpt: lokal(sprache, post.excerpt, post.excerptEn),
      content: lokal(sprache, post.content, post.contentEn),
    }))
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
      href: pfad(sprache, `/blog/${post.slug}`),
    }));

  const results = [...pageResults, ...blogResults, ...faqResults].slice(0, 12);

  return NextResponse.json({ results });
}
