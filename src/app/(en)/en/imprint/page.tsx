import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { VerbindlichHinweis } from "@/components/recht/verbindlich-hinweis";
import { legalConfig } from "@/lib/legal-config";
import { seitenMetadaten } from "@/lib/i18n/metadaten";

export const metadata: Metadata = seitenMetadaten("en", "/impressum", {
  title: "Imprint",
  description: "Imprint and provider identification of KörperFormen.",
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** Das Impressum auf Englisch - Übersetzung von /impressum, verbindlich ist das deutsche. */
export default function ImprintPage() {
  const { owner, address, contact, vatId, website } = legalConfig;

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Imprint</h1>
        <div className="mt-6">
          <VerbindlichHinweis dePfad="/impressum" />
        </div>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <Block title="Information pursuant to § 5 of the German Digital Services Act (DDG)">
            <p>
              Owner: {owner}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              Germany
            </p>
          </Block>

          <Block title="Contact">
            <p>
              Phone:{" "}
              <a href={`tel:${contact.phoneHref}`} className="hover:underline">
                {contact.phone}
              </a>
              <br />
              Email:{" "}
              <a href={`mailto:${contact.email}`} className="hover:underline">
                {contact.email}
              </a>
              <br />
              Website:{" "}
              <a href={website.href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
                {website.label}
              </a>
            </p>
          </Block>

          <Block title="VAT identification number">
            <p>
              VAT identification number pursuant to § 27a of the German VAT Act (UStG):
              <br />
              {vatId}
            </p>
          </Block>

          <Block title="Responsible for journalistic and editorial content">
            <p>
              Responsible pursuant to § 18 (2) of the German Interstate Media Treaty (MStV):
              <br />
              <br />
              {owner}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
            </p>
          </Block>

          <Block title="Consumer dispute resolution">
            <p>We do not take part in dispute resolution proceedings before a consumer arbitration board.</p>
          </Block>
        </div>
      </Container>
    </section>
  );
}
