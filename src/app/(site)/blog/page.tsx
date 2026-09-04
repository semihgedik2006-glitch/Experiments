import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description: "Trainingstipps, EMS-Wissen und Neuigkeiten von Körperformen.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container>
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
          Der <span className="text-lime">Blog</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Alles rund um EMS-Training, Ernährung und ein gesünderes Leben.
        </p>

        {posts.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/15 text-lime">
              <Newspaper size={22} />
            </div>
            <p className="mt-5 font-semibold">Die ersten Artikel sind in Arbeit</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Hier erscheinen bald Trainingstipps und EMS-Wissen. Bis dahin:
              Melde dich für den Newsletter an, dann verpasst du nichts.
            </p>
          </div>
        ) : (
          <Stagger className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <StaggerItem key={post.id} className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-lime/5"
                >
                  <span className="text-xs text-muted">
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-lime">
                    Weiterlesen <ArrowRight size={14} />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
    </section>
  );
}
