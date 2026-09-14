import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BeweisLeiste } from "@/components/beweis-leiste";
import { LottieBox } from "@/components/lottie-box";
import { TrustBar } from "@/components/trust-bar";
import { MehrDazu } from "@/components/ui/mehr-dazu";
import { ABLAUF_EINHEIT, GEGENANZEIGEN } from "@/lib/ablauf";
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

          {/* Zwei Auskünfte, die bisher nur auf /ems-training standen -
              also eine Seite weiter, als sie gebraucht werden. Wer einen
              Herzschrittmacher trägt, soll das vor dem Absenden lesen und
              nicht danach. Aufgeklappt statt ausgeschrieben, damit die
              Seite nicht länger wird als das Formular darauf. */}
          <div className="mt-8 space-y-2">
            <MehrDazu titel="Was beim ersten Termin passiert">
              <ol className="space-y-2">
                {ABLAUF_EINHEIT.map((schritt) => (
                  <li key={schritt.step}>
                    <span className="font-semibold text-foreground">{schritt.step}</span>
                    <span className="text-muted"> · {schritt.duration}</span>
                    <br />
                    {schritt.text}
                  </li>
                ))}
              </ol>
            </MehrDazu>

            <MehrDazu titel="Wann EMS nicht geeignet ist">
              <p>
                In diesen Fällen verzichten wir grundsätzlich auf EMS-Training:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {GEGENANZEIGEN.map((fall) => (
                  <li key={fall}>{fall}</li>
                ))}
              </ul>
              <p>
                Wir fragen das hier bewusst nicht ab &ndash; Angaben zu deiner
                Gesundheit gehören nicht in ein Formular im Netz. Besprich es beim
                Termin oder ruf vorher an; im Zweifel sprich kurz mit deinem Arzt.
              </p>
            </MehrDazu>
          </div>
        </Container>
      </section>
    </>
  );
}
