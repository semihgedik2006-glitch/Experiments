import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorGlow } from "@/components/cursor-glow";
import { Lesefortschritt } from "@/components/ui/lesefortschritt";
import { mainNav } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";
import { erfolgeVorhanden } from "@/lib/kundenstimmen";
import { getStudios, getUpcomingSlots } from "@/lib/data";
import { beweiseHolen } from "@/lib/beweise";
import { formatDateShort } from "@/lib/format";
import { ProbeterminEinladung } from "@/components/probetermin-einladung";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const toggles = await getToggles();

  // Ausgeblendete Bereiche verschwinden aus dem Menü - oben wie unten.
  // Einträge ohne eigenen Schalter (Startseite, EMS-Training, Kontakt)
  // bleiben immer sichtbar.
  // Die Erfolgsseite hängt zusätzlich am Inhalt: Ohne freigegebene
  // Kundenstimme und ohne Bildpaar besteht sie nur aus ihrer eigenen
  // Ankündigung. Siehe erfolgeVorhanden().
  const zeigeErfolge = toggles.erfolgsgeschichten && (await erfolgeVorhanden());

  const nav = mainNav.filter((item) => {
    const key = item.href.replace(/^\//, "");
    if (key === "erfolgsgeschichten") return zeigeErfolge;
    return !(key in toggles) || toggles[key as keyof typeof toggles];
  });

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
  const studioLabel = studios.length > 1 ? `${studios.length} Studios` : undefined;

  /*
   * Die Daten für die Einladung zum Probetraining.
   *
   * Sie liegen im Layout und nicht in der Einladung selbst: Die ist eine
   * Komponente im Browser und käme an die Datenbank gar nicht heran.
   *
   * Beide Abfragen fangen ab. Eine Einladung ist Beiwerk - dass die
   * gesamte Website ausfällt, weil eine Zusatzangabe darin nicht zu holen
   * war, wäre ein schlechter Tausch. Ohne Termin erscheint sie trotzdem,
   * nur ohne die Zeile mit dem Datum.
   */
  const [naechsteSlots, beweise] = await Promise.all([
    toggles.studio ? getUpcomingSlots().catch(() => []) : Promise.resolve([]),
    beweiseHolen(),
  ]);
  const naechster = naechsteSlots[0];
  const einladungTermin = naechster
    ? [
        `${formatDateShort(naechster.date)} um ${naechster.startTime} Uhr`,
        studios.find((s) => s.id === naechster.studioId)?.name,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-lime focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-lime"
      >
        Zum Inhalt springen
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
      <Footer nav={nav} showNewsletter={toggles.newsletter} />

      {/* Wann sie erscheinen darf, entscheidet sie selbst - die Regeln
          stehen in lib/einladung.ts. Hier steht sie nur bereit. */}
      <ProbeterminEinladung
        naechsterTermin={einladungTermin}
        freieDieseWoche={beweise.freieTermine7Tage}
      />
    </>
  );
}
