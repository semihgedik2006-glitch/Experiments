import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function CtaBanner() {
  return (
    <section className="border-t border-border py-24">
      <Container>
        <Reveal className="flex flex-col items-center rounded-3xl bg-foreground px-6 py-16 text-center text-background">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
            Bereit für deine erste Einheit?
          </h2>
          <p className="mt-4 max-w-md text-background/70">
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
