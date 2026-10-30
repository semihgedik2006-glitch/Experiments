import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/sprach-link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/comment-form";
import { CommentReplyToggle } from "@/components/comment-reply-toggle";
import { getPostBySlug, getApprovedComments, getPublishedPosts } from "@/lib/data";
import { themaAnzeige, verwandteBeitraege } from "@/lib/blog-themen";
import type { Sprache } from "@/lib/sprache";
import { lokal } from "@/lib/i18n/lokal";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { fragenZuIn } from "@/lib/fragen";
import { zielInhalte, passung } from "@/lib/ziel-inhalte";
import { formatDate } from "@/lib/format";
import { lesezeit } from "@/lib/lesezeit";
import { PostThumb } from "@/components/blog/post-thumb";
import { ArticleJsonLd } from "@/components/structured-data";
import { getToggles } from "@/lib/site-toggles";

/** Ein Beitrag mit Titel, Kurzbeschreibung und Text in der gewünschten Sprache. */
async function ladeBeitrag(sprache: Sprache, slug: string) {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  return {
    ...post,
    title: lokal(sprache, post.title, post.titleEn),
    excerpt: lokal(sprache, post.excerpt, post.excerptEn),
    content: lokal(sprache, post.content, post.contentEn),
  };
}

export async function beitragMetadaten(sprache: Sprache, slug: string): Promise<Metadata> {
  const post = await ladeBeitrag(sprache, slug);
  if (!post) return {};

  // Ohne kanonische Adresse behandelt Google eine Seite, die über mehrere
  // Wege erreichbar ist, unter Umständen als mehrere Seiten.
  const meta = seitenMetadaten(sprache, `/blog/${slug}`, { title: post.title, description: post.excerpt });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export async function BeitragSeite({ sprache, slug }: { sprache: Sprache; slug: string }) {
  const en = sprache === "en";
  const toggles = await getToggles();
  // Ist der Blog ausgeblendet, gilt das auch für die einzelnen Beiträge.
  if (!toggles.blog) return notFound();

  const post = await ladeBeitrag(sprache, slug);
  if (!post) return notFound();

  const comments = toggles.kommentare ? await getApprovedComments(post.id) : [];

  // Alle veröffentlichten Beiträge, um daraus die passenden auszuwählen.
  // Bei einer Handvoll Beiträgen ist das billiger als eine eigene Abfrage
  // mit Themenvergleich in der Datenbank - und es bleibt lesbar.
  const alle = (await getPublishedPosts()).map((p) => ({
    ...p,
    title: lokal(sprache, p.title, p.titleEn),
    excerpt: lokal(sprache, p.excerpt, p.excerptEn),
  }));
  const verwandte = verwandteBeitraege(post, alle);

  return (
    <article className="py-20">
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        sprache={sprache}
      />
      <Container className="max-w-2xl">
        <span className="text-sm text-muted">
          {post.publishedAt ? formatDate(post.publishedAt, sprache) : ""}
          {" · "}
          {lesezeit(post.content)} {en ? "min read" : "Min. Lesezeit"}
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{post.title}</h1>

        {/* Die Themen sind Links: Wer den Beitrag interessant fand, findet
            damit in einem Klick die anderen zum selben Thema. */}
        {post.themen.length > 0 && (
          <nav aria-label={en ? "Topics of this article" : "Themen dieses Beitrags"} className="mt-4 flex flex-wrap gap-2">
            {post.themen.map((thema) => (
              <Link
                key={thema}
                href={`/blog?thema=${encodeURIComponent(thema)}`}
                className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-lime hover:text-accent"
              >
                {themaAnzeige(sprache, thema)}
              </Link>
            ))}
          </nav>
        )}

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

        <div className="prose prose-invert lesebreite mt-10 max-w-none space-y-5 text-[15px] leading-7 text-foreground/90">
          {post.content.split("\n").filter(Boolean).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Die Seiten, die dasselbe Thema ausführlich behandeln. Ein Beitrag
            über den Rücken steht sonst neben der Zielseite und der
            Fragen-Seite zum Rücken - für Google drei Seiten zum selben
            Thema, die gegeneinander antreten. Der Verweis macht klar,
            welche die Hauptseite ist. */}
        {(() => {
          const ziel = [...zielInhalte(sprache)]
            .map((z) => ({ z, p: passung(post.title, z) }))
            .filter((x) => x.p > 0)
            .sort((a, b) => b.p - a.p)[0]?.z;
          const fragen = fragenZuIn(sprache, post.title);
          if (!ziel && fragen.length === 0) return null;
          return (
            <ul className="mt-12 space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm">
              {ziel && (
                <li>
                  <Link href={`/ziel/${ziel.wert}`} className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
                    {ziel.seite.titel} <ArrowRight size={14} aria-hidden />
                  </Link>
                </li>
              )}
              {fragen.map((f) => (
                <li key={f.slug}>
                  <Link href={`/fragen/${f.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
                    {f.frage} <ArrowRight size={14} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          );
        })()}

        {/* Verwandte Beiträge.
            Wer bis hierher gelesen hat, ist der aufmerksamste Besucher der
            Seite - und stand bisher am Ende vor nichts. */}
        {verwandte.length > 0 && (
          <div className="mt-14 border-t border-border pt-10">
            <h2 className="text-lg font-semibold">{en ? "Related" : "Passt dazu"}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {verwandte.map((anderer) => (
                <Link
                  key={anderer.id}
                  href={`/blog/${anderer.slug}`}
                  className="karte-hebt karte-glanz flex h-full flex-col rounded-xl border border-border bg-surface p-4"
                >
                  <span className="text-sm font-semibold">{anderer.title}</span>
                  <span className="mt-2 line-clamp-3 flex-1 text-xs text-muted">
                    {anderer.excerpt}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent">
                    {en ? "Read" : "Lesen"} <ArrowRight size={12} aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 border-t border-border pt-10 text-center">
          <p className="text-muted">{en ? "Curious?" : "Neugierig geworden?"}</p>
          <Button href="/probetermin" className="mt-4">
            {en ? "Book a trial session" : "Probetermin buchen"}
          </Button>
        </div>

        {/* Sind die Kommentare im Adminbereich ausgeblendet, entfällt der
            gesamte Bereich - vorhandene Kommentare bleiben dabei erhalten
            und erscheinen wieder, sobald der Schalter zurückgestellt wird. */}
        {toggles.kommentare && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <MessageCircle size={20} className="text-accent" />
            {en
              ? comments.length > 0
                ? `${comments.length} comments`
                : "Comments"
              : comments.length > 0
                ? `${comments.length} Kommentare`
                : "Kommentare"}
          </h2>

          <div className="mt-6 space-y-5">
            {comments.map((comment) => (
              <div key={comment.id} className="card p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold">{comment.authorName}</p>
                  <p className="text-xs text-muted">{formatDate(comment.createdAt, sprache)}</p>
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
                          <p className="text-xs text-muted">{formatDate(reply.createdAt, sprache)}</p>
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
                {en ? "No comments yet - be the first!" : "Noch keine Kommentare - sei die/der Erste!"}
              </p>
            )}
          </div>

          <div className="mt-8">
            <CommentForm postId={post.id} slug={post.slug} />
          </div>
        </div>
        )}
      </Container>
    </article>
  );
}
