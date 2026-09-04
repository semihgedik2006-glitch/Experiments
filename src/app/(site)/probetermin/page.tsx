import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { BookingFlow } from "@/components/booking/booking-flow";
import { LottieBox } from "@/components/lottie-box";
import { TrustBar } from "@/components/trust-bar";
import { getStudios, getUpcomingSlots } from "@/lib/data";
import { formatDateShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "Probetermin buchen",
  description: "Sichere dir deinen kostenlosen und unverbindlichen EMS-Probetermin bei Körperformen.",
};

export default async function ProbeterminPage() {
  const [studios, slots] = await Promise.all([getStudios(), getUpcomingSlots()]);

  const slotsByStudio: Record<
    string,
    { dateKey: string; dateLabel: string; slots: { id: string; startTime: string; endTime: string }[] }[]
  > = {};

  for (const slot of slots) {
    if (Number.isNaN(slot.date.getTime())) continue; // skip slots with a corrupt date

    const dayMap = (slotsByStudio[slot.studioId] ??= []);
    const dateKey = slot.date.toISOString().slice(0, 10);
    let day = dayMap.find((d) => d.dateKey === dateKey);
    if (!day) {
      day = { dateKey, dateLabel: formatDateShort(slot.date), slots: [] };
      dayMap.push(day);
    }
    day.slots.push({ id: slot.id, startTime: slot.startTime, endTime: slot.endTime });
  }

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
          Kostenloser <span className="text-lime">Probetermin</span>
        </h1>
        <p className="mt-4 text-muted">
          Wähle einen passenden Termin und lerne EMS-Training unverbindlich
          kennen. Wir bestätigen deinen Wunschtermin anschließend persönlich.
        </p>

        <LottieBox src="/lottie/booking.json" className="mx-auto w-full max-w-xs" />

        <div className="mt-6">
          <BookingFlow studios={studios} slotsByStudio={slotsByStudio} />
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm font-semibold">Was du wissen solltest</p>
          <TrustBar className="mt-5" />
        </div>
      </Container>
    </section>
  );
}
