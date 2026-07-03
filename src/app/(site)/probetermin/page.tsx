import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { BookingForm } from "@/components/booking/booking-form";
import { LottieBox } from "@/components/lottie-box";
import { getUpcomingSlots } from "@/lib/data";
import { formatDateShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "Probetermin buchen",
  description: "Sichere dir deinen kostenlosen und unverbindlichen EMS-Probetermin bei Körperformen.",
};

export default async function ProbeterminPage() {
  const slots = await getUpcomingSlots();

  const dayMap = new Map<
    string,
    { dateKey: string; dateLabel: string; slots: { id: string; startTime: string; endTime: string }[] }
  >();

  for (const slot of slots) {
    const dateKey = slot.date.toISOString().slice(0, 10);
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        dateKey,
        dateLabel: formatDateShort(slot.date),
        slots: [],
      });
    }
    dayMap.get(dateKey)!.slots.push({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  }

  const days = Array.from(dayMap.values());

  return (
    <section className="py-20">
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
          <BookingForm days={days} />
        </div>
      </Container>
    </section>
  );
}
