import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { FaqSection } from "@/components/faq-section";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "Individuelle Preise für EMS-Training bei Körperformen - wir besprechen dein Paket persönlich im kostenlosen Probetermin.",
};

const highlights = [
  "1x oder 2x EMS-Training pro Woche - passend zu deinem Ziel",
  "Individueller Trainingsplan statt Standardpaket",
  "Persönliche Betreuung durch dein Trainer-Team",
  "Ernährungsberatung nach Bedarf",
  "Monatlich flexibel, ohne versteckte Kosten",
];

export default function PreisePage() {
  return (
    <>
      <PageHeader
        kicker="Konditionen"
        title={<>Faire <span className="text-lime">Preise</span></>}
        intro="Jedes Trainingsziel ist anders - deshalb besprechen wir dein persönliches Paket direkt bei deinem kostenlosen Probetermin. So zahlst du nur für das, was wirklich zu dir passt."
      />

      <section className="py-28 md:py-32">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight">Das ist immer inklusive</h2>
              <ul className="mt-6 space-y-4">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check size={18} className="mt-0.5 shrink-0 text-lime" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="rounded-2xl border border-lime bg-surface p-8 text-center">
              <h3 className="text-xl font-semibold">Dein persönliches Angebot</h3>
              <p className="mt-3 text-sm text-muted">
                In einem unverbindlichen Probetermin lernst du das Studio kennen
                und bekommst ein Preisangebot, das zu deinen Zielen und deinem
                Budget passt.
              </p>
              <Button href="/probetermin" className="mt-6 w-full">
                Kostenlosen Probetermin buchen
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      <FaqSection />
    </>
  );
}
