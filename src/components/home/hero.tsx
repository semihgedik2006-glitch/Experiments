import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-lime), transparent 70%)" }}
      />

      <Container className="relative flex flex-col items-center py-28 text-center md:py-40">
        <span className="mb-6 rounded-full border border-border px-4 py-1 text-xs uppercase tracking-widest text-muted">
          EMS-Studio in Hürth &middot; Köln &middot; Brühl
        </span>

        <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
          20 Minuten Training.
          <br />
          <span className="text-lime">Ein sichtbarer Unterschied.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted">
          Effektives EMS-Training für Berufstätige mit wenig Zeit. Einmal pro
          Woche, gelenkschonend, individuell betreut - bei Körperformen.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
          <Button href="/studio" variant="secondary">
            Studio finden
          </Button>
        </div>
      </Container>
    </section>
  );
}
