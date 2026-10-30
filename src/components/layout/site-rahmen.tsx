import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorGlow } from "@/components/cursor-glow";
import { Lesefortschritt } from "@/components/ui/lesefortschritt";
import { mainNav } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";
import { erfolgeVorhanden } from "@/lib/kundenstimmen";
import { getStudios } from "@/lib/data";
import { ProbeterminEinladung } from "@/components/probetermin-einladung";
import { HandyLeiste } from "@/components/handy-leiste";
import { KlickImpuls } from "@/components/klick-impuls";
import { pfad } from "@/lib/i18n/pfade";
import type { Sprache } from "@/lib/sprache";

/**
 * Kopf, Fuß und alles, was auf jeder Seite liegt - für beide Sprachen.
 *
 * Die deutsche und die englische Fassung teilen sich diesen Rahmen: dieselbe
 * Navigation, dieselben Einladungen, dieselbe Handy-Leiste. Zwei getrennte
 * Rahmen wären zwei Stellen, an denen eine Änderung vergessen wird - die
 * englische Seite war bis Oktober 2026 eine einzelne Seite mit eigenem,
 * kleinerem Rahmen.
 */
export async function SiteRahmen({
  sprache,
  children,
}: {
  sprache: Sprache;
  children: React.ReactNode;
}) {
  const toggles = await getToggles();

  // Ausgeblendete Bereiche verschwinden aus dem Menü - oben wie unten.
  // Einträge ohne eigenen Schalter (Startseite, EMS-Training, Kontakt)
  // bleiben immer sichtbar.
  // Die Erfolgsseite hängt zusätzlich am Inhalt: Ohne freigegebene
  // Kundenstimme und ohne Bildpaar besteht sie nur aus ihrer eigenen
  // Ankündigung. Siehe erfolgeVorhanden().
  const zeigeErfolge = toggles.erfolgsgeschichten && (await erfolgeVorhanden());

  const nav = mainNav
    .filter((item) => {
      const key = item.href.replace(/^\//, "");
      if (key === "erfolgsgeschichten") return zeigeErfolge;
      return !(key in toggles) || toggles[key as keyof typeof toggles];
    })
    .map((item) => ({
      label: sprache === "en" ? item.labelEn : item.label,
      href: pfad(sprache, item.href),
      nurUnten: "nurUnten" in item ? item.nurUnten : undefined,
    }));

  // Nur zeigen, wenn die Studio-Seite sichtbar ist und es etwas zu wählen
  // gibt - bei einem einzigen Standort führt der Knopf ins Leere.
  //
  // Der try/catch ist nicht kosmetisch: Ein Layout liegt über jeder Seite,
  // und error.tsx fängt ausdrücklich nicht das Layout neben sich ab.
  // Wirft diese eine Abfrage, ist damit die komplette Seite weg - statt
  // nur des Knopfes, für den die Zahl gebraucht wird. Nachgestellt, indem
  // die Datenbank angehalten wurde: Vorher lieferten /blog, die Seite mit
  // den eigenen Terminen und alle vierzehn Standortseiten eine weiße
  // Seite ohne ein Wort Text.
  const studios = toggles.studio ? await getStudios().catch(() => []) : [];
  const studioLabel =
    studios.length > 1 ? `${studios.length} ${sprache === "en" ? "studios" : "Studios"}` : undefined;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-lime focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-lime"
      >
        {sprache === "en" ? "Skip to content" : "Zum Inhalt springen"}
      </a>
      <CursorGlow />
      {/* Der Balken liegt über der Kopfzeile und bleibt beim Scrollen
          sichtbar - er ist die einzige Anzeige dafür, wie viel Seite noch
          kommt. */}
      <Lesefortschritt />
      <Header nav={nav} studioLabel={studioLabel} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer nav={nav} showNewsletter={toggles.newsletter} sprache={sprache} />

      {/* Wann sie erscheinen darf, entscheidet sie selbst - die Regeln
          stehen in lib/einladung.ts. Hier steht sie nur bereit. */}
      {/* Auf dem Handy: Probetraining und Anrufen immer im Daumenbereich. */}
      <HandyLeiste />
      <KlickImpuls />
      <ProbeterminEinladung studios={studios.map((s) => ({ id: s.id, name: s.name }))} />
    </>
  );
}
