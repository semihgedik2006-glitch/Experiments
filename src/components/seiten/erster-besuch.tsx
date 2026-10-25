import type { Metadata } from "next";
import Link from "@/components/sprach-link";
import { CalendarCheck, Droplets, ShieldCheck } from "lucide-react";
import { ablaufEinheit, gegenanzeigen } from "@/lib/ablauf";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { AblaufGeschichte } from "@/components/erster-besuch/ablauf-geschichte";
import { WegLeiste } from "@/components/weg-leiste";

export function ersterBesuchMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(
    sprache,
    "/erster-besuch",
    sprache === "en"
      ? {
          title: "Your first visit",
          description:
            "How your free EMS trial session at Körperformen works: welcome, suit, 20 minutes of training with a trainer, then your plan. About 40 minutes.",
        }
      : {
          title: "Dein erster Besuch",
          description:
            "So läuft dein kostenloses EMS-Probetraining bei Körperformen ab: Begrüßung, Anzug, 20 Minuten Training mit Trainer, danach dein Plan. Rund 40 Minuten.",
        },
  );
}

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
    titel: "Wunschzeit nennen",
    text: "Online in einer Minute – wir melden uns mit einem passenden Termin.",
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

const VORHER_EN: typeof VORHER = [
  {
    icon: CalendarCheck,
    titel: "Tell us when suits you",
    text: "Online in a minute – we get back to you with a matching time.",
  },
  {
    icon: Droplets,
    titel: "Bring two towels",
    text: "One large and one small. We provide functional underwear and the EMS suit.",
  },
  {
    icon: ShieldCheck,
    titel: "Quick check",
    text: "There are cases in which we do not train – the list is below.",
  },
];

export function ErsterBesuchSeite({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  return (
    <>
      <PageHeader
        kicker={en ? "Your first visit" : "Dein erster Besuch"}
        title={
          en ? (
            <>
              How your <span className="text-accent-strong">trial session</span> works
            </>
          ) : (
            <>
              So läuft dein <span className="text-accent-strong">Probetraining</span> ab
            </>
          )
        }
        intro={
          en
            ? "About 40 minutes, from the welcome to your plan. Your trainer is by your side the whole time."
            : "Rund 40 Minuten, von der Begrüßung bis zum Plan. Dein Trainer ist die ganze Zeit an deiner Seite."
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/probetermin">{en ? "Free trial session" : "Kostenloses Probetraining"}</Button>
        </div>
      </PageHeader>

      <section className="border-b border-border py-14 sm:py-16">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{en ? "Before" : "Vorher"}</p>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {(en ? VORHER_EN : VORHER).map(({ icon: Icon, titel, text }) => (
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

      <AblaufGeschichte schritte={ablaufEinheit(sprache)} />

      <section className="border-t border-border bg-surface py-14 sm:py-16">
        <Container className="max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight">{en ? "When we do not train" : "Wann wir nicht trainieren"}</h2>
          <p className="mt-2 text-sm text-muted">
            {en
              ? "In these cases we do not offer EMS training. If in doubt, talk to your doctor first – or call us and we will clarify it together."
              : "In diesen Fällen verzichten wir auf EMS-Training. Im Zweifel sprich vorher mit deinem Arzt – oder ruf uns an, dann klären wir es gemeinsam."}
          </p>
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {gegenanzeigen(sprache).map((g) => (
              <li key={g} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {g}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            {en ? "More on how EMS works:" : "Mehr dazu, wie EMS funktioniert:"}{" "}
            <Link href="/ems-training" className="text-accent underline underline-offset-2">
              {en ? "EMS training explained" : "EMS-Training erklärt"}
            </Link>
          </p>
        </Container>
      </section>

      <WegLeiste aktuell="erleben" />
    </>
  );
}
