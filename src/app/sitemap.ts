import type { MetadataRoute } from "next";
import { getPublishedPosts, getStudios } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";
import { erfolgeVorhanden } from "@/lib/kundenstimmen";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, toggles, studios, erfolge] = await Promise.all([
    getPublishedPosts(),
    getToggles(),
    getStudios(),
    erfolgeVorhanden(),
  ]);

  // Ausgeblendete Bereiche gehören nicht in die Sitemap - sonst meldet die
  // Seite Google Adressen, die mit 404 antworten.
  const staticRoutes = [
    "",
    "/ems-training",
    ...(toggles.studio ? ["/studio"] : []),
    ...(toggles.preise ? ["/preise"] : []),
    // Nur wenn die Seite auch Inhalt hat - sonst meldet die Sitemap
    // Google eine Adresse, die mit 404 antwortet.
    ...(toggles.erfolgsgeschichten && erfolge ? ["/erfolgsgeschichten"] : []),
    ...(toggles["ueber-uns"] ? ["/ueber-uns"] : []),
    "/probetermin",
    // Der Einstieg in den eigenen Terminbereich. Nur das Formular - die
    // Seite dahinter ist von der Indizierung ausgenommen. Sie gehört
    // hierher, weil sie im Menü absichtlich nicht auftaucht und sonst
    // nur über den Fußbereich zu finden wäre.
    "/meine-termine",
    ...(toggles.blog ? ["/blog"] : []),
    "/kontakt",
    "/agb",
    "/impressum",
    "/datenschutz",
    // Die englische Einstiegsseite. Sie steht hier ausdrücklich drin:
    // Gefunden wird sie über eine andere Suche ("EMS training Cologne")
    // als die deutsche, und über die deutsche Navigation ist sie nur ein
    // kleiner Link in der Kopfzeile.
    "/en",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    // Die beiden Fassungen zeigen aufeinander. Ohne diese Angabe hält
    // Google sie für zwei Seiten über dasselbe Thema und wertet eine
    // davon ab - beide Adressen bekommen deshalb denselben Verweis auf
    // die jeweils andere.
    ...(route === "" || route === "/en"
      ? {
          alternates: {
            languages: {
              de: siteConfig.url,
              en: `${siteConfig.url}/en`,
            },
          },
        }
      : {}),
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
