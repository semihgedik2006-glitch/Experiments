import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { Sprache } from "@/lib/sprache";

const steps = [
  {
    step: "01",
    heading: "Nacken & Schultern",
    text: "Die Impulse lösen zuerst Verspannungen in Schultern und Nacken - typische Problemzonen bei Bürojobs.",
  },
  {
    step: "02",
    heading: "Brust & Rücken",
    text: "Brust und Rücken arbeiten gleichzeitig statt nacheinander - bei einer Übung, für die sonst zwei Geräte nötig wären.",
  },
  {
    step: "03",
    heading: "Bauch & Rumpf",
    text: "Die tiefliegende Rumpfmuskulatur wird mittrainiert - für einen stabilen Kern und einen strafferen Bauch.",
  },
  {
    step: "04",
    heading: "Voll aktiviert",
    text: "Am Ende ist der ganze Körper einmal durch - deshalb ist die Einheit kurz und deshalb liegt eine Woche dazwischen.",
  },
];

// Auf Englisch ohne "löst Verspannungen" und "strafferer Bauch": beschrieben
// wird, welche Muskeln arbeiten, nicht was dabei herauskommt.
const stepsEn: typeof steps = [
  {
    step: "01",
    heading: "Neck & shoulders",
    text: "The impulses start with your shoulders and neck - a typical problem area for anyone with a desk job.",
  },
  {
    step: "02",
    heading: "Chest & back",
    text: "Chest and back work at the same time instead of one after the other - in one exercise that would otherwise need two machines.",
  },
  {
    step: "03",
    heading: "Abs & core",
    text: "The deep core muscles are trained along with everything else.",
  },
  {
    step: "04",
    heading: "Fully activated",
    text: "By the end your whole body has had its turn - that is why the session is short and why there is a week in between.",
  },
];

export function ActivationSequence({ sprache = "de" }: { sprache?: Sprache }) {
  const en = sprache === "en";
  return (
    <section className="border-t border-border py-24">
      <Container>
        <Reveal className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {en ? "During training" : "Im Training"}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {en ? "What happens in your body" : "Was dabei in deinem Körper passiert"}
          </h2>
          <p className="mt-4 text-muted">
            {en
              ? "The vest activates your muscle groups one after another - from top to bottom, until your whole body is working."
              : "Die Weste aktiviert deine Muskelgruppen nacheinander - von oben nach unten, bis der ganze Körper arbeitet."}
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {(en ? stepsEn : steps).map((item) => (
            <StaggerItem key={item.step}>
              <div className="border-t border-border pt-6">
                <span className="text-sm font-bold tracking-widest text-accent">
                  {item.step}
                </span>
                <h3 className="mt-3 text-xl font-bold tracking-tight">{item.heading}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-14">
          <Button href="/probetermin">{en ? "Book your trial session now" : "Jetzt Probetermin buchen"}</Button>
        </Reveal>
      </Container>
    </section>
  );
}
