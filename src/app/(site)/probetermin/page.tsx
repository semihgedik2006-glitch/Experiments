import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { BookingFlow } from "@/components/booking/booking-flow";
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
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
          Kostenloser <span className="text-accent-strong">Probetermin</span>
        </h1>
        <p className="mt-4 text-muted">
          Wähle einen passenden Termin und lerne EMS-Training unverbindlich
          kennen. Wir bestätigen deinen Wunschtermin anschließend persönlich.
        </p>

        <div className="mt-10">
          <BookingFlow studios={studios} slotsByStudio={slotsByStudio} />
        </div>

        {/* Die Illustration steht bewusst unter dem Formular: Oben war sie
            das größte Element der Seite und bestimmte damit die gemessene
            Ladezeit - eine Verzierung, die das Formular ausbremst. */}
        <LottieBox
          src="/lottie/booking.json"
          ratio="1080 / 1080"
          className="mx-auto mt-12 w-full max-w-[220px]"
        />

        <div className="mt-4 border-t border-border pt-8">
          <p className="text-sm font-semibold">Was du wissen solltest</p>
          <TrustBar className="mt-5" />
        </div>
      </Container>
    </section>
  );
}
