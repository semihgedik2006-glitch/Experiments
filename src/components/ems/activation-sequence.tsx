import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

const steps = [
  {
    step: "01",
    heading: "Nacken & Schultern",
    text: "Die Impulse lösen zuerst Verspannungen in Schultern und Nacken - typische Problemzonen bei Bürojobs.",
  },
  {
    step: "02",
    heading: "Brust & Rücken",
    text: "Bis zu 90% der Muskelfasern werden gleichzeitig aktiviert - deutlich mehr als beim klassischen Training.",
  },
  {
    step: "03",
    heading: "Bauch & Rumpf",
    text: "Die tiefliegende Rumpfmuskulatur wird mittrainiert - für einen stabilen Kern und einen strafferen Bauch.",
  },
  {
    step: "04",
    heading: "Voll aktiviert",
    text: "20 Minuten EMS wirken so intensiv wie mehrere Stunden klassisches Krafttraining - einmal pro Woche reicht.",
  },
];

export function ActivationSequence() {
  return (
    <section className="border-t border-border py-24">
      <Container>
        <Reveal className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            Im Training
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Was dabei in deinem Körper passiert
          </h2>
          <p className="mt-4 text-muted">
            Die Weste aktiviert deine Muskelgruppen nacheinander - von oben nach
            unten, bis der ganze Körper arbeitet.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {steps.map((item) => (
            <StaggerItem key={item.step}>
              <div className="border-t border-border pt-6">
                <span className="text-sm font-bold tracking-widest text-lime">
                  {item.step}
                </span>
                <h3 className="mt-3 text-xl font-bold tracking-tight">{item.heading}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-14">
          <Button href="/probetermin">Jetzt Probetermin buchen</Button>
        </Reveal>
      </Container>
    </section>
  );
}
