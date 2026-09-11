import type { Metadata } from "next";
import { isVisible } from "@/lib/site-toggles";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Zap, ShieldCheck, Target } from "lucide-react";
import { TrainerBild } from "@/components/studio/trainer-bild";
import { prisma } from "@/lib/prisma";
import { legalConfig } from "@/lib/legal-config";

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
    title: "Begleitet",
    text: "Du trainierst nie allein: Ein Trainer bleibt die ganze Einheit dabei und stellt die Intensität mit dir zusammen ein.",
  },
  {
    icon: Zap,
    title: "Kurz",
    text: "Eine Einheit pro Woche, rund 20 Minuten - ausgelegt auf einen Alltag, der ohnehin voll ist.",
  },
];

type TeamMitglied = {
  id: string;
  name: string;
  rolle: string | null;
  text: string | null;
  fotoUrl: string | null;
  studioName: string | null;
};

/**
 * Das Team für diese Seite.
 *
 * Zuerst der Inhaber - sein Name steht ohnehin im Impressum, er ist also
 * keine Angabe, die noch jemand freigeben müsste. Danach die
 * Trainerprofile aus dem Adminbereich, dieselben wie auf den
 * Standortseiten: Zwei getrennte Pflegestellen für dieselben Menschen
 * wären zwei Stellen, an denen jemand fehlt, der längst gegangen ist.
 *
 * Höchstens fünf Profile. Bei vierzehn Standorten wären es sonst
 * irgendwann fünfzig Karten auf einer Seite, die "wer wir sind" heißt -
 * wer genau wissen will, wer ihn erwartet, ist auf der Standortseite
 * besser aufgehoben.
 */
async function teamHolen(): Promise<TeamMitglied[]> {
  const inhaber: TeamMitglied = {
    id: "inhaber",
    name: legalConfig.owner,
    rolle: "Inhaber & Geschäftsführer",
    text: null,
    fotoUrl: null,
    studioName: null,
  };

  try {
    const trainer = await prisma.trainer.findMany({
      where: { aktiv: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        rolle: true,
        text: true,
        fotoUrl: true,
        studio: { select: { name: true } },
      },
    });

    return [
      inhaber,
      ...trainer.map((t) => ({
        id: t.id,
        name: t.name,
        rolle: t.rolle,
        text: t.text,
        fotoUrl: t.fotoUrl,
        studioName: t.studio?.name ?? null,
      })),
    ];
  } catch (error) {
    // Fällt die Abfrage aus, bleibt der Inhaber stehen - besser als eine
    // Seite, die wegen der Teamkarten gar nicht mehr lädt.
    console.error("Trainerprofile konnten nicht geladen werden:", error);
    return [inhaber];
  }
}

export default async function UeberUnsPage() {
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("ueber-uns"))) return notFound();

  const team = await teamHolen();

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

      {/* Diagonal: Die Welle läuft von links unten nach rechts oben durch
          den Abschnitt - der Blick geht beim Scrollen ohnehin in diese
          Richtung. */}
      <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
        <ImpulsStreu anordnung="diagonal" />
        <Container className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Was ist EMS-Training?</h2>
          <p className="mt-4 max-w-2xl text-muted">
            EMS steht für Elektro-Muskel-Stimulation. Während du klassische
            Bewegungsübungen ausführst, aktivieren sanfte elektrische Impulse
            über eine spezielle Trainingsweste zusätzlich deine
            Muskulatur - viele Muskelgruppen gleichzeitig, auch tiefliegende
            Schichten. Weil es ohne schwere Gewichte auskommt, ist die
            Belastung für Gelenke und Wirbelsäule geringer als beim
            Hanteltraining.
          </p>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title} className="h-full">
                <div className="karte-hebt h-full rounded-2xl border border-border bg-surface p-6">
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

          {/* Hier standen zwei Karten mit "Dein/e Trainer/in
              (Platzhalter)" - auf der Seite, deren ganzes Argument die
              persönliche Betreuung ist. Jetzt kommen die Profile aus dem
              Adminbereich (dieselben wie auf den Standortseiten); ist dort
              keines eingetragen, steht hier nur der Inhaber. Eine Karte
              allein sieht besser aus als zwei erfundene daneben. */}
          <Stagger
            className={`mt-12 grid gap-6 ${
              team.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
            } ${team.length === 1 ? "max-w-sm" : ""}`}
          >
            {team.map((mitglied) => (
              <StaggerItem key={mitglied.id} className="h-full">
                <div className="h-full card p-6">
                  <TrainerBild
                    name={mitglied.name}
                    fotoUrl={mitglied.fotoUrl}
                    groesse="klein"
                  />
                  <h3 className="mt-4 text-lg font-semibold">{mitglied.name}</h3>
                  {mitglied.rolle && <p className="text-sm text-accent">{mitglied.rolle}</p>}
                  {mitglied.studioName && (
                    <p className="text-xs text-muted">{mitglied.studioName}</p>
                  )}
                  {mitglied.text && <p className="mt-2 text-sm text-muted">{mitglied.text}</p>}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <ImpulsTrenner variante="c" className="mx-auto max-w-6xl px-6" />

      <section className="py-20 sm:py-24 md:py-32">
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
