import { WegLeiste } from "@/components/weg-leiste";
import { PreisProblem } from "@/components/problem/unterseiten";
import type { Metadata } from "next";
import { isVisible } from "@/lib/site-toggles";
import { notFound } from "next/navigation";
import { Check, CalendarDays, Target, Clock, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { MehrDazu } from "@/components/ui/mehr-dazu";
import { ImpulsSzene } from "@/components/ui/impuls-szene";
import { FaqSection } from "@/components/faq-section";
import { DirekterKontakt } from "@/components/direkter-kontakt";
import { TarifVergleich, type TarifAnzeige } from "@/components/preise/tarif-vergleich";
import { Zusatzangebote } from "@/components/preise/zusatzangebote";
import { prisma } from "@/lib/prisma";
import { getText } from "@/lib/site-texte";

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

// Hier stand eine Tabelle "EMS bei Körperformen gegen klassisches
// Studio". Fitnessstudios schlechtzumachen ist nicht unser Stil - die
// Zeilen nennen jetzt nur, was die Woche mit EMS tatsächlich kostet.
const zeitaufwand = [
  { label: "Training pro Woche", wert: "20 Minuten" },
  { label: "Termine pro Woche", wert: "einer, fest eingeplant" },
  { label: "Umziehen", wert: "einmal pro Woche" },
  { label: "Planung des Trainings", wert: "übernimmt dein Trainer" },
  { label: "Erholung", wert: "eine Woche bis zur nächsten Einheit" },
];

export default async function PreisePage() {
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("preise"))) return notFound();

  const [tarife, angebote, preisHinweis] = await Promise.all([
    prisma.tarif.findMany({
      where: { aktiv: true },
      // Zweites Sortierkriterium: Bei gleicher Reihenfolge darf die
      // Datenbank die Karten sonst zwischen zwei Aufrufen tauschen.
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        untertitel: true,
        preis: true,
        preisZusatz: true,
        leistungen: true,
        empfohlen: true,
        hinweis: true,
      },
    }),
    prisma.zusatzangebot.findMany({
      where: { aktiv: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, text: true, preis: true, symbol: true, nurStudios: true },
    }),
    getText("preis-hinweis"),
  ]);

  // Ohne Tarife bleibt die Seite genau so, wie sie ist: Sie erklärt dann
  // weiterhin, warum hier keine Preisliste steht. Das ist eine Haltung
  // des Studios und keine Lücke - deshalb entfällt in dem Fall auch der
  // Abschnitt darüber nicht.
  const mitTarifen: TarifAnzeige[] = tarife;

  return (
    <>
      <PageHeader
        kicker="Konditionen"
        title={<>Faire <span className="text-accent">Preise</span></>}
        intro="Jedes Trainingsziel ist anders - deshalb besprechen wir dein persönliches Paket direkt bei deinem kostenlosen Probetermin. So zahlst du nur für das, was wirklich zu dir passt."
      />

      {/* Die Tarife stehen ganz oben, sobald es welche gibt: Wer die
          Preisseite öffnet, sucht eine Zahl. Alles Erklärende darunter
          bleibt trotzdem stehen - es beantwortet die nächste Frage. */}
      <TarifVergleich tarife={mitTarifen} hinweis={preisHinweis} />
      <PreisProblem />

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

      <ImpulsTrenner variante="a" className="mx-auto max-w-6xl px-6" />

      <section className="bg-surface py-20 sm:py-24 md:py-32">
        <Container>
          <SectionHeader
            kicker="Transparenz"
            title="Warum hier keine Preisliste steht"
            // Vorher: "Eine ehrliche Antwort: Weil eine Zahl ohne
            // Zusammenhang wenig aussagt." Wer einen Satz mit "ehrlich
            // gesagt" beginnt, lenkt von der Aussage ab. Die vier Karten
            // darunter beantworten die Frage bereits.
            intro="Vier Dinge entscheiden über den Beitrag."
            className="mb-14"
          />

          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {priceFactors.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="karte-hebt karte-glanz h-full card p-7">
                  <div className="karte-symbol flex h-11 w-11 items-center justify-center rounded-full bg-lime/10 text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Aus einem Absatz wurden drei Zusagen. Derselbe Inhalt, aber
              lesbar, ohne ihn zu lesen - und was dahinter steckt, steht
              eine Ebene tiefer für die, die es wissen wollen. */}
          <Reveal delay={0.1} className="mt-12 card p-8">
            <p className="text-sm font-semibold">Das Angebot bekommst du schriftlich</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                "Alle Zahlen auf Papier",
                "Keine versteckten Zusatzkosten",
                "Keine Entscheidung vor Ort",
              ].map((zusage) => (
                <li key={zusage} className="flex items-start gap-2.5 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                  {zusage}
                </li>
              ))}
            </ul>
            {/* Bewusst nichts Neues: Der Aufklapper sagt dasselbe wie der
                Absatz, der vorher hier stand - nur ausführlicher. Eine
                zusätzliche Zusage an dieser Stelle wäre eine Zusage, die
                das Studio nie gegeben hat. */}
            <MehrDazu titel="Was heißt das genau?" className="mt-5">
              <p>
                Am Ende des Probetermins bekommst du dein Angebot schriftlich mit &ndash;
                mit allen Zahlen, ohne Kleingedrucktes und ohne Posten, über die vorher
                nicht gesprochen wurde.
              </p>
              <p>
                Entschieden wird nicht an Ort und Stelle. Du nimmst das Angebot mit und
                überlegst in Ruhe.
              </p>
            </MehrDazu>
          </Reveal>
        </Container>
      </section>

      <Zusatzangebote angebote={angebote} />

      <section className="on-ink py-20 sm:py-24 md:py-32">
        <Container>
          {/* Sieben Balken, einer davon ist die Einheit - das ist genau
              die Aussage des Abschnitts, nur als Bild. */}
          <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <SectionHeader
              kicker="Dein Zeitaufwand"
              title="Was dich EMS an Zeit kostet"
              intro="Geld ist das eine - Zeit das andere. So sieht deine Woche mit EMS aus."
            />
            <ImpulsSzene name="woche" className="mx-auto hidden w-full max-w-[220px] md:block" />
          </div>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {zeitaufwand.map((zeile) => (
              <StaggerItem key={zeile.label}>
                <div className="h-full border-t border-lime/40 pt-4">
                  <p className="text-sm text-muted">{zeile.label}</p>
                  <p className="mt-1 text-lg font-semibold">{zeile.wert}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <DirekterKontakt />

      <FaqSection />

      <WegLeiste aktuell="entscheiden" />
    </>
  );
}
