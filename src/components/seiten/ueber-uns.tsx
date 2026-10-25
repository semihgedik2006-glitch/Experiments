import type { Metadata } from "next";
import { siteTexte } from "@/lib/site-config";
import type { Sprache } from "@/lib/sprache";
import { lokal } from "@/lib/i18n/lokal";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { isVisible } from "@/lib/site-toggles";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { MehrDazu } from "@/components/ui/mehr-dazu";
import { ImpulsSzene } from "@/components/ui/impuls-szene";
import Link from "@/components/sprach-link";
import { Zap, ShieldCheck, Target } from "lucide-react";
import { TrainerBild } from "@/components/studio/trainer-bild";
import { prisma } from "@/lib/prisma";
import { legalConfig } from "@/lib/legal-config";

export function ueberUnsMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(
    sprache,
    "/ueber-uns",
    sprache === "en"
      ? {
          title: "About us",
          description:
            "Get to know Körperformen - your EMS studios for effective training without heavy weights in and around Cologne.",
        }
      : {
          title: "Über uns",
          description:
            "Lerne Körperformen kennen - dein EMS-Studio für effektives, gelenkschonendes Training in Hürth, Köln und Brühl.",
        },
  );
}

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

const valuesEn: typeof values = [
  {
    icon: Target,
    title: "Individual",
    text: "Every training plan is tailored to your goals and your fitness level.",
  },
  {
    icon: ShieldCheck,
    title: "Supervised",
    text: "You never train alone: a trainer stays for the whole session and sets the intensity together with you.",
  },
  {
    icon: Zap,
    title: "Short",
    text: "One session a week, about 20 minutes - designed for an everyday life that is already full.",
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
async function teamHolen(sprache: Sprache): Promise<TeamMitglied[]> {
  const inhaber: TeamMitglied = {
    id: "inhaber",
    name: legalConfig.owner,
    rolle: sprache === "en" ? "Owner & managing director" : "Inhaber & Geschäftsführer",
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
        rolleEn: true,
        textEn: true,
        fotoUrl: true,
        studio: { select: { name: true } },
      },
    });

    return [
      inhaber,
      ...trainer.map((t) => ({
        id: t.id,
        name: t.name,
        rolle: lokal(sprache, t.rolle, t.rolleEn),
        text: lokal(sprache, t.text, t.textEn),
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

export async function UeberUnsSeite({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("ueber-uns"))) return notFound();

  const team = await teamHolen(sprache);

  return (
    <>
      <PageHeader
        kicker={en ? "Who we are" : "Wer wir sind"}
        title={
          en ? (
            <>
              About <span className="text-accent">Körperformen</span>
            </>
          ) : (
            <>
              Über <span className="text-accent">Körperformen</span>
            </>
          )
        }
        // "Wir glauben, dass ..." - so fängt kein Satz an, der etwas sagt.
        // Was folgte, war ohnehin die Aussage: 20 Minuten pro Woche.
        intro={
          en
            ? "20 minutes a week, personally supervised - whether your goal is losing weight, building muscle or a stronger back."
            : "20 Minuten pro Woche, persönlich betreut - ob Abnehmen, Muskelaufbau oder ein gesünderer Rücken."
        }
      >
        <p className="mt-6 max-w-2xl font-semibold text-accent">
          {siteTexte[sprache].claim}.
        </p>
      </PageHeader>

      {/* Diagonal: Die Welle läuft von links unten nach rechts oben durch
          den Abschnitt - der Blick geht beim Scrollen ohnehin in diese
          Richtung. */}
      <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
        <ImpulsStreu anordnung="diagonal" />
        <Container className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {en ? "What is EMS training?" : "Was ist EMS-Training?"}
          </h2>
          {/* Der Absatz stand hier in voller Länge. Er ist richtig, aber
              er beantwortet eine Frage, die auf dieser Seite niemand
              stellt - wer sie stellt, ist auf /ems-training. Zwei Sätze
              bleiben, der Rest steht eine Ebene tiefer. */}
          <p className="mt-4 max-w-2xl text-muted">
            {en
              ? "EMS stands for electrical muscle stimulation: gentle impulses from a training vest activate your muscles while you do simple exercises."
              : "EMS steht für Elektro-Muskel-Stimulation: Sanfte Impulse aus einer Trainingsweste aktivieren deine Muskulatur, während du einfache Übungen machst."}
          </p>
          <MehrDazu titel={en ? "How exactly it works" : "Wie das genau funktioniert"} className="mt-4">
            {en ? (
              <>
                <p>
                  The impulses are added to your own movement and reach many muscle groups at the same
                  time &ndash; including deeper layers that are hard to target with classic exercises.
                </p>
                <p>The training works without heavy weights &ndash; there is no extra load on your joints and spine.</p>
                <p>
                  <Link href="/ems-training" className="text-accent underline underline-offset-4 hover:text-foreground">
                    More on the EMS page
                  </Link>{" "}
                  &ndash; with what a session looks like and the cases in which we do not offer EMS.
                </p>
              </>
            ) : (
            <>
            <p>
              Die Impulse kommen zu deiner eigenen Bewegung dazu und erreichen
              viele Muskelgruppen gleichzeitig &ndash; auch tiefliegende Schichten,
              die sich mit klassischen Übungen nur schwer gezielt ansteuern lassen.
            </p>
            <p>
              Das Training kommt ohne schwere Gewichte aus &ndash; es kommt keine
              Zusatzlast auf Gelenke und Wirbelsäule.
            </p>
            <p>
              <Link
                href="/ems-training"
                className="text-accent underline underline-offset-4 hover:text-foreground"
              >
                Ausführlich auf der EMS-Seite
              </Link>{" "}
              &ndash; mit Ablauf einer Einheit und den Fällen, in denen wir auf EMS
              verzichten.
            </p>
            </>
            )}
          </MehrDazu>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {(en ? valuesEn : values).map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title} className="h-full">
                <div className="karte-hebt karte-glanz h-full rounded-2xl border border-border bg-surface p-6">
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
          {/* Zwei Formen, von denen eine sich zur anderen neigt - keine
              Gesichter, keine Finger. Was man nicht zeichnet, kann auch
              nicht falsch aussehen. */}
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {en ? "Your team on site" : "Dein Team vor Ort"}
              </h2>
              <p className="mt-4 max-w-2xl text-muted">
                {en
                  ? "Every session is personally supervised – from the trial session on."
                  : "Jede Einheit wird persönlich begleitet – vom Probetraining an."}
              </p>
            </div>
            <ImpulsSzene name="zuZweit" className="mx-auto hidden w-full max-w-[220px] md:block" />
          </div>

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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {en ? "Get to know us in person" : "Lerne uns persönlich kennen"}
          </h2>
          <p className="mt-4 max-w-md text-muted">
            {en
              ? "Book a free trial session and see for yourself."
              : "Vereinbare einen kostenlosen Probetermin und überzeuge dich selbst."}
          </p>
          <Button href="/probetermin" className="mt-8">
            {en ? "Book a trial session" : "Probetermin buchen"}
          </Button>
        </Container>
      </section>
    </>
  );
}
