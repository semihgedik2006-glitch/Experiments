import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { ZielProvider } from "@/components/ziel/ziel-kontext";
import { ZielAbschnitte, ZielLeiste } from "@/components/ziel/ziel-abschnitte";
import { zielAbschnitteBauen } from "@/components/ziel/ziel-abschnitte-bauen";
import { CtaBanner } from "@/components/cta-banner";
import { StudioJsonLd, WebsiteJsonLd, FaqJsonLd, OrganisationJsonLd } from "@/components/structured-data";
import { getToggles } from "@/lib/site-toggles";
import { getStudios } from "@/lib/data";
import { beweiseHolen, kennzahlen } from "@/lib/beweise";

export default async function Home() {
  // Ausgeblendete Bereiche entfallen auch auf der Startseite - sonst
  // verlinken Teaser auf Seiten, die nicht mehr erreichbar sind.
  const toggles = await getToggles();

  // Die Kennzeichnung im Hero stand fest auf "Hürth · Köln · Brühl" - aus
  // der Zeit mit einem Standort. Bei vierzehn Studios ist das Netz selbst
  // das Argument, deshalb kommt der Text aus den Daten.
  const studios = await getStudios();
  const standorte =
    studios.length > 1
      ? `${studios.length} EMS-Studios in Köln und Umgebung`
      : studios.length === 1
        ? `EMS-Studio in ${studios[0].city}`
        : "EMS-Training in Köln und Umgebung";

  // Die Zahlen für das Band unter dem Hero - aus der eigenen Datenbank.
  const beweise = await beweiseHolen();
  const zahlen = kennzahlen(beweise);

  return (
    <ZielProvider>
      <OrganisationJsonLd />
      <StudioJsonLd />
      <WebsiteJsonLd />
      <FaqJsonLd />
      <Hero
        standorte={standorte}
        anzahlStudios={studios.length}
      />
      {/* Weniger als zwei Zahlen sind keine Aussage, sondern eine
          Behauptung - dann entfällt das Band lieber ganz. */}
      {zahlen.length >= 2 && <StatsStrip zahlen={zahlen} />}
      {/* Ab hier richtet sich die Seite nach dem Ziel: Wer oben eines
          gewählt hat, sieht die Abschnitte in der Reihenfolge, die dazu
          passt - und nur die, die dafür zählen (siehe ZIEL_INHALTE).
          "In vier Stationen" (HowItWorks) ist entfallen: Den Weg führt
          jetzt die Zielauswahl. */}
      <ZielAbschnitte
        abschnitte={zielAbschnitteBauen({
          anzahlStudios: studios.length,
          toggles,
          zeitspanne: null,
          auswahl: true,
          studioListe: true,
        })}
      />
      <ZielLeiste />
      <CtaBanner />
    </ZielProvider>
  );
}
