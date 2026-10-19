import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Droplets, ShieldCheck } from "lucide-react";
import { ABLAUF_EINHEIT, GEGENANZEIGEN } from "@/lib/ablauf";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { AblaufGeschichte } from "@/components/erster-besuch/ablauf-geschichte";
import { WegLeiste } from "@/components/weg-leiste";

export const metadata: Metadata = {
  alternates: { canonical: "/erster-besuch" },
  title: "Dein erster Besuch",
  description:
    "So läuft dein kostenloses EMS-Probetraining bei Körperformen ab: Begrüßung, Anzug, 20 Minuten Training mit Trainer, danach dein Plan. Rund 40 Minuten.",
};

/**
 * "Dein erster Besuch" - Station 2 auf dem Weg (lib/weg.ts).
 *
 * Die häufigste Hürde vor dem Probetraining ist nicht der Preis, sondern
 * das Unbekannte: Was passiert da, was muss ich anziehen, wie lange
 * dauert es. Diese Seite beantwortet genau das, Minute für Minute.
 */
const VORHER = [
  {
    icon: CalendarCheck,
    titel: "Termin wählen",
    text: "Online in einer Minute – kostenlos und unverbindlich.",
  },
  {
    icon: Droplets,
    titel: "Zwei Handtücher mitbringen",
    text: "Ein großes und ein kleines. Funktionswäsche und EMS-Anzug stellen wir.",
  },
  {
    icon: ShieldCheck,
    titel: "Kurz prüfen",
    text: "Es gibt Fälle, in denen wir nicht trainieren – die Liste steht unten.",
  },
];

export default function ErsterBesuchPage() {
  return (
    <>
      <PageHeader
        kicker="Dein erster Besuch"
        title={
          <>
            So läuft dein <span className="text-accent-strong">Probetraining</span> ab
          </>
        }
        intro="Rund 40 Minuten, von der Begrüßung bis zum Plan. Dein Trainer ist die ganze Zeit an deiner Seite."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/probetermin">Kostenloses Probetraining</Button>
        </div>
      </PageHeader>

      <section className="border-b border-border py-14 sm:py-16">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Vorher</p>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {VORHER.map(({ icon: Icon, titel, text }) => (
              <StaggerItem key={titel} className="h-full">
                <div className="karte-hebt flex h-full gap-4 rounded-2xl border border-border bg-surface p-5">
                  <span className="karte-symbol flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/15 text-accent">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{titel}</span>
                    <span className="mt-1 block text-sm text-muted">{text}</span>
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <AblaufGeschichte schritte={ABLAUF_EINHEIT} />

      <section className="border-t border-border bg-surface py-14 sm:py-16">
        <Container className="max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight">Wann wir nicht trainieren</h2>
          <p className="mt-2 text-sm text-muted">
            In diesen Fällen verzichten wir auf EMS-Training. Im Zweifel sprich vorher mit deinem
            Arzt – oder ruf uns an, dann klären wir es gemeinsam.
          </p>
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {GEGENANZEIGEN.map((g) => (
              <li key={g} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {g}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Mehr dazu, wie EMS funktioniert:{" "}
            <Link href="/ems-training" className="text-accent underline underline-offset-2">
              EMS-Training erklärt
            </Link>
          </p>
        </Container>
      </section>

      <WegLeiste aktuell="erleben" />
    </>
  );
}
