import { WegLeiste } from "@/components/weg-leiste";
import { EmsProblem } from "@/components/problem/unterseiten";
import type { Metadata } from "next";
import { ReelReihe } from "@/components/reels/reel-reihe";
import { REELS } from "@/lib/reels";
import { ablaufEinheit, gegenanzeigen } from "@/lib/ablauf";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { ImpulsSzene } from "@/components/ui/impuls-szene";
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
import { ImpulsStreu } from "@/components/ui/impuls-streu";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { FaqSection } from "@/components/faq-section";
import { ActivationSequence } from "@/components/ems/activation-sequence";

export function emsMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(
    sprache,
    "/ems-training",
    sprache === "en"
      ? {
          title: "EMS training explained",
          description:
            "How does EMS training work? The principle, what a session looks like and who it is suitable for - the complete guide.",
        }
      : {
          title: "EMS-Training erklärt",
          description:
            "Wie funktioniert EMS-Training? Wissenschaft, Ablauf, Vergleich zum klassischen Krafttraining und für wen es geeignet ist - der komplette Ratgeber.",
        },
  );
}

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

// Hier stand eine Tabelle "EMS gegen klassisches Studio" mit roten
// Kreuzen in der zweiten Spalte. Fitnessstudios schlechtzumachen ist
// nicht unser Stil - übrig bleibt, was EMS bei uns ausmacht.
const merkmale = [
  { label: "Zeitaufwand pro Woche", ems: "20 Minuten Training" },
  { label: "Muskelgruppen je Einheit", ems: "viele gleichzeitig, auch tiefliegende" },
  { label: "Gewichte", ems: "keine - die Impulse kommen zu deiner Bewegung dazu" },
  { label: "Betreuung", ems: "immer persönlich durch einen Trainer" },
  { label: "Einstieg", ems: "ohne Vorerfahrung - dein Plan wird an dich angepasst" },
  { label: "Intensität", ems: "für jede Muskelgruppe einzeln eingestellt" },
];

// Auf Englisch vorsichtiger als im Deutschen: kein "Basis eines stabilen
// Rückens", kein "bestes Gesundheitsinvestment" - beschrieben wird, für
// wen das Training gemacht ist, nicht was es bewirkt.
const audiencesEn: typeof audiences = [
  {
    icon: Briefcase,
    title: "Busy professionals",
    text: "Little time, lots of desk: 20 minutes a week fits into any calendar - even your lunch break.",
  },
  {
    icon: HeartPulse,
    title: "People who sit a lot",
    text: "EMS also reaches the deep core muscles, which often get too little attention in classic exercises.",
  },
  {
    icon: Activity,
    title: "Getting back into it",
    text: "Not done anything for a while? Training starts at your level and grows with you - no overload on day one.",
  },
  {
    icon: Baby,
    title: "Young parents",
    text: "Build strength again after postnatal recovery without leaving the house for hours - one appointment a week is enough.",
  },
  {
    icon: Clock,
    title: "50 and over",
    text: "Keeping your muscles matters more and more with age. EMS is easy on the joints and works without heavy weights.",
  },
  {
    icon: Zap,
    title: "Athletes",
    text: "As a supplement to your sport, EMS adds an extra stimulus and lets you work on imbalances in a targeted way.",
  },
];

const merkmaleEn: typeof merkmale = [
  { label: "Time per week", ems: "20 minutes of training" },
  { label: "Muscle groups per session", ems: "many at once, including deep ones" },
  { label: "Weights", ems: "none - the impulses are added to your movement" },
  { label: "Supervision", ems: "always in person, by a trainer" },
  { label: "Getting started", ems: "no experience needed - your plan is adapted to you" },
  { label: "Intensity", ems: "set individually for each muscle group" },
];


