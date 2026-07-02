import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getStudio } from "@/lib/data";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false, follow: true },
};

export default async function ImpressumPage() {
  const studio = await getStudio();

  return (
    <section className="py-20">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Impressum</h1>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
          <p className="rounded-lg border border-lime/40 bg-lime/5 p-4 text-foreground">
            Platzhalter-Inhalt. Bitte ersetze diese Angaben durch die
            rechtlich korrekten Pflichtangaben gemäß § 5 TMG, bevor die Seite
            live geht.
          </p>

          <div>
            <h2 className="font-semibold text-foreground">Angaben gemäß § 5 TMG</h2>
            <p className="mt-2">
              {studio?.name ?? "Körperformen"}
              <br />
              {studio?.street ?? "Musterstraße 1"}
              <br />
              {studio?.postalCode ?? "50354"} {studio?.city ?? "Hürth"}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Kontakt</h2>
            <p className="mt-2">
              Telefon: {studio?.phone ?? "+49 2233 000000"}
              <br />
              E-Mail: {studio?.email ?? "info@koerperformen.com"}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Umsatzsteuer-ID</h2>
            <p className="mt-2">
              Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz: [bitte ergänzen]
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Verantwortlich für den Inhalt</h2>
            <p className="mt-2">
              gemäß § 55 Abs. 2 RStV: [Name, Anschrift ergänzen]
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Streitschlichtung</h2>
            <p className="mt-2">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/.
              Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
