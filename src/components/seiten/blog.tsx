import type { Metadata } from "next";
import { isVisible } from "@/lib/site-toggles";
import { notFound } from "next/navigation";
import Link from "@/components/sprach-link";
import { ArrowRight, Clock, Newspaper, SearchX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { PostThumb } from "@/components/blog/post-thumb";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { alleThemen, themaAnzeige, themaSchluessel } from "@/lib/blog-themen";
import type { Sprache } from "@/lib/sprache";
import { lokal } from "@/lib/i18n/lokal";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { param, type SuchParams } from "@/lib/admin-list";
import { lesezeit } from "@/lib/lesezeit";
import { WegLeiste } from "@/components/weg-leiste";

export function blogMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(
    sprache,
    "/blog",
    sprache === "en"
      ? { title: "Knowledge", description: "Training tips, EMS knowledge and news from Körperformen." }
      : { title: "Wissen", description: "Trainingstipps, EMS-Wissen und Neuigkeiten von Körperformen." },
  );
}

/**
 * Die Blogübersicht - mit Themenfilter.
 *
 * Der Filter steht in der Adresse (?thema=Rücken) und nicht im
 * Browserzustand. Das hat drei Folgen, die alle in dieselbe Richtung
 * gehen: Eine gefilterte Ansicht lässt sich weitergeben, der Zurück-Knopf
 * funktioniert, und die Seite bleibt ohne JavaScript benutzbar.
 *
 * Ab wie vielen Themen der Filter erscheint: ab zweien. Ein einziger
 * Filterknopf, der alles zeigt, ist kein Filter.
 */
const AB_HIER_FILTER = 2;

