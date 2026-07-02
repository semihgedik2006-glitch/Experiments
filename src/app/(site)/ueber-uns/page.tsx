import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, Target } from "lucide-react";

export const metadata: Metadata = {
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
      <section className="border-b border-border py-20">
        <Container>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Über <span className="text-lime">Körperformen</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Wir glauben, dass effektives Training nicht viel Zeit kosten muss.
            Mit EMS-Training bringen wir dich in nur 20 Minuten pro Woche
            deinem Ziel näher - egal ob Abnehmen, Muskelaufbau oder ein
            gesünderer Rücken.
          </p>
          <p className="mt-4 max-w-2xl font-semibold text-lime">
            Körperformen - der Vorreiter für gesundheitsorientiertes EMS
            Training.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight">Was ist EMS-Training?</h2>
          <p className="mt-4 max-w-2xl text-muted">
            EMS steht für Elektro-Muskel-Stimulation. Während du klassische
            Bewegungsübungen ausführst, aktivieren sanfte elektrische Impulse
            über eine spezielle Trainingsweste zusätzlich deine
            Muskulatur - bis zu 90% der Muskelfasern gleichzeitig. Das
            Ergebnis: ein intensives Ganzkörpertraining, das gelenkschonend
            und zeiteffizient ist.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-surface p-6">
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

      <section className="border-t border-border bg-surface py-20">
        <Container className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight">Lerne uns persönlich kennen</h2>
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
