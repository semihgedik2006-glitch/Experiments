import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { BlogKarten } from "@/components/home/blog-karten";
import type { Sprache } from "@/lib/sprache";
import { lokal } from "@/lib/i18n/lokal";

/**
 * Drei Beiträge auf der Startseite.
 *
 * Geladen werden ein paar mehr: Mit gewähltem Ziel zeigt die Startseite die
 * drei, die am besten dazu passen (siehe BlogKarten) - "Abnehmen mit EMS"
 * für alle, die abnehmen wollen, statt einfach der neuesten drei.
 */
export async function BlogTeaser({ sprache = "de" }: { sprache?: Sprache }) {
  const posts = await getPublishedPosts(9);
  if (posts.length === 0) return null;

  return (
    <BlogKarten
      posts={posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: lokal(sprache, post.title, post.titleEn),
        excerpt: lokal(sprache, post.excerpt, post.excerptEn),
        coverImage: post.coverImage,
        datum: post.publishedAt ? formatDate(post.publishedAt, sprache) : "",
      }))}
    />
  );
}
