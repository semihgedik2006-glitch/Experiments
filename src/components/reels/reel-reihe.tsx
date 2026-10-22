import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ReelKarte } from "@/components/reels/reel-karte";
import type { Reel } from "@/lib/reels";

/**
 * Mehrere Reels nebeneinander - "So sieht's bei uns aus".
 *
 * Echte Menschen in echten Studios sagen mehr als jede Grafik (Nielsen
 * Norman Group: Nutzer übergehen Dekobilder, echte Personen schauen sie
 * sich lange an). Auf dem Handy eine Reihe zum Wischen, am Computer vier
 * nebeneinander.
 */
export function ReelReihe({
  reels,
  kicker = "Aus unseren Studios",
  titel = "So sieht's bei uns aus",
  intro = "Kurz erklärt von Trainerinnen und Trainern – mit Untertiteln, auch ohne Ton verständlich.",
}: {
  reels: Reel[];
  kicker?: string;
  titel?: string;
  intro?: string;
}) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <Container>
        <SectionHeader kicker={kicker} title={titel} intro={intro} className="mb-10 sm:mb-12" />
        <div
          className={`-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 ${
            reels.length > 2 ? "lg:grid-cols-4" : "sm:max-w-2xl"
          }`}
        >
          {reels.map((reel) => (
            <ReelKarte key={reel.id} reel={reel} className="w-[62%] shrink-0 snap-start sm:w-auto" />
          ))}
        </div>
      </Container>
    </section>
  );
}
