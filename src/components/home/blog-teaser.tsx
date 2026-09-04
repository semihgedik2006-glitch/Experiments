import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";

export async function BlogTeaser() {
  const posts = await getPublishedPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-28 md:py-32">
      <Container>
        <SectionHeader
          kicker="Wissen"
          title="Aus dem Blog"
          intro="Trainingstipps, EMS-Wissen und Neuigkeiten aus dem Studio."
          className="mb-16"
          action={
            <Link
              href="/blog"
              className="hidden items-center gap-1 text-sm font-medium text-lime hover:underline md:flex"
            >
              Alle Artikel <ArrowRight size={14} />
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.1}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-2xl hover:shadow-lime/10"
              >
                <span className="text-xs text-muted">
                  {post.publishedAt ? formatDate(post.publishedAt) : ""}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
                <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-lime">
                  Weiterlesen <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
