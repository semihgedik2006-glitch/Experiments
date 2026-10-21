import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { ZielProvider } from "@/components/ziel/ziel-kontext";
import { ZielAbschnitte, ZielLeiste } from "@/components/ziel/ziel-abschnitte";
import { zielAbschnitteBauen, zeitspanneAus } from "@/components/ziel/ziel-abschnitte-bauen";
import { CtaBanner } from "@/components/cta-banner";
import { InstagramWand } from "@/components/instagram-wand";
import { StudioJsonLd, WebsiteJsonLd, FaqJsonLd } from "@/components/structured-data";
import { getToggles } from "@/lib/site-toggles";
import { getStudios, getUpcomingSlots } from "@/lib/data";
import { letzteBeitraege } from "@/lib/instagram";
import { formatDateShort } from "@/lib/format";
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

  // Der nächste tatsächlich freie Termin. Er steht im Hero und macht aus
  // einem Versprechen eine Verabredung: "Donnerstag um 9" ist etwas
  // anderes als "jetzt Termin sichern".
  //
  // Bewusst aus den echten Daten und nicht aus einem festen Text: Steht
  // dort ein Termin, den es nicht gibt, ist das Vertrauen beim ersten
  // Klick weg. Gibt es keinen, entfällt die Zeile ersatzlos.
  // Die Instagram-Wand. Ist kein Zugang hinterlegt oder Instagram gerade
  // nicht erreichbar, kommt eine leere Liste zurück und der Abschnitt
  // entfällt - die Startseite hängt nie an einem fremden Dienst.
  const instagram = toggles.instagram ? await letzteBeitraege() : [];

  // Die Zahlen für das Band unter dem Hero: Dauer einer Einheit,
  // Standorte, freie Termine der nächsten sieben Tage - alles aus der
  // eigenen Datenbank statt aus fremden Prospekten.
  const beweise = await beweiseHolen();
  const zahlen = kennzahlen(beweise);
  // "07:00 bis 21:00 Uhr" - abgeleitet aus den tatsächlich angelegten
  // Terminen. Gibt es keine, entfällt der Halbsatz.
  const zeitspanne = zeitspanneAus(beweise.frueheste, beweise.spaeteste);

  const naechsteSlots = toggles.studio ? await getUpcomingSlots() : [];
  const naechster = naechsteSlots[0];
  const naechsterTermin = naechster
    ? {
        label: `${formatDateShort(naechster.date)} um ${naechster.startTime} Uhr`,
        studio: studios.find((s) => s.id === naechster.studioId)?.name ?? "",
        href: "/probetermin",
        freieDieseWoche: beweise.freieTermine7Tage,
      }
    : null;

  return (
    <ZielProvider>
      <StudioJsonLd />
      <WebsiteJsonLd />
      <FaqJsonLd />
      <Hero
        standorte={standorte}
        anzahlStudios={studios.length}
        naechsterTermin={naechsterTermin}
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
          zeitspanne,
          auswahl: true,
          // Instagram zeigt, wie es im Studio aussieht - ohne gewähltes
          // Ziel zwischen Blog und Fragen.
          instagram: <InstagramWand beitraege={instagram} />,
          studioListe: true,
        })}
      />
      <ZielLeiste />
      <CtaBanner />
    </ZielProvider>
  );
}
