import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";

export async function BlogTeaser() {
  const posts = await getPublishedPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-24">
      <Container>
        <div className="mb-16 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Aus dem Blog</h2>
            <p className="mt-4 max-w-xl text-muted">
              Trainingstipps, EMS-Wissen und Neuigkeiten aus dem Studio.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-1 text-sm text-lime hover:underline md:flex"
          >
            Alle Artikel <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex flex-col rounded-2xl border border-border bg-surface-raised p-6 transition-transform hover:-translate-y-1"
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
          ))}
        </div>
      </Container>
    </section>
  );
}
