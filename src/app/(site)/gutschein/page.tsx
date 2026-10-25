import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gift, Mail, Store } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact-form";
import { Logo } from "@/components/logo";
import { VorschauHinweis } from "@/components/vorschau-hinweis";
import { GUTSCHEINE } from "@/lib/gutschein";
import { sichtbarkeit } from "@/lib/vorschau";
import { isVisible } from "@/lib/site-toggles";

/**
 * "Gutschein verschenken" - für Weihnachten vorbereitet.
 *
 * Öffentlich erst, wenn im Adminbereich unter "Sichtbarkeit" die
 * Gutscheine eingeschaltet sind; vorher nur für angemeldete Admins als
 * Vorschau (siehe @/lib/vorschau). Angebote und Preise: @/lib/gutschein.
 */

export async function generateMetadata(): Promise<Metadata> {
  const live = await isVisible("gutschein");
  return {
    title: "Gutschein verschenken",
    description:
      "EMS-Training verschenken: Gutscheine für Körperformen in Köln und Umgebung – anfragen, im Studio bezahlen, ausdrucken oder abholen.",
    alternates: { canonical: "/gutschein" },
    // Solange die Seite nur Vorschau ist, soll sie nirgends auftauchen.
    ...(live ? {} : { robots: { index: false, follow: false } }),
  };
}

const ABLAUF = [
  {
    icon: Mail,
    titel: "Anfragen",
    text: "Sag uns unten, welchen Gutschein du verschenken möchtest – und für wen, wenn er einen Namen tragen soll.",
  },
  {
    icon: Store,
    titel: "Bezahlen",
    text: "Wir melden uns und klären alles Weitere. Bezahlt wird im Studio oder per Überweisung.",
  },
  {
    icon: Gift,
    titel: "Verschenken",
    text: "Du bekommst den Gutschein zum Ausdrucken – oder holst ihn schön verpackt im Studio ab.",
  },
];

export default async function GutscheinSeite() {
  const stand = await sichtbarkeit("gutschein");
  if (stand === "aus") notFound();

  return (
    <>
      {stand === "vorschau" && <VorschauHinweis />}
      <PageHeader
        kicker="Geschenkidee"
        title={
          <>
            Verschenk <span className="text-accent">20 Minuten</span>, die bleiben
          </>
        }
        intro="Ein Gutschein für EMS-Training bei Körperformen – für alle, die sich mehr Bewegung vornehmen und einen Anstoß gebrauchen können."
        ohneMotiv
      >
        {/* Der Gutschein selbst, als Bild: so sieht das Geschenk aus. */}
        <div className="on-ink mt-10 max-w-md -rotate-2 rounded-3xl bg-gradient-to-br from-[var(--ink)] to-[#2a3324] p-7 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <Logo className="h-8 w-auto" />
            <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-on-lime">Gutschein</span>
          </div>
          <p className="mt-10 font-display text-3xl font-black leading-tight">
            20 Minuten
            <br />
            <span className="text-[var(--ink-lime)]">nur für dich.</span>
          </p>
          <div className="mt-8 flex items-end justify-between border-t border-white/15 pt-4 text-xs text-white/70">
            <span>Für: ____________________</span>
            <span>Körperformen · Köln und Umgebung</span>
          </div>
        </div>
      </PageHeader>

      <section className="border-t border-border py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Das kannst du verschenken</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {GUTSCHEINE.map((g) => (
              <div
                key={g.titel}
                className={`card flex flex-col rounded-2xl border p-6 ${g.hervorgehoben ? "border-lime" : "border-border"}`}
              >
                <h3 className="text-lg font-semibold">{g.titel}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.text}</p>
                <p className="mt-5 font-display text-2xl font-black text-accent">{g.preis ?? "Preis auf Anfrage"}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">So einfach geht&apos;s</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {ABLAUF.map((s, i) => (
              <li key={s.titel} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime/15 text-accent">
                  <s.icon size={20} aria-hidden />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-widest text-accent">Schritt {i + 1}</span>
                  <span className="mt-1 block font-semibold">{s.titel}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="anfrage" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
        <Container className="max-w-2xl">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Gutschein anfragen</h2>
            <p className="mt-3 text-muted">Wir melden uns innerhalb von ein, zwei Werktagen.</p>
            <div className="mt-8">
              <ContactForm
                vorbelegt={{
                  subject: "Gutschein-Anfrage",
                  message: "Ich möchte gern einen Gutschein verschenken:\n\nWelcher Gutschein: \nFür (Name, optional): \nAbholen im Studio oder zum Ausdrucken: ",
                }}
              />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
