"use client";

import { motion } from "motion/react";
import { Clock, ClipboardList, Gift, HeartPulse, Layers, MapPin, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";

/**
 * Acht Karten, acht Tatsachen. (Vorher vier - zu wenig, um zu zeigen,
 * was das Training ausmacht; vor allem fehlte, dass es auf jeden einzeln
 * eingestellt wird.)
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
      text: "Einmal pro Woche, fester Termin - passt auch in einen vollen Kalender.",
    },
    {
      icon: ClipboardList,
      title: "Dein eigener Plan",
      text: "Kein Standardpaket: Dein Trainer stellt das Training auf dein Ziel und deinen Körper ein.",
    },
    {
      icon: Users,
      title: "Einer für dich allein",
      text: "Kein Training auf eigene Faust: Bei jeder Einheit steht ein Trainer neben dir und stellt die Intensität mit dir zusammen ein.",
    },
    {
      icon: SlidersHorizontal,
      title: "Jede Muskelgruppe einzeln",
      text: "Acht Zonen, acht Einstellungen - kräftiger, wo du stärker werden willst, sanfter, wo du vorsichtig sein musst.",
    },
    {
      icon: Layers,
      title: "Auch die Tiefe",
      text: "Die Impulse erreichen viele Muskelgruppen gleichzeitig, auch tiefliegende Schichten.",
    },
    {
      icon: HeartPulse,
      title: "Ohne schwere Gewichte",
      text: "Die Impulse kommen zu deiner eigenen Bewegung dazu - ganz ohne Zusatzlast durch Hanteln oder Geräte.",
    },
    standorte > 1
      ? {
          icon: MapPin,
          title: `${standorte} Studios in Köln und Umgebung`,
          text: zeitspanne
            ? `Trainier dort, wo du gerade bist - vor der Arbeit oder danach. Termine gibt es von ${zeitspanne}.`
            : "Trainier dort, wo du gerade bist - morgens neben dem Büro, abends um die Ecke.",
        }
      : {
          icon: Sparkles,
          title: "Feste Zeit, feste Person",
          text: "Dein Termin liegt jede Woche gleich, und du weißt vorher, wer dich erwartet.",
        },
    {
      icon: Gift,
      title: "Kostenlos ausprobieren",
      text: "Das erste Training kostet nichts. Danach entscheidest du in Ruhe, ob es zu dir passt.",
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
          kicker="Deine Vorteile"
          title="Was du bei uns bekommst"
          intro="Kurze Einheiten, ein Trainer an deiner Seite und ein Training, das auf dich eingestellt ist - nicht auf den Durchschnitt."
          className="mb-16"
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="karte-hebt karte-glanz h-full card p-7"
              >
                {/* Das Symbol springt kurz nach der Karte federnd auf - eine
                    kleine zweite Bewegung, die die Karte lebendig macht. */}
                <motion.div
                  initial={{ scale: 0.4, rotate: -18, opacity: 0 }}
                  whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.25 }}
                  className="karte-symbol flex h-11 w-11 items-center justify-center rounded-full bg-lime/10 text-accent"
                >
                  <Icon size={20} />
                </motion.div>
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
