import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const staticRoutes = [
    "",
    "/ems-training",
    "/studio",
    "/preise",
    "/erfolgsgeschichten",
    "/ueber-uns",
    "/probetermin",
    "/blog",
    "/kontakt",
    "/agb",
    "/impressum",
    "/datenschutz",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  const postRoutes = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticRoutes, ...postRoutes];
}
