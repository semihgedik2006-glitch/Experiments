import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { BookingFlow } from "@/components/booking/booking-flow";
import { TerminHinweise } from "@/components/booking/termin-hinweise";
import { BeweisLeiste } from "@/components/beweis-leiste";
import { AuszeichnungMarke } from "@/components/auszeichnung/auszeichnung";
import { LottieBox } from "@/components/lottie-box";
import { TrustBar } from "@/components/trust-bar";
import { getStudios, getSlotsMitBelegung } from "@/lib/data";
import { tageJeStudio } from "@/lib/termin-tage";

export const metadata: Metadata = {
  // Kanonische Adresse: Sonst kann Google dieselbe Seite unter mehreren
  // Adressen als mehrere Seiten werten und die Bewertung aufteilen.
  alternates: { canonical: "/probetermin" },
  title: "Probetermin buchen",
  description: "Sichere dir deinen kostenlosen und unverbindlichen EMS-Probetermin bei Körperformen.",
};

export default async function ProbeterminPage() {
  // Auch belegte Termine: Sie werden im Formular als belegt angezeigt und
  // führen auf die Warteliste, statt gar nicht erst zu erscheinen.
  const [studios, slots] = await Promise.all([getStudios(), getSlotsMitBelegung()]);

  const slotsByStudio = tageJeStudio(slots);

  return (
    <>
      {/* Derselbe Seitenkopf wie überall. Vorher begann diese Seite mit
          einer nackten Überschrift mitten auf weißem Grund - ausgerechnet
          die Seite, auf der die Anfrage entsteht, sah damit am
          unfertigsten aus. */}
      <PageHeader
        kicker="Kostenlos und unverbindlich"
        title={
          <>
            Dein <span className="text-accent-strong">Probetermin</span>
          </>
        }
        // "ohne Vertrag, ohne Haken" - "ohne Haken" sagt nichts und klingt,
        // als gäbe es welche. Was gilt, steht unter dem Formular.
        intro="Such dir eine Zeit aus. Wir bestätigen deinen Wunschtermin persönlich."
      />

      <section className="py-16 sm:py-20 md:py-24">
        <Container className="max-w-2xl">
          {/* Über dem Formular und nicht darunter: Wer hier ankommt, hat
              sich schon entschieden hinzusehen - jetzt zählt, dass diese
              Woche tatsächlich etwas frei ist. */}
          <AuszeichnungMarke className="mb-4" />
          <BeweisLeiste className="mb-10" />

          <Reveal>
            <BookingFlow studios={studios} slotsByStudio={slotsByStudio} />
          </Reveal>

          {/* Die Illustration steht bewusst unter dem Formular: Oben war sie
              das größte Element der Seite und bestimmte damit die gemessene
              Ladezeit - eine Verzierung, die das Formular ausbremst. */}
          <LottieBox
            src="/lottie/booking.json"
            ratio="1080 / 1080"
            className="mx-auto mt-12 w-full max-w-[220px]"
          />

          <Reveal className="mt-4 border-t border-border pt-8">
            <p className="text-sm font-semibold">Was du wissen solltest</p>
            <TrustBar className="mt-5" />
          </Reveal>

          <TerminHinweise />
        </Container>
      </section>
    </>
  );
}
