import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Zap, ShieldCheck, Target } from "lucide-react";

export const metadata: Metadata = {
  // Kanonische Adresse: Sonst kann Google dieselbe Seite unter mehreren
  // Adressen als mehrere Seiten werten und die Bewertung aufteilen.
  alternates: { canonical: "/ueber-uns" },
  title: "Über uns",
  description:
    "Lerne Körperformen kennen - dein EMS-Studio für effektives, gelenkschonendes Training in Hürth, Köln und Brühl.",
};

const values = [
  {
    icon: Target,
    title: "Individuell",
    text: "Jeder Trainingsplan wird auf deine Ziele und deinen Fitnesslevel zugeschnitten.",
  },
  {
    icon: ShieldCheck,
    title: "Qualifiziert",
    text: "Unser Team ist zertifiziert im Bereich EMS-Training und begleitet dich bei jeder Einheit.",
  },
  {
    icon: Zap,
    title: "Effektiv",
    text: "Wissenschaftlich fundierte Trainingsmethode für maximale Ergebnisse in minimaler Zeit.",
  },
];

export default function UeberUnsPage() {
  return (
    <>
      <PageHeader
        kicker="Wer wir sind"
        title={<>Über <span className="text-accent">Körperformen</span></>}
        intro="Wir glauben, dass effektives Training nicht viel Zeit kosten muss. Mit EMS-Training bringen wir dich in nur 20 Minuten pro Woche deinem Ziel näher - egal ob Abnehmen, Muskelaufbau oder ein gesünderer Rücken."
      >
        <p className="mt-6 max-w-2xl font-semibold text-accent">
          Körperformen - der Vorreiter für gesundheitsorientiertes EMS Training.
        </p>
      </PageHeader>

      <section className="py-20 sm:py-24 md:py-32">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Was ist EMS-Training?</h2>
          <p className="mt-4 max-w-2xl text-muted">
            EMS steht für Elektro-Muskel-Stimulation. Während du klassische
            Bewegungsübungen ausführst, aktivieren sanfte elektrische Impulse
            über eine spezielle Trainingsweste zusätzlich deine
            Muskulatur - bis zu 90% der Muskelfasern gleichzeitig. Das
            Ergebnis: ein intensives Ganzkörpertraining, das gelenkschonend
            und zeiteffizient ist.
          </p>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-surface p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/15 text-accent">
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

      <section className="on-ink py-20 sm:py-24 md:py-32">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Dein Team vor Ort</h2>
          <p className="mt-4 max-w-2xl text-muted">
            Bei uns trainierst du nie anonym: Jede Einheit wird persönlich
            begleitet - vom ersten Probetraining bis zum hundertsten Termin.
          </p>

          {/* Platzhalter-Team: Namen/Fotos vor Livegang durch echte ersetzen */}
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                initials: "MA",
                name: "Marcel Almeida",
                role: "Inhaber & Geschäftsführer",
                text: "Führt das Studio in Hürth und brennt seit Jahren für gesundheitsorientiertes EMS-Training.",
              },
              {
                initials: "T1",
                name: "Dein/e Trainer/in",
                role: "EMS-Coach (Platzhalter)",
                text: "Zertifizierte EMS-Betreuung, Trainingsplanung und Motivation bei jeder Einheit.",
              },
              {
                initials: "T2",
                name: "Dein/e Trainer/in",
                role: "EMS-Coach (Platzhalter)",
                text: "Begleitet dich 1:1 durchs Training und passt jede Übung an deine Tagesform an.",
              },
            ].map((member) => (
              <StaggerItem key={member.role} className="h-full">
                <div className="h-full card p-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime/15 text-lg font-bold text-accent">
                    {member.initials}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-accent">{member.role}</p>
                  <p className="mt-2 text-sm text-muted">{member.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-24 md:py-32">
        <Container className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Lerne uns persönlich kennen</h2>
          <p className="mt-4 max-w-md text-muted">
            Vereinbare einen kostenlosen Probetermin und überzeuge dich selbst.
          </p>
          <Button href="/probetermin" className="mt-8">
            Probetermin buchen
          </Button>
        </Container>
      </section>
    </>
  );
}
