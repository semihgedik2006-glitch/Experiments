import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { BlogKarten } from "@/components/home/blog-karten";

/**
 * Drei Beiträge auf der Startseite.
 *
 * Geladen werden ein paar mehr: Mit gewähltem Ziel zeigt die Startseite die
 * drei, die am besten dazu passen (siehe BlogKarten) - "Abnehmen mit EMS"
 * für alle, die abnehmen wollen, statt einfach der neuesten drei.
 */
export async function BlogTeaser() {
  const posts = await getPublishedPosts(9);
  if (posts.length === 0) return null;

  return (
    <BlogKarten
      posts={posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        datum: post.publishedAt ? formatDate(post.publishedAt) : "",
      }))}
    />
  );
}
