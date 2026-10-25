import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gift, Mail, Store } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact-form";
import { Logo } from "@/components/logo";
import { VorschauHinweis } from "@/components/vorschau-hinweis";
import { GUTSCHEINE, GUTSCHEINE_EN } from "@/lib/gutschein";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { sichtbarkeit } from "@/lib/vorschau";
import { isVisible } from "@/lib/site-toggles";

/**
 * "Gutschein verschenken" - für Weihnachten vorbereitet.
 *
 * Öffentlich erst, wenn im Adminbereich unter "Sichtbarkeit" die
 * Gutscheine eingeschaltet sind; vorher nur für angemeldete Admins als
 * Vorschau (siehe @/lib/vorschau). Angebote und Preise: @/lib/gutschein.
 */

export async function gutscheinMetadaten(sprache: Sprache): Promise<Metadata> {
  const live = await isVisible("gutschein");
  return seitenMetadaten(sprache, "/gutschein", {
    ...(sprache === "en"
      ? {
          title: "Give a voucher",
          description:
            "Give EMS training as a gift: vouchers for Körperformen in and around Cologne – request one, pay at the studio, print it or pick it up.",
        }
      : {
          title: "Gutschein verschenken",
          description:
            "EMS-Training verschenken: Gutscheine für Körperformen in Köln und Umgebung – anfragen, im Studio bezahlen, ausdrucken oder abholen.",
        }),
    // Solange die Seite nur Vorschau ist, soll sie nirgends auftauchen.
    ...(live ? {} : { robots: { index: false, follow: false } }),
  });
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

const ABLAUF_EN: typeof ABLAUF = [
  {
    icon: Mail,
    titel: "Request",
    text: "Tell us below which voucher you would like to give – and for whom, if it should carry a name.",
  },
  {
    icon: Store,
    titel: "Pay",
    text: "We get in touch and sort out the rest. You pay at the studio or by bank transfer.",
  },
  {
    icon: Gift,
    titel: "Give it",
    text: "You get the voucher to print out – or pick it up nicely wrapped at the studio.",
  },
];

export async function GutscheinSeite({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  const stand = await sichtbarkeit("gutschein");
  if (stand === "aus") notFound();

  return (
    <>
      {stand === "vorschau" && <VorschauHinweis />}
      <PageHeader
        kicker={en ? "Gift idea" : "Geschenkidee"}
        title={
          en ? (
            <>
              Give <span className="text-accent">20 minutes</span> that last
            </>
          ) : (
            <>
              Verschenk <span className="text-accent">20 Minuten</span>, die bleiben
            </>
          )
        }
        intro={
          en
            ? "A voucher for EMS training at Körperformen – for anyone who wants to move more and could use a little nudge."
            : "Ein Gutschein für EMS-Training bei Körperformen – für alle, die sich mehr Bewegung vornehmen und einen Anstoß gebrauchen können."
        }
        ohneMotiv
      >
        {/* Der Gutschein selbst, als Bild: so sieht das Geschenk aus. */}
        <div className="on-ink mt-10 max-w-md -rotate-2 rounded-3xl bg-gradient-to-br from-[var(--ink)] to-[#2a3324] p-7 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <Logo className="h-8 w-auto" />
            <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-on-lime">{en ? "Voucher" : "Gutschein"}</span>
          </div>
          <p className="mt-10 font-display text-3xl font-black leading-tight">
            {en ? "20 minutes" : "20 Minuten"}
            <br />
            <span className="text-[var(--ink-lime)]">{en ? "just for you." : "nur für dich."}</span>
          </p>
          <div className="mt-8 flex items-end justify-between border-t border-white/15 pt-4 text-xs text-white/70">
            <span>{en ? "For" : "Für"}: ____________________</span>
            <span>{en ? "Körperformen · Cologne area" : "Körperformen · Köln und Umgebung"}</span>
          </div>
        </div>
      </PageHeader>

      <section className="border-t border-border py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{en ? "What you can give" : "Das kannst du verschenken"}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {(en ? GUTSCHEINE_EN : GUTSCHEINE).map((g) => (
              <div
                key={g.titel}
                className={`card flex flex-col rounded-2xl border p-6 ${g.hervorgehoben ? "border-lime" : "border-border"}`}
              >
                <h3 className="text-lg font-semibold">{g.titel}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.text}</p>
                <p className="mt-5 font-display text-2xl font-black text-accent">{g.preis ?? (en ? "Price on request" : "Preis auf Anfrage")}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{en ? "It is that easy" : "So einfach geht's"}</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {(en ? ABLAUF_EN : ABLAUF).map((s, i) => (
              <li key={s.titel} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime/15 text-accent">
                  <s.icon size={20} aria-hidden />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-widest text-accent">{en ? "Step" : "Schritt"} {i + 1}</span>
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
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{en ? "Request a voucher" : "Gutschein anfragen"}</h2>
            <p className="mt-3 text-muted">
              {en ? "We will get back to you within one or two working days." : "Wir melden uns innerhalb von ein, zwei Werktagen."}
            </p>
            <div className="mt-8">
              <ContactForm
                vorbelegt={
                  en
                    ? {
                        subject: "Voucher request",
                        message:
                          "I would like to give a voucher:\n\nWhich voucher: \nFor (name, optional): \nPick up at the studio or print it out: ",
                      }
                    : {
                        subject: "Gutschein-Anfrage",
                        message:
                          "Ich möchte gern einen Gutschein verschenken:\n\nWelcher Gutschein: \nFür (Name, optional): \nAbholen im Studio oder zum Ausdrucken: ",
                      }
                }
              />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
