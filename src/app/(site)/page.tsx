import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { UspGrid } from "@/components/home/usp-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { StudioTeaser } from "@/components/home/studio-teaser";
import { TestimonialsTeaser } from "@/components/home/testimonials-teaser";
import { TrustSection } from "@/components/trust-section";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { FaqSection } from "@/components/faq-section";
import { CtaBanner } from "@/components/cta-banner";
import { InstagramWand } from "@/components/instagram-wand";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
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
      ? `${studios.length} EMS-Studios rund um Köln`
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
  const zeitspanne =
    beweise.frueheste && beweise.spaeteste
      ? `${beweise.frueheste} bis ${beweise.spaeteste} Uhr`
      : null;

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
    <>
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
      <UspGrid standorte={studios.length} zeitspanne={zeitspanne} />
      {/* Die Trenner stehen dort, wo zwei helle Abschnitte aneinander
          stoßen - genau die Stellen, an denen die Seite beim Scrollen
          bisher stillstand. Nicht überall: Wo ohnehin ein dunkles Band
          oder eine Flächenfarbe wechselt, ist der Schnitt schon sichtbar,
          und eine Linie obendrauf wäre eine Verzierung zu viel.

          Drei verschiedene Varianten, damit die Linien nicht wie dreimal
          dasselbe Bauteil wirken und nicht im Gleichschritt blinken. */}
      <ImpulsTrenner variante="a" className="mx-auto max-w-6xl px-6" />
      <HowItWorks />
      {toggles.studio && <StudioTeaser />}
      {toggles.erfolgsgeschichten && <TestimonialsTeaser />}
      <TrustSection />
      {toggles.blog && (
        <>
          <ImpulsTrenner variante="b" className="mx-auto max-w-6xl px-6" />
          <BlogTeaser />
        </>
      )}
      {/* Instagram steht zwischen Blog und Fragen: Bis hierher hat die
          Seite erklärt und belegt - sechs Bilder aus dem Studio zeigen
          danach, wie es dort tatsächlich aussieht. */}
      <InstagramWand beitraege={instagram} />
      <ImpulsTrenner variante="c" className="mx-auto max-w-6xl px-6" />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
