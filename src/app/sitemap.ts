import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, toggles] = await Promise.all([getPublishedPosts(), getToggles()]);

  // Ausgeblendete Bereiche gehören nicht in die Sitemap - sonst meldet die
  // Seite Google Adressen, die mit 404 antworten.
  const staticRoutes = [
    "",
    "/ems-training",
    ...(toggles.studio ? ["/studio"] : []),
    ...(toggles.preise ? ["/preise"] : []),
    ...(toggles.erfolgsgeschichten ? ["/erfolgsgeschichten"] : []),
    ...(toggles["ueber-uns"] ? ["/ueber-uns"] : []),
    "/probetermin",
    ...(toggles.blog ? ["/blog"] : []),
    "/kontakt",
    "/agb",
    "/impressum",
    "/datenschutz",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  const postRoutes = (toggles.blog ? posts : []).map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticRoutes, ...postRoutes];
}
