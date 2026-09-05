import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/comment-form";
import { CommentReplyToggle } from "@/components/comment-reply-toggle";
import { getPostBySlug, getApprovedComments } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { PostThumb } from "@/components/blog/post-thumb";
import { ArticleJsonLd } from "@/components/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    // Ohne kanonische Adresse behandelt Google eine Seite, die über mehrere
    // Wege erreichbar ist, unter Umständen als mehrere Seiten.
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const comments = await getApprovedComments(post.id);

  return (
    <article className="py-20">
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
      />
      <Container className="max-w-2xl">
        <span className="text-sm text-muted">
          {post.publishedAt ? formatDate(post.publishedAt) : ""}
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{post.title}</h1>

        {post.coverImage && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <PostThumb
              slug={post.slug}
              title={post.title}
              coverImage={post.coverImage}
              className="h-64 md:h-80"
            />
          </div>
        )}

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

        <div className="mt-16 border-t border-border pt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <MessageCircle size={20} className="text-accent" />
            {comments.length > 0 ? `${comments.length} Kommentare` : "Kommentare"}
          </h2>

          <div className="mt-6 space-y-5">
            {comments.map((comment) => (
              <div key={comment.id} className="card p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold">{comment.authorName}</p>
                  <p className="text-xs text-muted">{formatDate(comment.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm text-muted">{comment.content}</p>

                {comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 border-l-2 border-lime/30 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="text-sm font-semibold">
                            {reply.authorName}
                            {reply.isTeam && (
                              <span className="ml-2 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                Team
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted">{formatDate(reply.createdAt)}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <CommentReplyToggle postId={post.id} slug={post.slug} parentId={comment.id} />
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted">
                Noch keine Kommentare - sei die/der Erste!
              </p>
            )}
          </div>

          <div className="mt-8">
            <CommentForm postId={post.id} slug={post.slug} />
          </div>
        </div>
      </Container>
    </article>
  );
}
