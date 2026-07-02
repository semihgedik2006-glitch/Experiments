import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/lib/data";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="py-20">
      <Container className="max-w-2xl">
        <span className="text-sm text-muted">
          {post.publishedAt ? formatDate(post.publishedAt) : ""}
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{post.title}</h1>

        <div className="prose prose-invert mt-10 max-w-none space-y-5 text-[15px] leading-7 text-foreground/90">
          {post.content.split("\n").filter(Boolean).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-10 text-center">
          <p className="text-muted">Neugierig geworden?</p>
          <Button href="/probetermin" className="mt-4">
            Probetermin buchen
          </Button>
        </div>
      </Container>
    </article>
  );
}
