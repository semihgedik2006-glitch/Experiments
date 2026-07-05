import type { Metadata } from "next";
import {
  Zap,
  Clock,
  ShieldCheck,
  HeartPulse,
  Briefcase,
  Baby,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { FaqSection } from "@/components/faq-section";

export const metadata: Metadata = {
  title: "EMS-Training erklärt",
  description:
    "Wie funktioniert EMS-Training? Wissenschaft, Ablauf, Vergleich zum klassischen Krafttraining und für wen es geeignet ist - der komplette Ratgeber.",
};

const audiences = [
  {
    icon: Briefcase,
    title: "Berufstätige",
    text: "Wenig Zeit, viel Schreibtisch: 20 Minuten pro Woche passen in jeden Kalender - auch in die Mittagspause.",
  },
  {
    icon: HeartPulse,
    title: "Rücken-Geplagte",
    text: "EMS erreicht die tiefe Rumpfmuskulatur, die bei klassischen Übungen oft zu kurz kommt - die Basis eines stabilen Rückens.",
  },
  {
    icon: Activity,
    title: "Wiedereinsteiger",
    text: "Lange nichts gemacht? Das Training startet auf deinem Level und wächst mit - ohne Überforderung am ersten Tag.",
  },
  {
    icon: Baby,
    title: "Junge Eltern",
    text: "Nach der Rückbildung wieder Kraft aufbauen, ohne stundenlang das Haus zu verlassen - ein Termin pro Woche reicht.",
  },
  {
    icon: Clock,
    title: "Best Ager 50+",
    text: "Muskelerhalt ist ab 50 das beste Gesundheitsinvestment. EMS ist gelenkschonend und ohne schwere Gewichte.",
  },
  {
    icon: Zap,
    title: "Sportler",
    text: "Als Ergänzung zum Sport setzt EMS zusätzliche Reize und hilft, Dysbalancen gezielt auszugleichen.",
  },
];

const comparison = [
  { label: "Zeitaufwand pro Woche", ems: "20 Minuten", gym: "3-5 Stunden inkl. Anfahrt" },
  { label: "Aktivierte Muskelfasern", ems: "bis zu 90% gleichzeitig", gym: "je Übung einzelne Muskelgruppen" },
  { label: "Gelenkbelastung", ems: "minimal - ohne Zusatzgewichte", gym: "hoch bei schweren Gewichten" },
  { label: "Betreuung", ems: "immer 1:1 durch Trainer", gym: "meist auf sich gestellt" },
  { label: "Einstiegshürde", ems: "niedrig - Plan wird angepasst", gym: "hoch - Technik muss sitzen" },
  { label: "Tiefenmuskulatur", ems: "wird direkt mitstimuliert", gym: "nur über spezielle Übungen" },
];

const processSteps = [
  {
    step: "Check-in & Gesundheitscheck",
    text: "Beim ersten Besuch klären wir deine Ziele und deinen Gesundheitszustand - damit das Training sicher zu dir passt.",
    duration: "5 Min",
  },
  {
    step: "Funktionswäsche & Weste anlegen",
    text: "Du bekommst Funktionsunterwäsche von uns. Die Trainerin legt dir die EMS-Weste an und verbindet sie mit dem Impulsgerät.",
    duration: "5 Min",
  },
  {
    step: "Impulse einstellen",
    text: "Jede Muskelgruppe wird einzeln angesteuert und individuell dosiert - du bestimmst mit, was sich gut anfühlt.",
    duration: "3 Min",
  },
  {
    step: "Das Training",
    text: "Einfache Übungen wie Kniebeugen oder Ausfallschritte - die Impulse verstärken jede Bewegung um ein Vielfaches.",
    duration: "20 Min",
  },
  {
    step: "Cool-down & Feedback",
    text: "Lockeres Ausklingen mit Entspannungsimpulsen, danach kurzes Feedback und Planung der nächsten Einheit.",
    duration: "5 Min",
  },
];

const contraindications = [
  "Herzschrittmacher oder andere elektronische Implantate",
  "Schwangerschaft",
  "Akute Erkrankungen, Fieber oder Infekte",
  "Epilepsie",
  "Schwere neurologische Erkrankungen",
  "Akute Thrombose",
];

export default function EmsTrainingPage() {
  return (
    <>
      <section className="border-b border-border py-20">
        <Container>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            EMS-Training <span className="text-lime">erklärt</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Elektro-Muskel-Stimulation klingt nach Science-Fiction, ist aber
            seit Jahrzehnten in Physiotherapie und Leistungssport bewährt.
            Hier erfährst du, wie es funktioniert, wie eine Einheit abläuft
            und ob es zu dir passt.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">So funktioniert es</h2>
            <p className="mt-4 text-muted">
              Dein Gehirn steuert Muskeln über elektrische Impulse - EMS nutzt
              genau dieses Prinzip. Über Elektroden in der Trainingsweste
              werden sanfte Impulse direkt an die Muskulatur gesendet, während
              du einfache Übungen ausführst. Der Effekt: Bis zu 90% deiner
              Muskelfasern arbeiten gleichzeitig, auch die tiefliegenden
              Schichten, die beim klassischen Training kaum erreicht werden.
            </p>
            <p className="mt-4 text-muted">
              Deshalb reicht eine 20-minütige Einheit pro Woche für Effekte,
              für die du im Fitnessstudio ein Vielfaches an Zeit investieren
              müsstest - wissenschaftlich untersucht unter anderem von der
              Deutschen Sporthochschule Köln.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20">
        <Container>
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">
              EMS vs. klassisches Krafttraining
            </h2>
            <p className="mt-4 text-muted">
              Beides baut Muskeln auf - der Unterschied liegt in Effizienz,
              Belastung und Betreuung.
            </p>
          </Reveal>

          <Reveal className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-4 pr-4 font-semibold text-muted"> </th>
                  <th className="py-4 pr-4 font-semibold text-lime">EMS bei Körperformen</th>
                  <th className="py-4 font-semibold">Klassisches Studio</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-b border-border/60">
                    <td className="py-4 pr-4 font-medium">{row.label}</td>
                    <td className="py-4 pr-4">
                      <span className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-lime" />
                        {row.ems}
                      </span>
                    </td>
                    <td className="py-4 text-muted">
                      <span className="flex items-start gap-2">
                        <XCircle size={16} className="mt-0.5 shrink-0 opacity-50" />
                        {row.gym}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Für wen ist EMS geeignet?</h2>
            <p className="mt-4 text-muted">
              Kurz: für fast alle, die effizient stärker, straffer oder
              schmerzfreier werden wollen.
            </p>
          </Reveal>

          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-border bg-surface-raised p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/15 text-lime">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20">
        <Container>
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">
              So läuft deine Einheit ab
            </h2>
            <p className="mt-4 text-muted">
              Von der Tür bis zur Dusche in unter 40 Minuten - so sieht ein
              Besuch bei uns aus.
            </p>
          </Reveal>

          <div className="relative ml-3 border-l-2 border-border pl-8 md:ml-6">
            {processSteps.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.08} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-lime bg-background text-[10px] font-bold text-lime md:-left-[41px]">
                  {index + 1}
                </span>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="text-lg font-semibold">{item.step}</h3>
                  <span className="rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-semibold text-lime">
                    {item.duration}
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-sm text-muted">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal className="max-w-2xl rounded-2xl border border-border bg-surface p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Wann EMS nicht geeignet ist
                </h2>
                <p className="mt-2 text-sm text-muted">
                  EMS-Training ist sicher und gut erforscht - in einigen
                  Fällen verzichten wir aber grundsätzlich darauf:
                </p>
                <ul className="mt-4 space-y-2">
                  {contraindications.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <XCircle size={15} className="mt-0.5 shrink-0 text-amber-500/70" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-muted">
                  Unsicher? Sprich vor dem Probetraining kurz mit deinem Arzt -
                  oder frag uns, wir beraten dich ehrlich.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20">
        <Container className="flex flex-col items-center text-center">
          <Reveal>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime/15 text-lime">
              <ShieldCheck size={22} />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Überzeug dich selbst - kostenlos
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              Theorie ist gut, das Kribbeln der ersten Impulse ist besser.
              Dein Probetraining ist gratis und unverbindlich.
            </p>
            <div className="mt-8">
              <Button href="/probetermin">Probetermin sichern</Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <FaqSection />
    </>
  );
}
