"use client";

import { motion } from "motion/react";
import { Clock, HeartPulse, MapPin, SlidersHorizontal, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";

/**
 * Vier Tatsachen über das Training selbst.
 *
 * Vorher acht. Vier davon standen ein zweites Mal auf der Startseite:
 * "Dein eigener Plan" im Abschnitt "Dein Training ist nur deins", "Einer
 * für dich allein" und "Kostenlos ausprobieren" bei den Zusagen
 * (trust-config). "Auch die Tiefe" war die einzige Karte, die mehr
 * behauptete, als die Seite belegen kann. Übrig bleibt, was nur hier steht.
 *
 * Kein Wirkungsversprechen ("sichtbare Erfolge"): Ob jemand abnimmt,
 * hängt an seiner Ernährung, nicht an unserem Text.
 */
function karten(standorte: number, zeitspanne: string | null) {
  return [
    {
      icon: Clock,
      title: "Nur 20 Minuten",
      text: "Einmal pro Woche, fester Termin - passt auch in einen vollen Kalender.",
    },
    {
      icon: SlidersHorizontal,
      title: "Jede Muskelgruppe einzeln",
      text: "Acht Zonen, acht Einstellungen - kräftiger, wo du stärker werden willst, sanfter, wo du vorsichtig sein musst.",
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
    // Das Streufeld liegt hinter der Liste. Anordnung "rand": Die Liste
    // reicht bis in die Mitte, dort wäre ein Punkt entweder verdeckt oder
    // störend.
    <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
      <ImpulsStreu anordnung="rand" />
      <Container className="relative">
        <SectionHeader
          kicker="Deine Vorteile"
          title="Was du bei uns bekommst"
          intro="Kurze Einheiten, ein Trainer an deiner Seite und ein Training, das auf dich eingestellt ist - nicht auf den Durchschnitt."
          className="mb-16"
        />

        {/* Eine Liste statt gleicher Karten: Die Seite hat schon genug
            Kartengitter (Vertrauen, Studios), und Kästen nebeneinander
            lesen sich wie ein Prospekt. Hier tragen
            Symbol, Linie und Weißraum. */}
        <Stagger className="grid gap-x-16 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="group flex h-full gap-5 border-t border-border py-7">
                {/* Das Symbol springt kurz nach der Zeile federnd auf. */}
                <motion.div
                  initial={{ scale: 0.4, rotate: -18, opacity: 0 }}
                  whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime/12 text-accent transition-colors duration-300 group-hover:bg-lime group-hover:text-on-lime"
                >
                  <Icon size={22} />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{text}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
