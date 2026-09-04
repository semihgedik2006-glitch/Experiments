import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function CtaBanner() {
  return (
    <section className="on-ink pt-24 pb-24 sm:pt-28 md:pt-36">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Bereit für deine erste Einheit?
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Sichere dir jetzt deinen kostenlosen und unverbindlichen Probetermin.
          </p>
          <Button href="/probetermin" className="mt-8">
            Probetermin buchen
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