export function EmsSeite({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  return (
    <>
      <PageHeader
        kicker={en ? "Understanding EMS" : "EMS verstehen"}
        title={
          en ? (
            <>
              EMS training <span className="text-accent">explained</span>
            </>
          ) : (
            <>
              EMS-Training <span className="text-accent">erklärt</span>
            </>
          )
        }
        // Der zweite Satz war ein Inhaltsverzeichnis in Prosa ("Hier
        // erfährst du, wie es funktioniert, wie eine Einheit abläuft und
        // ob es zu dir passt") - genau das steht in den Überschriften
        // darunter, nur kürzer.
        intro={
          en
            ? "Used in physiotherapy and competitive sport for decades - and for some years now as training for anyone short on time."
            : "Seit Jahrzehnten in Physiotherapie und Leistungssport im Einsatz - und seit einigen Jahren als Training für alle, die wenig Zeit haben."
        }
      />

      <section className="py-20 sm:py-24 md:py-32">
        <Container className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {en ? "How it works" : "So funktioniert es"}
            </h2>
            {en ? (
              <>
                <p className="mt-4 text-muted">
                  Your brain controls your muscles with electrical impulses - EMS uses exactly this
                  principle. Electrodes in the training vest send gentle impulses directly to your
                  muscles while you do simple exercises. The result: many muscle groups work at the
                  same time, including deeper layers that are hard to target with classic exercises.
                </p>
                <p className="mt-4 text-muted">
                  That is what the training is designed for: one short, intense session a week instead
                  of several evenings - with enough time in between for your muscles to recover.
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-muted">
                  Dein Gehirn steuert Muskeln über elektrische Impulse - EMS nutzt genau dieses Prinzip.
                  Über Elektroden in der Trainingsweste werden sanfte Impulse direkt an die Muskulatur
                  gesendet, während du einfache Übungen ausführst. Der Effekt: Viele Muskelgruppen
                  arbeiten gleichzeitig, auch tiefliegende Schichten, die sich mit klassischen Übungen
                  nur schwer gezielt ansteuern lassen.
                </p>
                <p className="mt-4 text-muted">
                  Darauf ist das Training ausgelegt: eine kurze, intensive Einheit pro Woche statt
                  mehrerer Abende - mit genug Abstand dazwischen, damit sich die Muskulatur erholen kann.
                </p>
              </>
            )}
          </Reveal>
          {/* Das Impulsgerät neben der Erklärung, wie es arbeitet. Erst ab
              mittlerer Breite: Auf dem Handy stünde es zwischen zwei
              Absätzen und risse den Text auseinander. */}
          <ImpulsSzene name="geraet" className="mx-auto hidden w-full max-w-[240px] md:block" />
        </Container>
      </section>

      <EmsProblem />
      <ActivationSequence sprache={sprache} />

      {/* Zwei Reels aus den Studios: die Weste und das Training einmal in
          echt, statt nur als Zeichnung. */}
      <ReelReihe
        reels={[REELS.weste, REELS.emsErklaert]}
        kicker={en ? "The real thing" : "Einmal in echt"}
        titel={en ? "Vest on, impulses on" : "Weste an, Impulse an"}
        intro={
          en
            ? "A trainer shows what the vest does and what training feels like – in German, with German subtitles."
            : "Eine Trainerin zeigt, was die Weste macht und wie sich das Training anfühlt – mit Untertiteln."
        }
      />

      <section className="on-ink py-20 sm:py-24 md:py-32">
        <Container>
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {en ? "What EMS with us is about" : "Was EMS bei uns ausmacht"}
            </h2>
            <p className="mt-4 text-muted">
              {en
                ? "Short sessions, many muscle groups at once and a trainer who sets everything up for you."
                : "Kurze Einheiten, viele Muskelgruppen auf einmal und ein Trainer, der alles auf dich einstellt."}
            </p>
          </Reveal>

          <Stagger className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {(en ? merkmaleEn : merkmale).map((zeile) => (
              <StaggerItem key={zeile.label}>
                <div className="flex h-full items-start gap-3 border-t border-white/10 pt-5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <p className="text-sm text-muted">{zeile.label}</p>
                    <p className="mt-1 font-semibold">{zeile.ems}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Ein Trenner zwischen zwei hellen Abschnitten - genau die Stelle,
          an der die Seite beim Scrollen bisher stillstand. */}
      <ImpulsTrenner variante="b" className="mx-auto max-w-6xl px-6" />

      {/* Streufeld hinter den Zielgruppenkarten. Anordnung "rand", weil
          die Karten bis in die Mitte reichen. */}
      <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
        <ImpulsStreu anordnung="rand" />
        <Container className="relative">
          {/* Die Wirbelsäule mit der tiefen Muskulatur daneben: Von den
              sechs Gruppen darunter ist "Rücken-Geplagte" die, mit der die
              meisten kommen.
              Erst absolut gesetzt - da schnitten die Karten darunter sie
              mittendurch. Im Raster kann das nicht passieren. */}
          <div className="mb-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <Reveal className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {en ? "Who is EMS suitable for?" : "Für wen ist EMS geeignet?"}
              </h2>
              <p className="mt-4 text-muted">
                {en
                  ? "In short: for almost anyone who wants to train efficiently - to get stronger, more toned or fitter."
                  : "Kurz: für fast alle, die effizient stärker, straffer oder schmerzfreier werden wollen."}
              </p>
            </Reveal>
            <ImpulsSzene name="ruecken" className="mx-auto hidden w-full max-w-[200px] md:block" />
          </div>

          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(en ? audiencesEn : audiences).map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="h-full card p-6">
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

      <section className="border-t border-border bg-surface py-20 sm:py-24 md:py-32">
        <Container>
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {en ? "How your session works" : "So läuft deine Einheit ab"}
            </h2>
            <p className="mt-4 text-muted">
              {en
                ? "From the door to the shower in under 40 minutes - this is what a visit looks like."
                : "Von der Tür bis zur Dusche in unter 40 Minuten - so sieht ein Besuch bei uns aus."}
            </p>
          </Reveal>

          <div className="relative ml-3 border-l-2 border-border pl-8 md:ml-6">
            {ablaufEinheit(sprache).map((item, index) => (
              <Reveal key={item.step} delay={index * 0.08} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-lime bg-background text-[10px] font-bold text-accent md:-left-[41px]">
                  {index + 1}
                </span>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="text-lg font-semibold">{item.step}</h3>
                  <span className="rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    {item.duration}
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-sm text-muted">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24 md:py-32">
        <Container>
          <Reveal className="max-w-2xl rounded-2xl border border-border bg-surface p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {en ? "When EMS is not suitable" : "Wann EMS nicht geeignet ist"}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {en
                    ? "What matters is supervision and your history. In these cases we do not offer EMS training at all:"
                    : "Entscheidend sind Betreuung und Vorgeschichte. In diesen Fällen verzichten wir grundsätzlich auf EMS-Training:"}
                </p>
                <ul className="mt-4 space-y-2">
                  {gegenanzeigen(sprache).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <XCircle size={15} className="mt-0.5 shrink-0 text-amber-500/70" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-muted">
                  {en
                    ? "Not sure? Have a quick word with your doctor before the trial session - or ask us, we will give you honest advice."
                    : "Unsicher? Sprich vor dem Probetraining kurz mit deinem Arzt - oder frag uns, wir beraten dich ehrlich."}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20 sm:py-24 md:py-32">
        <Container className="flex flex-col items-center text-center">
          <Reveal>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime/15 text-accent">
              <ShieldCheck size={22} />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              {en ? "See for yourself - for free" : "Überzeug dich selbst - kostenlos"}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              {en
                ? "Theory is good, the tingle of the first impulses is better. Your trial session is free and without obligation."
                : "Theorie ist gut, das Kribbeln der ersten Impulse ist besser. Dein Probetraining ist gratis und unverbindlich."}
            </p>
            <div className="mt-8">
              <Button href="/probetermin">{en ? "Book your trial session" : "Probetermin sichern"}</Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <FaqSection sprache={sprache} />

      <WegLeiste aktuell="verstehen" />
    </>
  );
}