export async function BlogSeite({
  sprache,
  searchParams,
}: {
  sprache: Sprache;
  searchParams: Promise<SuchParams>;
}) {
  const en = sprache === "en";
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("blog"))) return notFound();

  const params = await searchParams;
  const gewaehlt = param(params, "thema");

  // Titel, Kurzbeschreibung und Text in der Sprache der Seite - wo keine
  // englische Fassung eingetragen ist, der deutsche Text.
  const posts = (await getPublishedPosts()).map((post) => ({
    ...post,
    title: lokal(sprache, post.title, post.titleEn),
    excerpt: lokal(sprache, post.excerpt, post.excerptEn),
    content: lokal(sprache, post.content, post.contentEn),
  }));
  const themen = alleThemen(posts);

  // Gefiltert wird ohne Rücksicht auf Groß- und Kleinschreibung: Ein Link,
  // in dem jemand "rücken" statt "Rücken" schreibt, soll trotzdem greifen.
  const gefiltert = gewaehlt
    ? posts.filter((post) =>
        post.themen.some((thema) => themaSchluessel(thema) === themaSchluessel(gewaehlt)),
      )
    : posts;

  // Die Schreibweise aus den Daten, nicht die aus der Adresse - in der
  // Überschrift soll "Rücken" stehen, auch wenn "rücken" getippt wurde.
  // Der neueste Beitrag steht ungefiltert groß oben - eine Übersicht mit
  // einem klaren Einstieg liest sich wie ein Magazin, ein Raster aus
  // gleich großen Karten wie ein Archiv. Erst ab drei Beiträgen: Bei
  // zweien wäre der zweite allein darunter.
  const titel = !gewaehlt && gefiltert.length >= 3 ? gefiltert[0] : null;
  const raster = titel ? gefiltert.slice(1) : gefiltert;

  const angezeigtesThema =
    themen.find((thema) => themaSchluessel(thema.name) === themaSchluessel(gewaehlt))?.name ??
    gewaehlt;

  return (
    <>
      <PageHeader
        kicker={en ? "Knowledge" : "Wissen"}
        title={
          en ? (
            <>
              All about <span className="text-accent-strong">EMS</span>
            </>
          ) : (
            <>
              Wissen rund um <span className="text-accent-strong">EMS</span>
            </>
          )
        }
        // "ehrliche Antworten" muss man nicht ankündigen - entweder der
        // Beitrag ist es, oder die Ankündigung macht es nicht besser.
        intro={en ? "The questions we are asked most often at the studio." : "Die Fragen, die uns im Studio am häufigsten gestellt werden."}
      />

      <section className="relative overflow-hidden py-16 sm:py-20 md:py-24">
        <ImpulsStreu anordnung="weit" />
        <Container className="relative">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/15 text-accent">
                <Newspaper size={22} />
              </div>
              <p className="mt-5 font-semibold">{en ? "The first articles are on their way" : "Die ersten Artikel sind in Arbeit"}</p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                {en
                  ? "Training tips and EMS knowledge will appear here soon. Until then: sign up for the newsletter so you do not miss anything."
                  : "Hier erscheinen bald Trainingstipps und EMS-Wissen. Bis dahin: Melde dich für den Newsletter an, dann verpasst du nichts."}
              </p>
            </div>
          ) : (
            <>
              {themen.length >= AB_HIER_FILTER && (
                <nav aria-label={en ? "Filter by topic" : "Nach Thema filtern"} className="flex flex-wrap gap-2">
                  <Link
                    href="/blog"
                    aria-current={gewaehlt ? undefined : "page"}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                      gewaehlt
                        ? "border-border hover:border-lime"
                        : "border-lime bg-lime text-on-lime"
                    }`}
                  >
                    {en ? "All" : "Alle"}
                  </Link>
                  {themen.map((thema) => {
                    const aktiv = themaSchluessel(thema.name) === themaSchluessel(gewaehlt);
                    return (
                      <Link
                        key={thema.name}
                        href={`/blog?thema=${encodeURIComponent(thema.name)}`}
                        aria-current={aktiv ? "page" : undefined}
                        className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                          aktiv
                            ? "border-lime bg-lime text-on-lime"
                            : "border-border hover:border-lime"
                        }`}
                      >
                        {themaAnzeige(sprache, thema.name)}
                        <span className={aktiv ? "ml-1.5 opacity-70" : "ml-1.5 text-muted"}>
                          {thema.anzahl}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              )}

              {gefiltert.length === 0 ? (
                /* Erreichbar nur über eine von Hand geänderte Adresse - die
                   Filterknöpfe zeigen ausschließlich Themen, zu denen es
                   auch etwas gibt. Trotzdem: Eine leere Seite ohne Erklärung
                   sieht nach einem Fehler aus. */
                <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-lime/12 text-accent">
                    <SearchX size={20} aria-hidden />
                  </span>
                  <p className="mt-3 font-semibold">
                    {en
                      ? `Nothing on “${themaAnzeige(sprache, angezeigtesThema)}” yet`
                      : `Zum Thema „${angezeigtesThema}“ gibt es noch nichts`}
                  </p>
                  <Link
                    href="/blog"
                    className="mt-4 inline-block rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime"
                  >
                    {en ? "Show all articles" : "Alle Beiträge zeigen"}
                  </Link>
                </div>
              ) : (
                <>
                {titel && (
                  <Link
                    href={`/blog/${titel.slug}`}
                    className={`karte-hebt karte-glanz group grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-[1.2fr_1fr] ${
                      themen.length >= AB_HIER_FILTER ? "mt-10" : ""
                    }`}
                  >
                    <PostThumb
                      slug={titel.slug}
                      title={titel.title}
                      coverImage={titel.coverImage}
                      className="h-56 md:h-full md:min-h-80"
                    />
                    <div className="flex flex-col justify-center p-7 sm:p-10">
                      <span className="flex items-center gap-3 text-xs text-muted">
                        <span className="rounded-full bg-lime px-2.5 py-0.5 font-semibold text-on-lime">{en ? "New" : "Neu"}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} aria-hidden /> {lesezeit(titel.content)} {en ? "min read" : "Min. Lesezeit"}
                        </span>
                      </span>
                      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{titel.title}</h2>
                      <p className="mt-3 text-muted">{titel.excerpt}</p>
                      <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                        {en ? "Read now" : "Jetzt lesen"} <ArrowRight size={14} className="karte-pfeil" aria-hidden />
                      </span>
                    </div>
                  </Link>
                )}
                <Stagger
                  className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${
                    themen.length >= AB_HIER_FILTER || titel ? "mt-10" : ""
                  }`}
                >
                  {raster.map((post) => (
                    <StaggerItem key={post.id} className="h-full">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="karte-hebt karte-glanz group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface"
                      >
                        <PostThumb slug={post.slug} title={post.title} coverImage={post.coverImage} />
                        <div className="flex flex-1 flex-col p-6">
                          <span className="flex items-center gap-3 text-xs text-muted">
                            {post.publishedAt ? formatDate(post.publishedAt, sprache) : ""}
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} aria-hidden /> {lesezeit(post.content)} {en ? "min" : "Min."}
                            </span>
                          </span>
                          <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>
                          <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
                          {post.themen.length > 0 && (
                            <span className="mt-4 flex flex-wrap gap-1.5">
                              {post.themen.slice(0, 3).map((thema) => (
                                <span
                                  key={thema}
                                  className="rounded-full bg-lime/12 px-2.5 py-0.5 text-xs text-accent"
                                >
                                  {themaAnzeige(sprache, thema)}
                                </span>
                              ))}
                            </span>
                          )}
                          <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
                            {en ? "Read more" : "Weiterlesen"} <ArrowRight size={14} className="karte-pfeil" aria-hidden />
                          </span>
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </Stagger>
                </>
              )}
            </>
          )}
        </Container>
      </section>

      <WegLeiste aktuell="dabeibleiben" />
    </>
  );
}
