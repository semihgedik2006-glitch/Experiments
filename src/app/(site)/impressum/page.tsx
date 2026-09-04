import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { legalConfig, legalValue, hasMissingLegalData, MISSING } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von KörperFormen.",
};

const legalFormLabels: Record<string, string> = {
  einzelunternehmen: "Einzelunternehmen",
  gbr: "Gesellschaft bürgerlichen Rechts (GbR)",
  gmbh: "Gesellschaft mit beschränkter Haftung (GmbH)",
  ug: "Unternehmergesellschaft (haftungsbeschränkt)",
  "gmbh-co-kg": "GmbH & Co. KG",
};

export default function ImpressumPage() {
  const { companyName, owner, legalForm, address, contact, vatId } = legalConfig;
  const isCorporation =
    legalForm === "gmbh" || legalForm === "ug" || legalForm === "gmbh-co-kg";

  return (
    <section className="py-28 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Impressum</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          {hasMissingLegalData() && (
            <p className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 text-foreground">
              <strong>Hinweis an den Betreiber:</strong> In diesem Impressum fehlen
              noch Pflichtangaben (mit <em>{MISSING}</em> markiert). Bitte in der
              Datei <code>src/lib/legal-config.ts</code> vervollständigen.
            </p>
          )}

          <div>
            <h2 className="font-semibold text-foreground">Angaben gemäß § 5 DDG</h2>
            <p className="mt-2">
              {companyName}
              <br />
              Inhaber: {legalValue(owner)}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              {address.country}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Rechtsform</h2>
            <p className="mt-2">{legalForm ? legalFormLabels[legalForm] : MISSING}</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Kontakt</h2>
            <p className="mt-2">
              Telefon:{" "}
              <a href={`tel:${contact.phoneHref}`} className="hover:underline">
                {contact.phone}
              </a>
              <br />
              E-Mail:{" "}
              <a href={`mailto:${contact.email}`} className="hover:underline">
                {contact.email}
              </a>
            </p>
          </div>

          {isCorporation && (
            <div>
              <h2 className="font-semibold text-foreground">Registereintrag</h2>
              <p className="mt-2">
                Registergericht: {legalValue(legalConfig.registerCourt)}
                <br />
                Registernummer: {legalValue(legalConfig.registerNumber)}
              </p>
            </div>
          )}

          {vatId && (
            <div>
              <h2 className="font-semibold text-foreground">
                Umsatzsteuer-Identifikationsnummer
              </h2>
              <p className="mt-2">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
                <br />
                {vatId}
              </p>
            </div>
          )}

          {legalConfig.supervisoryAuthority && (
            <div>
              <h2 className="font-semibold text-foreground">Zuständige Aufsichtsbehörde</h2>
              <p className="mt-2">{legalConfig.supervisoryAuthority}</p>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-foreground">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p className="mt-2">
              {legalValue(owner)}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">EU-Streitschlichtung</h2>
            <p className="mt-2">
              Die Europäische Kommission stellte bis zum 20. Juli 2025 eine Plattform
              zur Online-Streitbeilegung (OS) bereit. Diese Plattform wurde
              eingestellt. Wir sind nicht bereit und nicht verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Haftung für Inhalte</h2>
            <p className="mt-2">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
              auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
              §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen oder
              nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
              hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung
              von Informationen nach den allgemeinen Gesetzen bleiben hiervon
              unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
              Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
              Inhalte umgehend entfernen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Haftung für Links</h2>
            <p className="mt-2">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren
              Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
              fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
              Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
              Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Bei
              Bekanntwerden von Rechtsverletzungen werden wir derartige Links
              umgehend entfernen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Urheberrecht</h2>
            <p className="mt-2">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
              Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
              jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite
              sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
