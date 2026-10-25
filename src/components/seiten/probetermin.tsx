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
import { getStudios } from "@/lib/data";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import type { Sprache } from "@/lib/sprache";

export function probeterminMetadaten(sprache: Sprache): Metadata {
  // Kanonische Adresse: Sonst kann Google dieselbe Seite unter mehreren
  // Adressen als mehrere Seiten werten und die Bewertung aufteilen.
  return seitenMetadaten(
    sprache,
    "/probetermin",
    sprache === "en"
      ? {
          title: "Book a trial session",
          description: "Book your free, no-obligation EMS trial session at Körperformen in and around Cologne.",
        }
      : {
          title: "Probetermin buchen",
          description: "Sichere dir deinen kostenlosen und unverbindlichen EMS-Probetermin bei Körperformen.",
        },
  );
}

export async function ProbeterminSeite({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  // Auch belegte Termine: Sie werden im Formular als belegt angezeigt und
  // führen auf die Warteliste, statt gar nicht erst zu erscheinen.
  const studios = await getStudios();

  return (
    <>
      {/* Derselbe Seitenkopf wie überall. Vorher begann diese Seite mit
          einer nackten Überschrift mitten auf weißem Grund - ausgerechnet
          die Seite, auf der die Anfrage entsteht, sah damit am
          unfertigsten aus. */}
      <PageHeader
        kicker={en ? "Free and no strings attached" : "Kostenlos und unverbindlich"}
        title={
          en ? (
            <>
              Your <span className="text-accent-strong">trial session</span>
            </>
          ) : (
            <>
              Dein <span className="text-accent-strong">Probetermin</span>
            </>
          )
        }
        // "ohne Vertrag, ohne Haken" - "ohne Haken" sagt nichts und klingt,
        // als gäbe es welche. Was gilt, steht unter dem Formular.
        intro={
          en
            ? "Tell us when suits you. We confirm your appointment personally."
            : "Such dir eine Zeit aus. Wir bestätigen deinen Wunschtermin persönlich."
        }
      />

      <section className="py-16 sm:py-20 md:py-24">
        <Container className="max-w-2xl">
          {/* Über dem Formular und nicht darunter: Wer hier ankommt, hat
              sich schon entschieden hinzusehen - jetzt zählt, dass diese
              Woche tatsächlich etwas frei ist. */}
          <AuszeichnungMarke className="mb-4" />
          <BeweisLeiste className="mb-10" sprache={sprache} />

          <Reveal>
            <BookingFlow studios={studios} sprache={sprache} />
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
            <p className="text-sm font-semibold">{en ? "Good to know" : "Was du wissen solltest"}</p>
            <TrustBar className="mt-5" sprache={sprache} />
          </Reveal>

          <TerminHinweise sprache={sprache} />
        </Container>
      </section>
    </>
  );
}
