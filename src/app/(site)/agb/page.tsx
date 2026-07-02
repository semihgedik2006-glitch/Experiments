import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "AGB",
  robots: { index: false, follow: true },
};

export default function AgbPage() {
  return (
    <section className="py-20">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Allgemeine Geschäftsbedingungen</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <p className="rounded-lg border border-lime/40 bg-lime/5 p-4 text-foreground">
            Platzhalter-Inhalt. Bitte diese AGB vor dem Livegang durch einen
            Rechtsanwalt prüfen und an eure tatsächlichen Vertrags-,
            Kündigungs- und Zahlungsbedingungen anpassen.
          </p>

          <div>
            <h2 className="font-semibold text-foreground">1. Geltungsbereich</h2>
            <p className="mt-2">
              Diese Allgemeinen Geschäftsbedingungen gelten für alle
              Vertragsverhältnisse zwischen {siteConfig.name} und seinen
              Kundinnen und Kunden im Zusammenhang mit EMS-Trainingsleistungen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">2. Vertragsschluss</h2>
            <p className="mt-2">
              Ein Vertrag kommt zustande, sobald Studio und Kunde sich im
              persönlichen Gespräch (z.B. beim Probetermin) auf ein
              individuelles Trainingspaket und die zugehörigen Konditionen
              geeinigt haben.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">3. Laufzeit &amp; Kündigung</h2>
            <p className="mt-2">
              Laufzeit und Kündigungsfristen der Mitgliedschaft werden
              individuell im Vertrag festgehalten und dem Kunden schriftlich
              mitgeteilt.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">4. Zahlungsbedingungen</h2>
            <p className="mt-2">
              Die vereinbarten Trainingsgebühren sind, sofern nicht anders
              vereinbart, monatlich im Voraus fällig.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">5. Haftung</h2>
            <p className="mt-2">
              Das Training erfolgt auf eigene Verantwortung. Kundinnen und
              Kunden bestätigen vor Trainingsbeginn ihre gesundheitliche
              Eignung für EMS-Training bzw. legen ein ärztliches Attest vor,
              sofern erforderlich.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">6. Schlussbestimmungen</h2>
            <p className="mt-2">
              Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die
              Wirksamkeit der übrigen Bestimmungen unberührt. Es gilt das
              Recht der Bundesrepublik Deutschland.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
