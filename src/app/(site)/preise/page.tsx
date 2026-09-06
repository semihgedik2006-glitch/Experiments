import type { Metadata } from "next";
import { isVisible } from "@/lib/site-toggles";
import { notFound } from "next/navigation";
import { Check, CalendarDays, Target, Clock, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { FaqSection } from "@/components/faq-section";

export const metadata: Metadata = {
  // Kanonische Adresse: Sonst kann Google dieselbe Seite unter mehreren
  // Adressen als mehrere Seiten werten und die Bewertung aufteilen.
  alternates: { canonical: "/preise" },
  title: "Preise",
  description:
    "Individuelle Preise für EMS-Training bei Körperformen - wir besprechen dein Paket persönlich im kostenlosen Probetermin.",
};

const highlights = [
  "1x oder 2x EMS-Training pro Woche - passend zu deinem Ziel",
  "Individueller Trainingsplan statt Standardpaket",
  "Persönliche Betreuung durch dein Trainer-Team",
  "Ernährungsberatung nach Bedarf",
  "Monatlich flexibel, ohne versteckte Kosten",
];

const priceFactors = [
  {
    icon: CalendarDays,
    title: "Wie oft du trainierst",
    text: "Ein- oder zweimal pro Woche - das ist der größte Hebel. Wir empfehlen, was zu deinem Ziel passt, nicht was am meisten kostet.",
  },
  {
    icon: Target,
    title: "Dein Ziel",
    text: "Abnehmen, Rückenaufbau oder Muskelaufbau brauchen unterschiedlich lange Begleitung und unterschiedliche Trainingspläne.",
  },
  {
    icon: Clock,
    title: "Die Laufzeit",
    text: "Längere Bindung senkt den Beitrag pro Einheit. Kürzere Laufzeit kostet mehr, lässt dir aber mehr Spielraum.",
  },
  {
    icon: Sparkles,
    title: "Zusatzleistungen",
    text: "Ernährungsberatung oder zusätzliche Messungen sind möglich, aber kein Muss - du entscheidest, was du brauchst.",
  },
];

const timeComparison = [
  { label: "Trainingszeit pro Woche", ems: "20 Minuten", gym: "3-5 Stunden" },
  { label: "Anfahrt pro Woche", ems: "1x", gym: "2-4x" },
  { label: "Umziehen und Duschen", ems: "1x pro Woche", gym: "bei jedem Besuch" },
  { label: "Planung des Trainings", ems: "übernimmt dein Trainer", gym: "machst du selbst" },
  { label: "Zeit bis zu ersten Effekten", ems: "4-6 Wochen", gym: "je nach Regelmäßigkeit" },
];

export default async function PreisePage() {
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("preise"))) return notFound();

  return (
    <>
      <PageHeader
        kicker="Konditionen"
        title={<>Faire <span className="text-accent">Preise</span></>}
        intro="Jedes Trainingsziel ist anders - deshalb besprechen wir dein persönliches Paket direkt bei deinem kostenlosen Probetermin. So zahlst du nur für das, was wirklich zu dir passt."
      />

      <section className="py-20 sm:py-24 md:py-32">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight">Das ist immer inklusive</h2>
              <ul className="mt-6 space-y-4">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check size={18} className="mt-0.5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="rounded-2xl border border-lime bg-surface p-8 text-center">
              <h3 className="text-xl font-semibold">Dein persönliches Angebot</h3>
              <p className="mt-3 text-sm text-muted">
                In einem unverbindlichen Probetermin lernst du das Studio kennen
                und bekommst ein Preisangebot, das zu deinen Zielen und deinem
                Budget passt.
              </p>
              <Button href="/probetermin" className="mt-6 w-full">
                Kostenlosen Probetermin buchen
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20 sm:py-24 md:py-32">
        <Container>
          <SectionHeader
            kicker="Transparenz"
            title="Warum hier keine Preisliste steht"
            intro="Eine ehrliche Antwort: Weil eine Zahl ohne Zusammenhang wenig aussagt. Wer einmal pro Woche trainiert, zahlt nicht dasselbe wie jemand mit zwei Einheiten und Ernährungsberatung."
            className="mb-14"
          />

          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {priceFactors.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="h-full card p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/10 text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="mt-12 card p-8">
            <p className="text-sm leading-relaxed text-muted">
              <strong className="text-foreground">Was wir dir zusichern:</strong> Beim
              Probetermin bekommst du ein konkretes Angebot mit allen Zahlen schriftlich -
              ohne Kleingedrucktes, ohne versteckte Zusatzkosten und ohne
              Entscheidungsdruck an Ort und Stelle. Du nimmst es mit und überlegst in Ruhe.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="on-ink py-20 sm:py-24 md:py-32">
        <Container>
          <SectionHeader
            kicker="Zum Vergleich"
            title="Was dich EMS an Zeit kostet"
            intro="Geld ist das eine - Zeit das andere. Genau hier liegt der Unterschied zum klassischen Fitnessstudio."
            className="mb-14"
          />

          {/* Auf schmalen Bildschirmen gestapelt: eine Tabelle mit drei Spalten
              wäre dort entweder unlesbar klein oder seitlich abgeschnitten. */}
          <Reveal className="space-y-4 sm:hidden">
            {timeComparison.map((row) => (
              <div key={row.label} className="card p-5">
                <p className="text-sm font-semibold">{row.label}</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-accent">Körperformen</dt>
                    <dd className="text-right font-medium">{row.ems}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Klassisches Studio</dt>
                    <dd className="text-right text-muted">{row.gym}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </Reveal>

          <Reveal className="hidden sm:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-4 pr-4 font-semibold text-muted"><span className="sr-only">Merkmal</span></th>
                  <th className="py-4 pr-4 font-semibold text-accent">EMS bei Körperformen</th>
                  <th className="py-4 font-semibold">Klassisches Studio</th>
                </tr>
              </thead>
              <tbody>
                {timeComparison.map((row) => (
                  <tr key={row.label} className="border-b border-border/60">
                    <td className="py-4 pr-4 font-medium">{row.label}</td>
                    <td className="py-4 pr-4">{row.ems}</td>
                    <td className="py-4 text-muted">{row.gym}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </Container>
      </section>

      <FaqSection />
    </>
  );
}
