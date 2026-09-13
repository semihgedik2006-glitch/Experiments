import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImpulsMotiv } from "@/components/ui/impuls-motiv";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { BookingFlow } from "@/components/booking/booking-flow";
import { TrustBar } from "@/components/trust-bar";
import { BeweisLeiste } from "@/components/beweis-leiste";
import { getStudios, getSlotsMitBelegung } from "@/lib/data";
import { getCampaign, getCampaignSlugs } from "@/lib/campaigns";
import { tageJeStudio } from "@/lib/termin-tage";

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

  const [studios, slots] = await Promise.all([getStudios(), getSlotsMitBelegung()]);

  const slotsByStudio = tageJeStudio(slots);

  const studio = studios[0];

  return (
    <>
      {/* Auch die Kampagnenseite bekommt das Motiv: Wer über eine Anzeige
          kommt, sieht als Erstes DIESE Seite - und sie sah bisher aus wie
          ein Textdokument, während die Startseite eine Website ist. Das
          ist ausgerechnet die Seite, für die Geld ausgegeben wird. */}
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div
          aria-hidden
          className="zierde-ruht pointer-events-none absolute -right-20 top-1/2 hidden w-[380px] -translate-y-1/2 opacity-50 lg:block"
        >
          <ImpulsMotiv className="w-full" />
        </div>
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
        </Container>
      </section>

      <ImpulsTrenner variante="b" className="mx-auto max-w-4xl px-6" />

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
            <BookingFlow studios={studios} slotsByStudio={slotsByStudio} />
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
    </>
  );
}
