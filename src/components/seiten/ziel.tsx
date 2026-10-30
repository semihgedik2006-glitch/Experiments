import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BeweisLeiste } from "@/components/beweis-leiste";
import { TrustBar } from "@/components/trust-bar";
import { ZielProvider } from "@/components/ziel/ziel-kontext";
import { ZielAbschnitte } from "@/components/ziel/ziel-abschnitte";
import { zielAbschnitteBauen } from "@/components/ziel/ziel-abschnitte-bauen";
import { TerminHinweise } from "@/components/booking/termin-hinweise";
import { ZielKopf } from "@/components/ziel/ziel-kopf";
import { getToggles } from "@/lib/site-toggles";
import { getStudios } from "@/lib/data";
import { seitenBeschreibung, zielInhalt } from "@/lib/ziel-inhalte";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { BrotkrumenJsonLd, FaqJsonLd } from "@/components/structured-data";

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

/** Metadaten zu einem Ziel - `wert` ist der deutsche Wert ("ruecken"). */
export async function zielMetadaten(sprache: Sprache, wert: string | undefined): Promise<Metadata> {
  const inhalt = zielInhalt(wert, sprache);
  if (!inhalt) return {};
  const beschreibung = seitenBeschreibung(inhalt, (await getStudios()).length, sprache);
  return seitenMetadaten(sprache, `/ziel/${inhalt.wert}`, {
    title: inhalt.seite.titel,
    description: beschreibung,
  });
}

export async function ZielSeite({ sprache, wert }: { sprache: Sprache; wert: string | undefined }) {
  const inhalt = zielInhalt(wert, sprache);
  if (!inhalt) notFound();
  const en = sprache === "en";

  const [toggles, studios] = await Promise.all([getToggles(), getStudios()]);

  return (
    <>
      {/* Die häufigen Fragen stehen auch auf dieser Seite (im Abschnitt
          FAQ, nach Ziel sortiert) - deshalb auch hier als Daten. */}
      <BrotkrumenJsonLd pfad={[{ name: inhalt.kurz, href: `/ziel/${inhalt.wert}` }]} sprache={sprache} />
      <FaqJsonLd sprache={sprache} />
      <ZielProvider fest={inhalt.wert}>
        <ZielKopf inhalt={inhalt} anzahlStudios={studios.length} />
        <ZielAbschnitte
          abschnitte={zielAbschnitteBauen({
            anzahlStudios: studios.length,
            toggles,
            zeitspanne: null,
            auswahl: false,
            studioListe: false,
            sprache,
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
                {en
                  ? "Free and without obligation. Tell us when suits you – we confirm your appointment personally."
                  : "Kostenlos und unverbindlich. Such dir eine Zeit aus – wir bestätigen deinen Termin persönlich."}
              </p>
            </Reveal>
            <BeweisLeiste className="mb-10" sprache={sprache} />
            <BookingFlow studios={studios} standortErstImBild sprache={sprache} />
            <Reveal className="mt-12 border-t border-border pt-8">
              <TrustBar sprache={sprache} />
            </Reveal>
            <TerminHinweise sprache={sprache} />
          </Container>
        </section>
      </ZielProvider>
    </>
  );
}
