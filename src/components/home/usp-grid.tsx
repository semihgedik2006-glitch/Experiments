"use client";

import { motion } from "framer-motion";
import { Clock, HeartPulse, Users, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";

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
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <motion.div
                whileHover={{ y: -10, scale: 1.04 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full rounded-2xl border border-border bg-surface-raised p-6 shadow-sm transition-shadow hover:shadow-2xl hover:shadow-lime/10"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/15 text-lime"
                >
                  <Icon size={20} />
                </motion.div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
