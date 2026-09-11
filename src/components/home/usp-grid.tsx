"use client";

import { motion } from "motion/react";
import { Clock, HeartPulse, Users, Sparkles, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";

/**
 * Vier Karten, vier Tatsachen.
 *
 * In der vierten stand "Sichtbare Erfolge - Muskelaufbau, Straffung und
 * Gewichtsreduktion, messbar und spürbar". Das ist kein Grund, sondern
 * ein Versprechen, und zwar eines, das niemand einlösen kann: Ob jemand
 * abnimmt, hängt an seiner Ernährung, nicht an unserem Text.
 *
 * An ihrer Stelle steht jetzt das, was diese Kette tatsächlich von einem
 * einzelnen Studio unterscheidet - vierzehn Standorte. Das ist nachprüfbar
 * (die Adressen stehen weiter unten auf derselben Seite), es ist für
 * jemanden mit vollem Kalender ein echtes Argument, und die Zahl kommt
 * aus der Datenbank statt aus diesem Text.
 */
function karten(standorte: number, zeitspanne: string | null) {
  return [
    {
      icon: Clock,
      title: "Nur 20 Minuten",
      text: "Einmal pro Woche statt mehrmals im Fitnessstudio - ideal für einen vollen Terminkalender.",
    },
    {
      icon: HeartPulse,
      title: "Ohne schwere Gewichte",
      text: "Die Impulse kommen zu deiner eigenen Bewegung dazu. Dadurch ist die Belastung für Gelenke und Wirbelsäule geringer als beim Hanteltraining.",
    },
    {
      icon: Users,
      title: "Einer für dich allein",
      text: "Kein Training auf eigene Faust: Bei jeder Einheit steht ein Trainer neben dir und stellt die Intensität mit dir zusammen ein.",
    },
    standorte > 1
      ? {
          icon: MapPin,
          title: `${standorte} Studios rund um Köln`,
          text: zeitspanne
            ? `Trainier dort, wo du gerade bist - vor der Arbeit oder danach. Termine gibt es von ${zeitspanne}.`
            : "Trainier dort, wo du gerade bist - morgens neben dem Büro, abends um die Ecke.",
        }
      : {
          icon: Sparkles,
          title: "Feste Zeit, feste Person",
          text: "Dein Termin liegt jede Woche gleich, und du weißt vorher, wer dich erwartet.",
        },
  ];
}

export function UspGrid({
  standorte,
  zeitspanne,
}: {
  standorte: number;
  /** "07:00 bis 21:00 Uhr", sofern aus den Terminen ableitbar. */
  zeitspanne: string | null;
}) {
  const items = karten(standorte, zeitspanne);

  return (
    // Das Streufeld liegt hinter den Karten. Anordnung "rand": Die Karten
    // reichen hier bis in die Mitte, dort wäre ein Punkt entweder verdeckt
    // oder störend.
    <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
      <ImpulsStreu anordnung="rand" />
      <Container className="relative">
        <SectionHeader
          kicker="Warum EMS"
          title="Vier Gründe, warum es funktioniert"
          intro="Kurze Einheiten, echte Betreuung und ein Netz aus Studios, das sich deinem Tag anpasst statt umgekehrt."
          className="mb-16"
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="karte-hebt h-full card p-7"
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
