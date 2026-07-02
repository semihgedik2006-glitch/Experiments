import { Container } from "@/components/ui/container";

const steps = [
  {
    step: "01",
    title: "Kostenloses Probetraining",
    text: "Du lernst das Studio, dein Trainer-Team und die EMS-Technologie in einer unverbindlichen Einheit kennen.",
  },
  {
    step: "02",
    title: "Individueller Trainingsplan",
    text: "Gemeinsam legen wir deine Ziele fest - Abnehmen, Muskelaufbau oder Rückengesundheit.",
  },
  {
    step: "03",
    title: "20 Minuten, einmal pro Woche",
    text: "Ein kurzes, intensives Training reicht für spürbare Ergebnisse - ganz ohne großen Zeitaufwand.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <Container>
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            So einfach startest du mit EMS
          </h2>
          <p className="mt-4 text-muted">
            Elektro-Muskel-Stimulation aktiviert bis zu 90% deiner Muskelfasern
            gleichzeitig - deutlich mehr als klassisches Training.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {steps.map(({ step, title, text }) => (
            <div key={step}>
              <span className="text-5xl font-black text-lime">{step}</span>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
