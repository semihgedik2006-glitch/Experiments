import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing-data";

export function PricingTeaser() {
  return (
    <section className="border-t border-border bg-surface py-24">
      <Container>
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Deine Mitgliedschaft</h2>
          <p className="mt-4 text-muted">
            Transparente Pakete ohne versteckte Kosten. Alle Preise verstehen sich pro Monat.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-lime bg-surface-raised"
                  : "border-border bg-surface-raised"
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <p className="mt-6 text-4xl font-black">
                {plan.price}€<span className="text-base font-normal text-muted"> /{plan.period}</span>
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

        <p className="mt-8 text-center text-sm text-muted">
          Alle Preise sind Richtwerte -{" "}
          <a href="/preise" className="text-lime hover:underline">
            vollständige Preisübersicht ansehen
          </a>
          .
        </p>
      </Container>
    </section>
  );
}
