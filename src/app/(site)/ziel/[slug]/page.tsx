import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BeweisLeiste } from "@/components/beweis-leiste";
import { TrustBar } from "@/components/trust-bar";
import { ZielWelt } from "@/components/home/ziel-welt";
import { Individuell } from "@/components/home/individuell";
import { ZeitProblem } from "@/components/home/zeit-problem";
import { UspGrid } from "@/components/home/usp-grid";
import { Netzwerk } from "@/components/home/netzwerk";
import { TestimonialsTeaser } from "@/components/home/testimonials-teaser";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { TrustSection } from "@/components/trust-section";
import { FaqSection } from "@/components/faq-section";
import { ZielProvider } from "@/components/ziel/ziel-kontext";
import { ZielAbschnitte } from "@/components/ziel/ziel-abschnitte";
import { ZielKopf } from "@/components/ziel/ziel-kopf";
import { getToggles } from "@/lib/site-toggles";
import { getSlotsMitBelegung, getStudios } from "@/lib/data";
import { tageJeStudio } from "@/lib/termin-tage";
import { beweiseHolen } from "@/lib/beweise";
import { siteConfig } from "@/lib/site-config";
import { ZIEL_INHALTE, zielInhalt } from "@/lib/ziel-inhalte";

/**
 * Eine eigene Seite je Ziel: /ziel/ruecken, /ziel/abnehmen, ...
 *
 * Wofür: Gesucht wird "EMS Rücken Köln" oder "mit EMS abnehmen", nicht
 * "EMS". Und eine Anzeige zum Thema Rücken soll auf einer Seite landen,
 * die vom ersten Wort an über den Rücken spricht - nicht auf der
 * Startseite, wo man das Ziel erst wählen muss.
 *
 * Die Seite ist die Startseite im Ziel-Modus, nur ohne Auswahl: Das Ziel
 * steht fest (ZielProvider fest=...), die Abschnitte kommen in der
 * Reihenfolge dieses Ziels, und das Formular steht direkt auf der Seite,
 * mit dem Ziel schon angekreuzt. Abschnitte, die auf jeder Seite gleich
 * wären (Studioliste, Instagram), fehlen - sie sind einen Klick entfernt.
 */

export function generateStaticParams() {
  return ZIEL_INHALTE.map((z) => ({ slug: z.wert }));
}

// Nur die fünf Ziele - alles andere ist eine falsche Adresse.
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const inhalt = zielInhalt(slug);
  if (!inhalt) return {};
  return {
    title: inhalt.seite.titel,
    description: inhalt.seite.beschreibung,
    alternates: { canonical: `/ziel/${inhalt.wert}` },
    openGraph: {
      title: `${inhalt.seite.titel} | ${siteConfig.name}`,
      description: inhalt.seite.beschreibung,
      url: `${siteConfig.url}/ziel/${inhalt.wert}`,
    },
  };
}

export default async function ZielSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inhalt = zielInhalt(slug);
  if (!inhalt) notFound();

  const [toggles, studios, slots, beweise] = await Promise.all([
    getToggles(),
    getStudios(),
    getSlotsMitBelegung(),
    beweiseHolen(),
  ]);
  const slotsByStudio = tageJeStudio(slots);
  const zeitspanne =
    beweise.frueheste && beweise.spaeteste ? `${beweise.frueheste} bis ${beweise.spaeteste} Uhr` : null;

  return (
    <ZielProvider fest={inhalt.wert}>
      <ZielKopf inhalt={inhalt} anzahlStudios={studios.length} />
      <ZielAbschnitte
        abschnitte={{
          zielwelt: <ZielWelt auswahl={false} />,
          individuell: <Individuell />,
          zeit: <ZeitProblem />,
          vorteile: <UspGrid standorte={studios.length} zeitspanne={zeitspanne} />,
          netzwerk:
            studios.length > 0 ? (
              <Netzwerk gesamt={siteConfig.netzwerk.studiosGesamt} eigene={studios.length} />
            ) : null,
          erfolge: toggles.erfolgsgeschichten ? <TestimonialsTeaser /> : null,
          vertrauen: <TrustSection />,
          blog: toggles.blog ? <BlogTeaser /> : null,
          faq: (
            <>
              <ImpulsTrenner variante="c" className="mx-auto max-w-6xl px-6" />
              <FaqSection />
            </>
          ),
        }}
      />

      {/* Das Formular steht auf der Seite selbst: Wer über eine Anzeige
          kommt, soll nicht noch einmal klicken müssen. Das Ziel ist darin
          schon angekreuzt. */}
      <section id="termin" className="scroll-mt-20 border-t border-border bg-surface py-20 sm:py-24 md:py-32">
        <Container className="max-w-2xl">
          <Reveal className="mb-10">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{inhalt.knopf}</h2>
            <p className="mt-4 text-lg text-muted">
              Kostenlos und unverbindlich. Such dir eine Zeit aus – wir bestätigen deinen Termin
              persönlich.
            </p>
          </Reveal>
          <BeweisLeiste className="mb-10" />
          <BookingFlow studios={studios} slotsByStudio={slotsByStudio} />
          <Reveal className="mt-12 border-t border-border pt-8">
            <TrustBar />
          </Reveal>
        </Container>
      </section>
    </ZielProvider>
  );
}
