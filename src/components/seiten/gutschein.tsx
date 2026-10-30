import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, CreditCard, Gift, Mail, Store } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact-form";
import { Logo } from "@/components/logo";
import { VorschauHinweis } from "@/components/vorschau-hinweis";
import Link from "next/link";
import {
  GUTSCHEINE,
  GUTSCHEINE_EN,
  WEIHNACHTSAKTION,
  WEIHNACHTSAKTION_EN,
  gutscheinKaufUrl,
  gutscheinZahlweg,
} from "@/lib/gutschein";
import { gutscheinBeiStripeKaufen } from "@/lib/actions/gutschein-kauf";
import { getAdminSession } from "@/lib/auth";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { sichtbarkeit } from "@/lib/vorschau";
import { isVisible } from "@/lib/site-toggles";

/**
 * "Gutschein verschenken" - mit der Weihnachtsaktion 2026 (4 Wochen / 90 €,
 * Kauf über Digistore24, siehe @/lib/gutschein).
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
            "Christmas offer: 4 weeks of EMS training with a personal trainer for €90 – buy online, give it as a gift or use it yourself. Körperformen in and around Cologne.",
        }
      : {
          title: "Gutschein verschenken",
          description:
            "Weihnachtsaktion: 4 Wochen EMS-Training mit persönlichem Trainer für 90 € – online kaufen, verschenken oder selbst nutzen. Körperformen in Köln und Umgebung.",
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

/** Der Ablauf, wenn online über Digistore24 gekauft wird. */
const ABLAUF_ONLINE: typeof ABLAUF = [
  {
    icon: CreditCard,
    titel: "Kaufen",
    text: "Über den Knopf oben sicher online bezahlen.",
  },
  {
    icon: Mail,
    titel: "PDF bekommen",
    text: "Der Gutschein kommt direkt per E-Mail zum Ausdrucken oder Weiterleiten.",
  },
  {
    icon: Gift,
    titel: "Einlösen",
    text: "Die beschenkte Person meldet sich im Studio und vereinbart ihren ersten Termin.",
  },
];

const ABLAUF_ONLINE_EN: typeof ABLAUF = [
  {
    icon: CreditCard,
    titel: "Buy",
    text: "Pay securely online with the button above.",
  },
  {
    icon: Mail,
    titel: "Get the PDF",
    text: "The voucher arrives by email, ready to print or forward.",
  },
  {
    icon: Gift,
    titel: "Redeem",
    text: "The recipient contacts the studio and books their first session.",
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

export async function GutscheinSeite({
  sprache,
  zahlungVorschau = null,
}: {
  sprache: Sprache;
  /** ?zahlung=stripe|digistore - wirkt nur für angemeldete Admins. */
  zahlungVorschau?: string | null;
}) {
  const en = sprache === "en";
  const stand = await sichtbarkeit("gutschein");
  if (stand === "aus") notFound();
  // Stripe oder Digistore24 - siehe gutscheinZahlweg in @/lib/gutschein.
  const admin = await getAdminSession();
  const zahlweg = gutscheinZahlweg(admin ? zahlungVorschau : null);
  const kaufUrl = zahlweg === "digistore" ? gutscheinKaufUrl() : null;
  const online = zahlweg !== "anfrage";
  const aktion = en ? WEIHNACHTSAKTION_EN : WEIHNACHTSAKTION;
  const ablauf = online ? (en ? ABLAUF_ONLINE_EN : ABLAUF_ONLINE) : en ? ABLAUF_EN : ABLAUF;

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
              {en ? "4 weeks of EMS" : "4 Wochen EMS"}
            <br />
            <span className="text-[var(--ink-lime)]">{en ? "just for you." : "nur für dich."}</span>
          </p>
          <div className="mt-8 flex items-end justify-between border-t border-white/15 pt-4 text-xs text-white/70">
            <span>{en ? "For" : "Für"}: ____________________</span>
            <span>{en ? "Körperformen · Cologne area" : "Körperformen · Köln und Umgebung"}</span>
          </div>
        </div>
      </PageHeader>

      {/* Die Weihnachtsaktion - das, worauf die Anzeigen führen. */}
      <section id="aktion" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
        <Container>
          <div className="on-ink grid gap-8 rounded-3xl bg-[var(--ink)] p-7 text-white sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-lime)]">{aktion.kicker}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {aktion.titel} <span className="whitespace-nowrap text-[var(--ink-lime)]">{en ? "for" : "für"} {aktion.preis}</span>
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/80">{aktion.text}</p>
              <ul className="mt-6 space-y-2">
                {aktion.punkte
                  // Über Stripe kommt eine Karte mit Code zum Ausdrucken, kein PDF.
                  .map((punkt) =>
                    zahlweg === "stripe" ? punkt.replace("als PDF", "mit Code").replace("as a PDF", "with a code") : punkt,
                  )
                  .map((punkt) => (
                  <li key={punkt} className="flex items-start gap-2 text-white/85">
                    <Check size={18} className="mt-0.5 shrink-0 text-[var(--ink-lime)]" aria-hidden />
                    {punkt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <p className="font-display text-5xl font-black text-[var(--ink-lime)]">{aktion.preis}</p>
              <p className="mt-1 text-sm text-white/70">{en ? "one-off, incl. VAT" : "einmalig, inkl. MwSt."}</p>
              {zahlweg === "stripe" ? (
                <form action={gutscheinBeiStripeKaufen}>
                  <input type="hidden" name="sprache" value={sprache} />
                  <button
                    type="submit"
                    className="mt-6 flex w-full items-center justify-center rounded-full bg-lime px-6 py-3.5 font-semibold text-on-lime transition-transform hover:scale-[1.02]"
                  >
                    {aktion.kaufen}
                  </button>
                </form>
              ) : kaufUrl ? (
                <a
                  href={kaufUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-lime px-6 py-3.5 font-semibold text-on-lime transition-transform hover:scale-[1.02]"
                >
                  {aktion.kaufen}
                </a>
              ) : (
                <a
                  href="#anfrage"
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-lime px-6 py-3.5 font-semibold text-on-lime transition-transform hover:scale-[1.02]"
                >
                  {en ? "Request the voucher" : "Gutschein anfragen"}
                </a>
              )}
              <p className="mt-3 text-xs leading-relaxed text-white/60">
                {zahlweg === "stripe" ? (
                  <>
                    {en
                      ? "Secure payment via Stripe – card and other payment methods. The voucher with its code arrives by email right away. "
                      : "Sichere Bezahlung über Stripe – mit Karte und weiteren Zahlarten. Der Gutschein mit Code kommt sofort per E-Mail. "}
                    <Link href="/agb" className="underline">
                      {en ? "Terms" : "AGB"}
                    </Link>
                    {" · "}
                    <Link href="/widerruf" className="underline">
                      {en ? "Right of withdrawal" : "Widerrufsbelehrung"}
                    </Link>
                  </>
                ) : kaufUrl
                  ? aktion.hinweisKauf
                  : en
                    ? "Online purchase coming soon – until then we arrange everything personally."
                    : "Online-Kauf folgt in Kürze – bis dahin klären wir alles persönlich mit dir."}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{en ? "Other vouchers" : "Weitere Gutscheine"}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
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
            {ablauf.map((s, i) => (
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
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {online ? (en ? "Questions or another voucher?" : "Fragen oder ein anderer Gutschein?") : en ? "Request a voucher" : "Gutschein anfragen"}
            </h2>
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
