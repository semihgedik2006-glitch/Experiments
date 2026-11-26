import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { VorschauHinweis } from "@/components/vorschau-hinweis";
import { legalConfig } from "@/lib/legal-config";
import { gutscheinZahlweg } from "@/lib/gutschein";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  alternates: { canonical: "/widerruf" },
  title: "Widerrufsbelehrung",
};

/**
 * Widerrufsbelehrung für Gutscheine, die online über Stripe gekauft werden.
 *
 * Nur nötig, wenn das Studio selbst online verkauft (Stripe). Beim Kauf
 * über Digistore24 ist Digistore24 der Verkäufer und belehrt selbst -
 * deshalb ist die Seite nur erreichbar, wenn Stripe der gewählte Zahlweg
 * ist; angemeldete Admins sehen sie immer, zum Prüfen.
 *
 * Der Text folgt dem gesetzlichen Muster (Anlage 1 zu Art. 246a § 1
 * Abs. 2 EGBGB) für Dienstleistungen. ENTWURF: vor dem Einsatz von
 * jemandem mit Rechtskenntnis prüfen lassen.
 */
export default async function WiderrufSeite() {
  const stripeAktiv = gutscheinZahlweg() === "stripe";
  const admin = await getAdminSession();
  if (!stripeAktiv && !admin) notFound();

  const { companyName, owner, address, contact } = legalConfig;
  const anschrift = `${companyName}, ${owner}, ${address.street}, ${address.postalCode} ${address.city}, E-Mail: ${contact.email}`;

  return (
    <>
      {!stripeAktiv && <VorschauHinweis />}
      <PageHeader ohneMotiv kicker="Rechtliches" title="Widerrufsbelehrung" intro="Für Gutscheine, die du online auf dieser Website kaufst." />
      <Container className="max-w-3xl space-y-6 pb-24 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">Widerrufsrecht</h2>
          <p>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
            widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
          </p>
          <p className="mt-2">
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ({anschrift}) mittels einer eindeutigen
            Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren
            Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten
            stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
          </p>
          <p className="mt-2">
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung
            des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">Folgen des Widerrufs</h2>
          <p>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
            erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
            zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
            eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei
            der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde
            ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser
            Rückzahlung Entgelte berechnet.
          </p>
          <p className="mt-2">
            Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen,
            so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem
            Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses
            Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang
            der im Vertrag vorgesehenen Dienstleistungen entspricht.
          </p>
        </section>

        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-2 font-semibold text-foreground">Muster-Widerrufsformular</h2>
          <p>
            (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und
            senden Sie es zurück.)
          </p>
          <p className="mt-2">An {anschrift}:</p>
          <p className="mt-2">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den
            Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)
            <br />
            Bestellt am (*) / erhalten am (*)
            <br />
            Name des/der Verbraucher(s)
            <br />
            Anschrift des/der Verbraucher(s)
            <br />
            Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
            <br />
            Datum
          </p>
          <p className="mt-2 text-xs">(*) Unzutreffendes streichen.</p>
        </section>
      </Container>
    </>
  );
}
