import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImpulsMotiv } from "@/components/ui/impuls-motiv";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { BookingFlow } from "@/components/booking/booking-flow";
import { TrustBar } from "@/components/trust-bar";
import { BeweisLeiste } from "@/components/beweis-leiste";
import { AuszeichnungMarke } from "@/components/auszeichnung/auszeichnung";
import { getStudios } from "@/lib/data";
import { getCampaign, getCampaignSlugs } from "@/lib/campaigns";
import { zielInhalt } from "@/lib/ziel-inhalte";
import { ZielProvider } from "@/components/ziel/ziel-kontext";
import { ZielMotiv } from "@/components/ziel/ziel-motiv";
import { TerminHinweise } from "@/components/booking/termin-hinweise";
import { sichtbarkeit } from "@/lib/vorschau";
import { VorschauHinweis } from "@/components/vorschau-hinweis";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getCampaignSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) return {};

  return {
    title: campaign.metaTitle,
    description: campaign.metaDescription,
    // Kampagnenseiten sollen nicht mit den regulären Seiten um Google-
    // Platzierungen konkurrieren - der Verkehr kommt aus bezahlter Werbung.
    robots: { index: false, follow: true },
  };
}

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) return notFound();
  // Vorbereitete Aktionen: öffentlich erst mit Schalter, vorher nur für
  // angemeldete Admins als Vorschau.
  const stand = campaign.schalter ? await sichtbarkeit(campaign.schalter) : "live";
  if (stand === "aus") return notFound();

  const studios = await getStudios();

  const studio = studios[0];
  const ziel = zielInhalt(campaign.ziel);

  return (
    // Mit Ziel steht es im Formular schon fest (ZielProvider fest=...).
    <ZielProvider fest={ziel?.wert}>
      {stand === "vorschau" && <VorschauHinweis />}
      {/* Auch die Kampagnenseite bekommt das Motiv: Wer über eine Anzeige
          kommt, sieht als Erstes DIESE Seite - und sie sah bisher aus wie
          ein Textdokument, während die Startseite eine Website ist. Das
          ist ausgerechnet die Seite, für die Geld ausgegeben wird. */}
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        {ziel ? (
          // Zur Kampagne mit Ziel gehört das Motiv dieses Ziels - dasselbe
          // wie auf der Startseite und der Zielseite.
          <div
            aria-hidden
            className="kal-karte on-ink pointer-events-none absolute right-[max(1.5rem,calc((100vw-72rem)/2))] top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-[2rem] p-8 lg:block"
          >
            <ZielMotiv ziel={ziel.wert} className="h-full w-full" />
          </div>
        ) : (
          <div
            aria-hidden
            className="zierde-ruht pointer-events-none absolute -right-20 top-1/2 hidden w-[380px] -translate-y-1/2 opacity-50 lg:block"
          >
            <ImpulsMotiv className="w-full" />
          </div>
        )}
        <Container className="relative max-w-4xl">
          <span className="hero-anim flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent"
            style={{ "--hero-delay": "0.05s" } as React.CSSProperties}
          >
            <span aria-hidden className="strich-waechst h-px w-8 bg-accent/50" style={{ "--hero-delay": "0.18s" } as React.CSSProperties} />
            {campaign.kicker}
          </span>
          <h1 className="hero-anim mt-4 text-balance hyphens-auto text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
            style={{ "--hero-delay": "0.14s" } as React.CSSProperties}
          >
            {campaign.headline}{" "}
            <span className="text-accent-strong">{campaign.highlight}</span>
          </h1>
          <p className="hero-anim mt-6 max-w-xl text-lg leading-relaxed text-muted"
            style={{ "--hero-delay": "0.26s" } as React.CSSProperties}
          >
            {campaign.subline}
          </p>

          <ul className="mt-10 space-y-4">
            {campaign.bullets.map((bullet, i) => (
              <li key={bullet} className="hero-anim flex items-start gap-3 text-sm sm:text-base"
                style={{ "--hero-delay": `${0.36 + i * 0.08}s` } as React.CSSProperties}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-accent">
                  <Check size={13} strokeWidth={3} />
                </span>
                {bullet}
              </li>
            ))}
          </ul>

          {/* Die Aufzählung darüber sagt, was das Training bringt. Hier
              steht, ob und wann man überhaupt hinkommt - die Frage, die
              zwischen "klingt gut" und "ich trag mich ein" steht. Diese
              Seite kostet Geld pro Klick; sie ist die letzte, auf der
              eine Antwort darauf fehlen sollte. */}
          <BeweisLeiste className="hero-anim mt-10 max-w-xl" />
          {/* Landingpages haben keinen Abschnitt mit der Auszeichnung -
              die Plakette verweist deshalb direkt auf die Studie. */}
          <AuszeichnungMarke aufStartseite={false} className="hero-anim mt-4" />
        </Container>
      </section>

      {ziel ? (
        <section className="border-b border-border bg-surface py-12 md:py-16">
          <Container className="max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Erkennst du dich wieder?</h2>
            <ul className="mt-6 space-y-3">
              {ziel.erkennst.map((satz) => (
                <li key={satz} className="flex gap-3 text-base sm:text-lg">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {satz}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-muted">{ziel.antwort}</p>
          </Container>
        </section>
      ) : (
        <ImpulsTrenner variante="b" className="mx-auto max-w-4xl px-6" />
      )}

      <section className="py-12 md:py-16">
        <Container className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {campaign.formTitle}
          </h2>
          <p className="mt-3 text-muted">
            Trag dich ein, wir melden uns zur Bestätigung. Kostenlos und
            unverbindlich - es entsteht keinerlei Verpflichtung.
          </p>

          <div className="mt-10">
            <BookingFlow studios={studios} />
          </div>
          <div>
            <TerminHinweise />
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <TrustBar />
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <p className="flex items-center gap-2.5">
                <Clock size={16} className="shrink-0 text-accent" />
                20 Minuten pro Einheit
              </p>
              {studio && (
                <p className="flex items-center gap-2.5">
                  <MapPin size={16} className="shrink-0 text-accent" />
                  {studio.postalCode} {studio.city}
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>
    </ZielProvider>
  );
}
