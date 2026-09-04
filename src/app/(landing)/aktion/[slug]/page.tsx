import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getStudios, getUpcomingSlots } from "@/lib/data";
import { getCampaign, getCampaignSlugs } from "@/lib/campaigns";
import { formatDateShort } from "@/lib/format";

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

  const [studios, slots] = await Promise.all([getStudios(), getUpcomingSlots()]);

  const slotsByStudio: Record<
    string,
    { dateKey: string; dateLabel: string; slots: { id: string; startTime: string; endTime: string }[] }[]
  > = {};

  for (const slot of slots) {
    if (Number.isNaN(slot.date.getTime())) continue;
    const dayMap = (slotsByStudio[slot.studioId] ??= []);
    const dateKey = slot.date.toISOString().slice(0, 10);
    let day = dayMap.find((d) => d.dateKey === dateKey);
    if (!day) {
      day = { dateKey, dateLabel: formatDateShort(slot.date), slots: [] };
      dayMap.push(day);
    }
    day.slots.push({ id: slot.id, startTime: slot.startTime, endTime: slot.endTime });
  }

  const studio = studios[0];

  return (
    <>
      <section className="border-b border-border py-16 md:py-24">
        <Container className="max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            {campaign.kicker}
          </span>
          <h1 className="mt-4 text-balance hyphens-auto text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {campaign.headline}{" "}
            <span className="text-lime">{campaign.highlight}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {campaign.subline}
          </p>

          <ul className="mt-10 space-y-4">
            {campaign.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-lime">
                  <Check size={13} strokeWidth={3} />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 md:py-24">
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

          <div className="mt-10 grid gap-4 border-t border-border pt-8 text-sm text-muted sm:grid-cols-3">
            <p className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-lime" />
              Ohne Vertragsbindung
            </p>
            <p className="flex items-start gap-2.5">
              <Clock size={16} className="mt-0.5 shrink-0 text-lime" />
              20 Minuten pro Einheit
            </p>
            {studio && (
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-lime" />
                {studio.postalCode} {studio.city}
              </p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
