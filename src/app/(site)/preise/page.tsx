import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing-data";
import { Faq } from "@/components/faq";

export const metadata: Metadata = {
  title: "Preise",
  description: "Transparente Preise für EMS-Training bei Körperformen - ohne versteckte Kosten.",
};

export default function PreisePage() {
  return (
    <>
      <section className="border-b border-border py-20">
        <Container>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Faire <span className="text-lime">Preise</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Wähle das Paket, das zu deinen Zielen passt. Alle Mitgliedschaften
            sind monatlich kündbar, sofern nicht anders vereinbart.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted ? "border-lime bg-surface" : "border-border bg-surface"
                }`}
              >
                {plan.highlighted && (
                  <span className="mb-4 w-fit rounded-full bg-lime px-3 py-1 text-xs font-semibold text-[#0d0d0f]">
                    Beliebt
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>
                <p className="mt-6 text-4xl font-black">
                  {plan.price}€
                  <span className="text-base font-normal text-muted"> /{plan.period}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="mt-0.5 shrink-0 text-lime" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  href="/probetermin"
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  Jetzt starten
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-muted">
            Alle Preise verstehen sich inkl. MwSt. Individuelle Konditionen und
            Studiobesichtigung gerne bei deinem Probetermin.
          </p>
        </Container>
      </section>

      <Faq />
    </>
  );
}
