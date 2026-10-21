"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { PostThumb } from "@/components/blog/post-thumb";
import { useZiel } from "@/components/ziel/ziel-kontext";
import { ZIEL_INHALTE, nachZiel, passung, zielInhalt } from "@/lib/ziel-inhalte";
import { ZielMotiv } from "@/components/ziel/ziel-motiv";

export type BlogKarte = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  datum: string;
};

/** Die drei Karten - ohne Ziel die neuesten, mit Ziel die passendsten. */
export function BlogKarten({ posts }: { posts: BlogKarte[] }) {
  const { ziel } = useZiel();
  const inhalt = zielInhalt(ziel);
  const auswahl = nachZiel(posts, (p) => `${p.slug} ${p.title} ${p.excerpt}`, inhalt).slice(0, 3);

  return (
    <section className="border-t border-border py-20 sm:py-24 md:py-32">
      <Container>
        <SectionHeader
          kicker="Wissen"
          title={inhalt ? `Lesestoff zu „${inhalt.kurz}“` : "Aus dem Blog"}
          intro="Trainingstipps, EMS-Wissen und Neuigkeiten aus dem Studio."
          className="mb-16"
          action={
            <Link
              href="/blog"
              className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline md:flex"
            >
              Alle Artikel <ArrowRight size={14} />
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          {auswahl.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.1}>
              <Link
                href={`/blog/${post.slug}`}
                className="karte-hebt karte-glanz group flex h-full flex-col overflow-hidden card"
              >
                <div className="relative">
                  <PostThumb slug={post.slug} title={post.title} coverImage={post.coverImage} />
                  <ThemaMarke text={`${post.slug} ${post.title} ${post.excerpt}`} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs text-muted">{post.datum}</span>
                  <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
                    Weiterlesen <ArrowRight size={14} className="karte-pfeil" aria-hidden />
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

/**
 * Kleine Marke oben links im Kartenkopf: das Motiv des Ziels, zu dem der
 * Beitrag am besten passt - "Abnehmen mit EMS" bekommt die Wochen-Haken.
 * Passt er zu keinem Ziel, entfällt sie. Ohne Bewegung: Drei animierte
 * Motive nebeneinander wären Unruhe, keine Information.
 */
function ThemaMarke({ text }: { text: string }) {
  const treffer = ZIEL_INHALTE.map((z) => ({ z, p: passung(text, z) }))
    .filter((t) => t.p > 0)
    .sort((a, b) => b.p - a.p)[0];
  if (!treffer) return null;
  return (
    <span className="on-ink absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 py-1 pl-1 pr-3 text-xs font-semibold text-foreground backdrop-blur">
      <span className="h-7 w-7 rounded-full bg-black/60 p-1">
        <ZielMotiv ziel={treffer.z.wert} stehend className="h-full w-full" />
      </span>
      {treffer.z.kurz}
    </span>
  );
}
