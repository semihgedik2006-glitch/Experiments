import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BeweisLeiste } from "@/components/beweis-leiste";
import { TrustBar } from "@/components/trust-bar";
import { ZielProvider } from "@/components/ziel/ziel-kontext";
import { ZielAbschnitte } from "@/components/ziel/ziel-abschnitte";
import { zielAbschnitteBauen, zeitspanneAus } from "@/components/ziel/ziel-abschnitte-bauen";
import { TerminHinweise } from "@/components/booking/termin-hinweise";
import { ZielKopf } from "@/components/ziel/ziel-kopf";
import { getToggles } from "@/lib/site-toggles";
import { getSlotsMitBelegung, getStudios } from "@/lib/data";
import { tageJeStudio } from "@/lib/termin-tage";
import { beweiseHolen } from "@/lib/beweise";
import { siteConfig } from "@/lib/site-config";
import { ZIEL_INHALTE, seitenBeschreibung, zielInhalt } from "@/lib/ziel-inhalte";

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
  const beschreibung = seitenBeschreibung(inhalt, (await getStudios()).length);
  return {
    title: inhalt.seite.titel,
    description: beschreibung,
    alternates: { canonical: `/ziel/${inhalt.wert}` },
    openGraph: {
      title: `${inhalt.seite.titel} | ${siteConfig.name}`,
      description: beschreibung,
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

  return (
    <ZielProvider fest={inhalt.wert}>
      <ZielKopf inhalt={inhalt} anzahlStudios={studios.length} />
      <ZielAbschnitte
        abschnitte={zielAbschnitteBauen({
          anzahlStudios: studios.length,
          toggles,
          zeitspanne: zeitspanneAus(beweise.frueheste, beweise.spaeteste),
          auswahl: false,
          instagram: null,
          studioListe: false,
        })}
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
          <BookingFlow studios={studios} slotsByStudio={slotsByStudio} standortErstImBild />
          <Reveal className="mt-12 border-t border-border pt-8">
            <TrustBar />
          </Reveal>
          <TerminHinweise />
        </Container>
      </section>
    </ZielProvider>
  );
}
