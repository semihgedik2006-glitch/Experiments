import type { Metadata } from "next";
import Link from "@/components/sprach-link";
import { Container } from "@/components/ui/container";
import { VerbindlichHinweis } from "@/components/recht/verbindlich-hinweis";
import { legalConfig, standEnglisch } from "@/lib/legal-config";
import { seitenMetadaten } from "@/lib/i18n/metadaten";

export const metadata: Metadata = seitenMetadaten("en", "/agb", {
  title: "Terms and conditions",
  description: "General terms and conditions of Körperformen.",
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

/**
 * Die AGB auf Englisch - Übersetzung von /agb, verbindlich ist das deutsche.
 * Ändert sich die deutsche Fassung, muss diese Seite nachgezogen werden.
 */
export default function TermsPage() {
  const email = legalConfig.contact.email;

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">General terms and conditions</h1>
        <p className="mt-3 text-sm text-muted">As of: {standEnglisch()}</p>
        <div className="mt-6">
          <VerbindlichHinweis dePfad="/agb" />
        </div>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <Section title="§ 1 Scope">
            <p>
              These general terms and conditions apply to all contracts between {legalConfig.companyName}{" "}
              (hereinafter “studio”) and its customers (hereinafter “member”) on the use of the training
              services, and to the appointment booking offered on this website.
            </p>
            <p>
              Deviating terms of the member do not become part of the contract unless the studio expressly
              agrees to them in writing.
            </p>
          </Section>

          <Section title="§ 2 Trial session">
            <p>
              A free, no-obligation trial session can be requested via this website. The request is not yet
              a binding appointment. An appointment is only made once the studio expressly confirms the
              request.
            </p>
            <p>
              The trial session creates no obligation whatsoever to take out a membership. There is no charge
              for the trial session.
            </p>
          </Section>

          <Section title="§ 3 Conclusion of a membership contract">
            <p>
              A contract for a membership or training package is not concluded via this website. It is
              concluded exclusively in a personal conversation at the studio’s premises, usually following a
              trial session and a consultation.
            </p>
            <p>
              The specific services, terms and prices are agreed individually and handed to the member in
              text form. The information on this website does not constitute a binding offer.
            </p>
          </Section>

          <Section title="§ 4 Services of the studio">
            <p>
              Within the agreed membership, the studio provides the member with the use of the EMS training
              equipment and professional supervision by trained staff. EMS training always takes place under
              personal guidance.
            </p>
            <p>
              The studio may adjust training times and opening hours to a reasonable extent and temporarily
              restrict operations due to public holidays, maintenance, company holidays or other objective
              reasons. Longer closures will be announced in good time.
            </p>
          </Section>

          <Section title="§ 5 Health requirements">
            <p>
              EMS training is not suitable for everyone. Before the first session the member completes a
              health declaration confirming that there are no grounds for exclusion.
            </p>
            <p>
              EMS training is excluded in particular in the case of pacemakers and other electronic implants,
              pregnancy, epilepsy, acute illnesses and inflammation, thrombosis and severe circulatory
              disorders. In case of doubt, medical advice must be sought before starting training; the studio
              may request a medical certificate of fitness.
            </p>
            <p>
              The member must inform the studio without delay of any changes in health that may conflict with
              training. Incorrect information in the health declaration is at the member’s expense.
            </p>
          </Section>

          <Section title="§ 6 Training appointments, cancellations and no-shows">
            <p>EMS training only takes place by prior appointment. Agreed appointments are binding.</p>
            <p>
              If an appointment cannot be kept, it must be cancelled in good time. The specific cancellation
              period is set out in the membership contract. Appointments not cancelled in time may be counted
              as a session used.
            </p>
          </Section>

          <Section title="§ 7 Term and termination">
            <p>
              The term, renewal and notice periods of the membership are governed by the individual agreement
              in the membership contract. The statutory requirements are complied with, in particular §§ 309
              no. 9 and 327c of the German Civil Code (BGB) on terms and tacit renewals of consumer contracts.
            </p>
            <p>
              The right of both parties to terminate for good cause remains unaffected. Good cause exists for
              the member in particular if the use of the services becomes permanently impossible for health
              reasons; proof must be provided on request.
            </p>
            <p>Notice of termination must be given in text form (e.g. by email to {email}).</p>
          </Section>

          <Section title="§ 8 Prices and payment terms">
            <p>
              The fees individually agreed in the membership contract apply. Unless otherwise agreed, fees are
              payable monthly in advance.
            </p>
            <p>
              For returned direct debits for which the member is responsible, the bank charges actually
              incurred may be passed on. Changes to bank details must be notified to the studio without delay.
            </p>
          </Section>

          <Section title="§ 9 Right of withdrawal for consumers">
            <p>
              Membership contracts are concluded at the studio’s premises. In this case there is generally no
              statutory right of withdrawal for distance contracts or contracts concluded away from business
              premises (§§ 312g, 355 BGB).
            </p>
            <p>
              Should a contract nevertheless be concluded at a distance or away from business premises in an
              individual case, the member as a consumer has a right of withdrawal of 14 days from conclusion of
              the contract. Withdrawal must be declared to the studio in text form; no reason is required. In
              this case the member will be informed of the details separately and in the legally prescribed
              form.
            </p>
            <p>
              The free request for a trial session via this website does not create a contract for payment and
              can be withdrawn informally at any time.
            </p>
          </Section>

          <Section title="§ 10 Conduct at the studio">
            <p>
              The member undertakes to follow the instructions of the studio staff and to treat the facilities
              and equipment with care. Suitable sportswear is required for training; towels must be brought
              along.
            </p>
            <p>
              The studio may exclude from training anyone who, despite a warning, persistently breaches the
              studio rules, harasses other members or is under the influence of alcohol or drugs.
            </p>
          </Section>

          <Section title="§ 11 Liability">
            <p>
              The studio is liable without limitation for damage resulting from injury to life, body or health
              based on a negligent or intentional breach of duty by the studio or its agents, and for other
              damage based on intent or gross negligence.
            </p>
            <p>
              In the case of simple negligence, the studio is only liable for breach of an essential
              contractual obligation (cardinal obligation), limited to the foreseeable damage typical for the
              contract. Any further liability is excluded.
            </p>
            <p>
              Otherwise, training is at the member’s own responsibility, in particular with regard to the
              accuracy of the information in the health declaration. The studio is only liable for valuables
              brought along within the scope of the statutory provisions.
            </p>
          </Section>

          <Section title="§ 12 Data protection">
            <p>
              Personal data is processed exclusively in accordance with the applicable data protection
              regulations. Details can be found in our{" "}
              <Link href="/datenschutz" className="text-accent underline underline-offset-2">
                privacy policy
              </Link>
              .
            </p>
          </Section>

          <Section title="§ 13 Dispute resolution">
            <p>
              We are neither willing nor obliged to take part in dispute resolution proceedings before a
              consumer arbitration board.
            </p>
          </Section>

          <Section title="§ 14 Final provisions">
            <p>
              The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for
              the International Sale of Goods. If the member is a consumer, mandatory consumer protection
              provisions of their country of residence remain unaffected.
            </p>
            <p>
              Should individual provisions of these terms be or become wholly or partly invalid, the validity
              of the remaining provisions remains unaffected. The invalid provision is replaced by the
              statutory provision.
            </p>
            <p>Amendments and additions to the membership contract must be made in text form.</p>
          </Section>
        </div>
      </Container>
    </section>
  );
}
