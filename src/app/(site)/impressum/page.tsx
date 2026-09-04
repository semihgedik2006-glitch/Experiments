import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von KörperFormen.",
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function ImpressumPage() {
  const { owner, address, contact, vatId, website } = legalConfig;

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Impressum</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <Block title="Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)">
            <p>
              Inhaber: {owner}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              {address.country}
            </p>
          </Block>

          <Block title="Kontakt">
            <p>
              Telefon:{" "}
              <a href={`tel:${contact.phoneHref}`} className="hover:underline">
                {contact.phone}
              </a>
              <br />
              E-Mail:{" "}
              <a href={`mailto:${contact.email}`} className="hover:underline">
                {contact.email}
              </a>
              <br />
              Internet:{" "}
              <a
                href={website.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime hover:underline"
              >
                {website.label}
              </a>
            </p>
          </Block>

          <Block title="Umsatzsteuer-Identifikationsnummer">
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
              <br />
              {vatId}
            </p>
          </Block>

          <Block title="Verantwortlich für journalistisch-redaktionelle Inhalte">
            <p>
              Verantwortlich gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV):
              <br />
              <br />
              {owner}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
            </p>
          </Block>

          <Block title="Verbraucherstreitbeilegung">
            <p>
              Eine Teilnahme an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle erfolgt nicht.
            </p>
          </Block>
        </div>
      </Container>
    </section>
  );
}
