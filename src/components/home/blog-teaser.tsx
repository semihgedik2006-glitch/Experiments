import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { PostThumb } from "@/components/blog/post-thumb";

export async function BlogTeaser() {
  const posts = await getPublishedPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-20 sm:py-24 md:py-32">
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
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised transition-all duration-300 hover:-translate-y-1.5 hover:border-lime/40 hover:shadow-xl hover:shadow-lime/5"
              >
                <PostThumb slug={post.slug} title={post.title} coverImage={post.coverImage} />
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs text-muted">
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-lime">
                    Weiterlesen <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
