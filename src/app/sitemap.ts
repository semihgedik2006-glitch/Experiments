import type { MetadataRoute } from "next";
import { getPublishedPosts, getStudios } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";
import { erfolgeVorhanden } from "@/lib/kundenstimmen";
import { ZIEL_INHALTE } from "@/lib/ziel-inhalte";
import { FRAGEN } from "@/lib/fragen";
import { nachEn } from "@/lib/i18n/pfade";

type Eintrag = { route: string; lastModified?: Date; priority?: number };

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
    "/erster-besuch",
    ...(toggles.studio ? ["/studio"] : []),
    ...(toggles.preise ? ["/preise"] : []),
    // Nur wenn die Seite auch Inhalt hat - sonst meldet die Sitemap
    // Google eine Adresse, die mit 404 antwortet.
    ...(toggles.erfolgsgeschichten && erfolge ? ["/erfolgsgeschichten"] : []),
    ...(toggles["ueber-uns"] ? ["/ueber-uns"] : []),
    "/probetermin",
    "/ziel-check",
    // Erst, wenn die Gutscheine im Adminbereich eingeschaltet sind.
    ...(toggles.gutschein ? ["/gutschein"] : []),
    // Der Einstieg in den eigenen Terminbereich. Nur das Formular - die
    // Seite dahinter ist von der Indizierung ausgenommen. Sie gehört
    // hierher, weil sie im Menü absichtlich nicht auftaucht und sonst
    // nur über den Fußbereich zu finden wäre.
    "/meine-termine",
    ...(toggles.blog ? ["/blog"] : []),
    "/socials",
    "/kontakt",
    "/agb",
    "/impressum",
    "/datenschutz",
  ].map((route): Eintrag => ({ route, lastModified: new Date() }));

  const postRoutes = (toggles.blog ? posts : []).map(
    (post): Eintrag => ({ route: `/blog/${post.slug}`, lastModified: post.updatedAt }),
  );

  // Die vierzehn Standortseiten. Sie sind der Grund, warum jemand nach
  // "EMS Training Rösrath" bei uns landen kann - sie gehören deshalb
  // ausdrücklich gemeldet und nicht darauf verlassen, dass Google sie über
  // die Übersicht findet. Höhere Priorität als der Rest: Auf sie zielt die
  // örtliche Suche.
  const studioRoutes = (toggles.studio ? studios : []).map((studio): Eintrag => ({
    route: `/studio/${studio.slug}`,
    lastModified: studio.updatedAt,
    priority: 0.8,
  }));

  // Die Zielseiten (/ziel/ruecken, ...): Auf sie zielen Suchen wie "EMS
  // Rücken Köln" - deshalb wie die Standortseiten ausdrücklich gemeldet.
  // Ohne lastModified: Die Seiten ändern sich nur mit einer neuen Fassung
  // der Website, und ein bei jedem Abruf neues Datum wäre falsch.
  const zielRoutes = ZIEL_INHALTE.map((ziel): Eintrag => ({
    route: `/ziel/${ziel.wert}`,
    priority: 0.8,
  }));

  // Die Fragen-Seiten (@/lib/fragen) samt Übersicht - aus demselben Grund.
  const fragenRoutes = ["/fragen", ...FRAGEN.map((f) => `/fragen/${f.slug}`)].map(
    (route): Eintrag => ({ route, priority: 0.7 }),
  );

  // Jede Seite gibt es zweimal: deutsch und englisch (/en/...). Beide
  // Adressen werden gemeldet, und beide tragen denselben Verweis auf die
  // jeweils andere. Ohne diese Angabe hält Google sie für zwei Seiten über
  // dasselbe Thema und wertet eine davon ab. Wer keine der beiden
  // Sprachen ausdrücklich verlangt, bekommt die deutsche (x-default).
  const eintraege = [...staticRoutes, ...zielRoutes, ...fragenRoutes, ...studioRoutes, ...postRoutes];
  return eintraege.flatMap(({ route, ...rest }) => {
    const de = `${siteConfig.url}${route}`;
    const en = `${siteConfig.url}${nachEn(route || "/")}`;
    const alternates = { languages: { de, en, "x-default": de } };
    return [
      { url: de, ...rest, alternates },
      { url: en, ...rest, alternates },
    ];
  });
}
