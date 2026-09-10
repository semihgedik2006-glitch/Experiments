import type { MetadataRoute } from "next";
import { getPublishedPosts, getStudios } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, toggles, studios] = await Promise.all([
    getPublishedPosts(),
    getToggles(),
    getStudios(),
  ]);

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

  // Die vierzehn Standortseiten. Sie sind der Grund, warum jemand nach
  // "EMS Training Rösrath" bei uns landen kann - sie gehören deshalb
  // ausdrücklich gemeldet und nicht darauf verlassen, dass Google sie über
  // die Übersicht findet. Höhere Priorität als der Rest: Auf sie zielt die
  // örtliche Suche.
  const studioRoutes = (toggles.studio ? studios : []).map((studio) => ({
    url: `${siteConfig.url}/studio/${studio.slug}`,
    lastModified: studio.updatedAt,
    priority: 0.8,
  }));

  return [...staticRoutes, ...studioRoutes, ...postRoutes];
}
