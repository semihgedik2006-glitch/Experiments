"use client";

import { motion } from "motion/react";
import { Clock, HeartPulse, Users, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";

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
    <section className="py-20 sm:py-24 md:py-32">
      <Container>
        <SectionHeader
          kicker="Warum EMS"
          title="Vier Gründe, warum es funktioniert"
          intro="Kurze Einheiten, echte Betreuung und ein Training, das auch die Muskeln erreicht, an die du sonst nicht rankommst."
          className="mb-16"
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full card p-7 transition-colors hover:border-lime/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/10 text-accent">
                  <Icon size={20} />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
