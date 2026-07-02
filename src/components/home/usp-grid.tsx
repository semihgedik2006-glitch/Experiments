import { Clock, HeartPulse, Users, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

const items = [
  {
    icon: Clock,
    title: "Nur 20 Minuten",
    text: "Einmal pro Woche statt mehrmals im Fitnessstudio - ideal für einen vollen Terminkalender.",
  },
  {
    icon: HeartPulse,
    title: "Gelenkschonend",
    text: "Sanftes, effektives Training ohne hohe Gewichte - schonend für Rücken und Gelenke.",
  },
  {
    icon: Users,
    title: "1:1 Betreuung",
    text: "Persönliche Trainer begleiten jede Einheit individuell und passen sie an dich an.",
  },
  {
    icon: Sparkles,
    title: "Sichtbare Erfolge",
    text: "Muskelaufbau, Straffung und Gewichtsreduktion - messbar und spürbar.",
  },
];

export function UspGrid() {
  return (
    <section className="border-t border-border bg-surface py-24">
      <Container>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface-raised p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/15 text-lime">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
