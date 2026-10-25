import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { VerbindlichHinweis } from "@/components/recht/verbindlich-hinweis";
import { legalConfig, standEnglisch } from "@/lib/legal-config";
import { seitenMetadaten } from "@/lib/i18n/metadaten";

export const metadata: Metadata = seitenMetadaten("en", "/datenschutz", {
  title: "Privacy policy",
  description: "Information on the processing of personal data at KörperFormen Köln Rondorf.",
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Die Datenschutzerklärung auf Englisch - Übersetzung von /datenschutz,
 * verbindlich ist die deutsche. Abschnitt für Abschnitt dieselbe
 * Gliederung, damit sich beide Fassungen nebeneinander prüfen lassen.
 * Ändert sich die deutsche Fassung, muss diese Seite nachgezogen werden.
 */
export default function PrivacyPage() {
  const { owner, address, contact, lastUpdated } = legalConfig;
  const email = contact.email;

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Privacy policy</h1>
        <p className="mt-3 text-sm text-muted">KörperFormen Köln Rondorf &middot; As of: {standEnglisch(lastUpdated)}</p>
        <div className="mt-6">
          <VerbindlichHinweis dePfad="/datenschutz" />
        </div>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <Section title="1. Data protection at a glance">
            <p>
              The protection of your personal data is important to us. We treat your personal data
              confidentially and in accordance with the statutory data protection regulations, in particular
              the General Data Protection Regulation (GDPR), the German Federal Data Protection Act (BDSG) and
              the German Telecommunications and Digital Services Data Protection Act (TDDDG).
            </p>
            <p>
              Personal data is any information that can be used to identify you personally or that relates to
              an identified or identifiable natural person.
            </p>
            <p>
              This privacy policy informs you about which personal data is processed when you visit and use
              our website, for what purposes, on what legal basis, and what rights you have.
            </p>
          </Section>

          <Section title="2. Controller">
            <p>The controller within the meaning of the GDPR is:</p>
            <p>
              Owner: {owner}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              Germany
              <br />
              Phone: {contact.phone}
              <br />
              Email: {email}
            </p>
            <p>
              The controller is the natural or legal person who, alone or jointly with others, decides on the
              purposes and means of processing personal data.
            </p>
          </Section>

          <Section title="3. Hosting and provision of the website">
            <p>
              When you access our website, the web server or our hosting provider automatically processes
              certain technical information:
            </p>
            <List
              items={[
                "IP address of the device used",
                "date and time of access",
                "page or file accessed",
                "amount of data transferred",
                "referrer URL",
                "browser type and version",
                "operating system used",
                "information on whether the request was successful",
              ]}
            />
            <p>
              Processing this data is necessary to provide the website technically, ensure trouble-free
              operation and detect and fend off attacks and misuse.
            </p>
            <p>
              The legal basis is Art. 6 (1) (f) GDPR. Our legitimate interest lies in the secure, reliable and
              technically flawless provision of our website. Server log files are deleted as soon as they are
              no longer required for these purposes, unless statutory retention obligations or specific
              security reasons require longer storage.
            </p>
            <p>
              This website is technically provided by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
              USA. Processing may also take place on servers in the United States. A data processing agreement
              pursuant to Art. 28 GDPR has been concluded with the provider. Vercel is certified under the
              EU-US Data Privacy Framework; in addition, the European Commission’s standard contractual clauses
              apply.
            </p>
            <p>
              The database of this website, in which in particular appointment requests, contact messages,
              newsletter subscriptions and blog comments are stored, is operated by Neon Inc. in a data centre
              within the European Union (Frankfurt am Main region, Germany).
            </p>
          </Section>

          <Section title="4. SSL or TLS encryption">
            <p>
              For security reasons and to protect the transmission of confidential content, this website uses
              SSL or TLS encryption. You can recognise an encrypted connection in particular by the address
              bar of your browser starting with “https://”. Encryption is intended to protect the data you
              send us from unauthorised access by third parties.
            </p>
          </Section>

          <Section title="5. Cookies and similar technologies">
            <p>
              Our website uses cookies and comparable technologies. Cookies are small files or pieces of
              information that can be stored on or read from your device.
            </p>
            <p>
              Technically necessary cookies and technologies are only used where they are required to operate
              the website or for a function you have expressly requested. On this website this concerns your
              choice in the cookie notice and your design setting (light/dark), which are stored only locally
              in your browser and not transmitted to us, as well as a session cookie for logging in to the
              internal administration area, which only concerns staff.
            </p>
            <p>
              We also use your browser’s session storage (“sessionStorage”). It is deleted automatically when
              you close the tab and is not transmitted to us. It contains:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                the training goal you chose on the home page or in the goal check, and the time of day chosen
                there – so that the page suits your goal and the request form is already filled in;
              </li>
              <li>
                whether and when you have already been shown the invitation to a trial session (pop-up), how
                many pages you have viewed during this visit and how long you have been actively reading – so
                that the invitation does not appear too early or more than once;
              </li>
              <li>whether you have already requested a trial session during this visit – then the invitation no longer appears.</li>
            </ul>
            <p>
              Only if you choose “Accept” in the cookie notice do we also note there which trial-session
              button you clicked last (see section 7).
            </p>
            <p>
              Storing or accessing information on your device for technically necessary functions is based on
              § 25 (2) TDDDG. Insofar as personal data is processed, processing is based in particular on Art. 6
              (1) (f) GDPR.
            </p>
            <p>
              Technologies that are not technically necessary, in particular for statistics, audience
              measurement, marketing or external media, are only used with your prior consent. The legal basis
              in these cases is Art. 6 (1) (a) GDPR in conjunction with § 25 (1) TDDDG.
            </p>
            <p>
              You can withdraw your consent at any time with effect for the future by deleting the website data
              in your browser and choosing “Necessary only” in the cookie notice on your next visit. Withdrawal
              does not affect the lawfulness of processing carried out before the withdrawal.
            </p>
          </Section>

          <Section title="6. Contact by email and phone">
            <p>
              If you contact us by email or phone, we process the personal data you provide in order to handle
              your enquiry. This may include in particular your name, phone number, email address and the
              content you tell us.
            </p>
            <p>
              If your enquiry relates to an existing contract or serves to prepare a contract, in particular a
              membership or arranging a trial session, processing is based on Art. 6 (1) (b) GDPR. For other
              enquiries, processing is based on Art. 6 (1) (f) GDPR. Our legitimate interest lies in properly
              handling the enquiry addressed to us.
            </p>
            <p>
              The data is deleted as soon as it is no longer required to handle the enquiry and there are no
              statutory retention obligations or legitimate interests in further storage.
            </p>
          </Section>

          <Section title="7. Contact, enquiry and trial session forms">
            <p>
              If you use the contact form, the form for arranging a trial session or a comparable enquiry
              function on our website, we process the data you enter there. This may include in particular
              your name, phone number, email address, preferred appointment, preferred studio and your message.
            </p>
            <p>
              Processing serves to handle your enquiry, contact you and, where applicable, prepare or carry out
              a trial session or another requested offer.
            </p>
            <p>
              The legal basis is Art. 6 (1) (b) GDPR insofar as your enquiry is aimed at concluding a contract
              or at pre-contractual measures. Insofar as processing does not directly serve pre-contractual
              purposes, it is based on Art. 6 (1) (f) GDPR due to our legitimate interest in handling customer
              and prospect enquiries.
            </p>
            <p>
              Technical data such as IP address and the date and time of submission may also be processed in
              order to prevent misuse of the form and ensure the security of our systems.
            </p>
            <p>
              With a trial session request you also send us your preferred time (weekdays and time of day),
              optionally your training goal, when we can best reach you and whether you are coming as two. With
              the request we also store where it came from: the page on which the form was located, a campaign
              identifier from the address you visited (e.g. from an ad) and only the name of the website you
              came from (e.g. “google.com”) – not the full address. If you chose “Accept” in the cookie notice,
              we also store which trial-session button you clicked before (e.g. “mobile bar”). We only evaluate
              this information in aggregate to see which pages and ads bring in requests; no cookies are set
              and no third parties are involved for this. The legal basis is Art. 6 (1) (f) GDPR, and for the
              clicked button your consent pursuant to Art. 6 (1) (a) GDPR in conjunction with § 25 (1) TDDDG.
            </p>
          </Section>

          <Section title="8. Sending confirmation emails">
            <p>
              As soon as we confirm a trial session you requested, you automatically receive an email about it.
              For the technical sending we use Resend, Inc., 2261 Market Street, San Francisco, CA 94114, USA,
              with whom a data processing agreement pursuant to Art. 28 GDPR has been concluded.
            </p>
            <p>
              This involves transmitting your name, your email address and the details of the confirmed
              appointment. Processing is based on Art. 6 (1) (b) GDPR. Processing on servers in the United
              States cannot be ruled out; the transfer takes place in compliance with Art. 44 et seq. GDPR.
            </p>
          </Section>

          <Section title="9. Location detection when booking">
            <p>
              On the booking page we offer to suggest the nearest studio automatically. Your browser asks for
              your permission to use your location for this.
            </p>
            <p>
              The distance is calculated exclusively locally in your browser. Your location data is{" "}
              <strong>not</strong> transmitted to us or to third parties and is not stored. If you decline to
              share your location, you can still select the studio manually. The legal basis is your consent
              pursuant to Art. 6 (1) (a) GDPR, which you can withdraw at any time in your browser settings.
            </p>
          </Section>

          <Section title="10. Access to your appointments without an account">
            <p>
              Under “My appointments” you can have a link sent to you with which you can view the appointment
              requests stored for your email address. No user account or password is required.
            </p>
            <p>
              For this we store your email address, a cryptographic check value of the access key and the time
              of the request and of the first access. The access key itself is not stored; it is contained only
              in the email sent to you. The link expires after 30 minutes, and the associated record is deleted
              automatically no later than one day after expiry.
            </p>
            <p>
              An email is only sent if appointment requests actually exist for the address entered. The message
              shown in the form is identical in every case, so that it cannot be inferred whether an address is
              stored with us. The legal basis is Art. 6 (1) (b) GDPR.
            </p>
          </Section>

          <Section title="11. Newsletter">
            <p>
              If you subscribe to our newsletter, we store your email address in order to send you training
              tips and offers. The legal basis is your consent pursuant to Art. 6 (1) (a) GDPR.
            </p>
            <p>
              You can withdraw your consent at any time with effect for the future – most easily via the
              unsubscribe link at the end of every newsletter email: one click is enough, no reason is
              required. Alternatively, an informal message to {email} is sufficient. Your email address will be
              removed from the mailing list after withdrawal.
            </p>
            <p>
              Emails that belong to a booked appointment – such as appointment confirmations and reminders –
              are not affected by the withdrawal. We do not process these on the basis of your newsletter
              consent, but in order to carry out the appointment.
            </p>
          </Section>

          <Section title="12. Health-related information">
            <p>
              In connection with EMS training, users may voluntarily tell us about training goals, physical
              complaints, back complaints, health restrictions or comparable health circumstances.
            </p>
            <p>
              Health data belongs to the specially protected categories of personal data within the meaning of
              Art. 9 GDPR. Insofar as health data is specifically collected via the website, it is only
              processed if there is a permissible legal basis for this. Where necessary, we obtain explicit
              consent pursuant to Art. 9 (2) (a) GDPR before processing.
            </p>
            <p>
              Such consent can be withdrawn at any time with effect for the future. We recommend that users
              only share health information in general contact or free-text fields that is actually necessary
              to handle the enquiry.
            </p>
          </Section>

          <Section title="13. Blog, editorial content and comments">
            <p>
              On our website we provide blog posts, guides and information on EMS training, exercise, health
              and related topics. When you simply read this content, generally only the technical data already
              described in connection with providing the website is processed.
            </p>
            <p>
              If you leave a comment on a blog post, we store the name you provide and the content of your
              comment. You do not need to give your real name; a pseudonym is sufficient. Comments are reviewed
              and approved by us before publication.
            </p>
            <p>
              The legal basis is your consent pursuant to Art. 6 (1) (a) GDPR and our legitimate interest in an
              exchange free of misuse pursuant to Art. 6 (1) (f) GDPR. Published comments remain stored until
              you request their deletion; please contact {email} for this.
            </p>
            <p>
              If external content such as maps or comparable services is embedded in blog posts, the
              corresponding information in this privacy policy also applies.
            </p>
          </Section>

          <Section title="14. Processing of customer and contract data">
            <p>
              Insofar as enquiries are made via the website that subsequently lead to a membership, a trial
              session or another contractual relationship, the personal data required for this may be further
              processed to perform the contract.
            </p>
            <p>
              The legal basis is Art. 6 (1) (b) GDPR. Insofar as statutory retention obligations exist, in
              particular under commercial or tax law, further storage is based on Art. 6 (1) (c) GDPR.
            </p>
          </Section>

          <Section title="15. Recipients of personal data and data processing">
            <p>
              We generally only pass on personal data if this is necessary to fulfil a contract, there is a
              legal obligation, we have a legitimate interest in passing it on, or you have consented.
            </p>
            <p>
              Recipients or processors on this website are in particular our hosting provider, the operator of
              our database and the service provider for sending confirmation emails. Insofar as service
              providers process personal data exclusively on our behalf, we conclude data processing agreements
              with them pursuant to Art. 28 GDPR where legally required.
            </p>
          </Section>

          <Section title="16. Transfer of data to third countries">
            <p>
              Insofar as personal data is transferred to recipients outside the European Union or the European
              Economic Area in the context of certain services, this only takes place in compliance with the
              requirements of Art. 44 et seq. GDPR.
            </p>
            <p>
              A transfer may take place in particular on the basis of an adequacy decision of the European
              Commission, appropriate safeguards such as the European Commission’s standard contractual clauses
              or – where legally permissible – your explicit consent. We point out possible third-country
              transfers for individual services separately in the respective sections.
            </p>
          </Section>

          <Section title="17. Storage period">
            <p>
              Personal data is generally only stored for as long as is necessary for the respective purpose. If
              statutory retention obligations exist, the data concerned is stored in accordance with these
              statutory periods.
            </p>
            <p>
              Data may also be retained insofar as this is necessary for asserting, exercising or defending
              legal claims. Once the respective purpose no longer applies or the statutory retention periods
              have expired, the data is deleted or anonymised.
            </p>
          </Section>

          <Section title="18. Your rights">
            <p>Subject to the statutory requirements, you have in particular the following rights:</p>
            <List
              items={[
                "right of access pursuant to Art. 15 GDPR",
                "right to rectification of inaccurate data pursuant to Art. 16 GDPR",
                "right to erasure pursuant to Art. 17 GDPR",
                "right to restriction of processing pursuant to Art. 18 GDPR",
                "right to data portability pursuant to Art. 20 GDPR",
                "right to object pursuant to Art. 21 GDPR",
                "right to withdraw consent given pursuant to Art. 7 (3) GDPR",
                "right to lodge a complaint with a data protection supervisory authority pursuant to Art. 77 GDPR",
              ]}
            />
            <p>To exercise your rights, you can contact us at any time: {email}</p>
          </Section>

          <Section title="19. Right to object">
            <p>
              Insofar as personal data is processed on the basis of Art. 6 (1) (f) GDPR, you have the right
              pursuant to Art. 21 GDPR to object to the processing at any time on grounds relating to your
              particular situation.
            </p>
            <p>
              If personal data is processed for direct marketing purposes, you have the right to object at any
              time and without giving reasons to the processing of your personal data for such marketing.
            </p>
          </Section>

          <Section title="20. Withdrawal of your consent">
            <p>
              Insofar as data processing is based on your consent, you can withdraw this consent at any time
              with effect for the future. The lawfulness of processing carried out before the withdrawal
              remains unaffected.
            </p>
          </Section>

          <Section title="21. Right to lodge a complaint with the supervisory authority">
            <p>
              You have the right to lodge a complaint with a data protection supervisory authority about the
              processing of your personal data. For companies based in North Rhine-Westphalia, the following
              supervisory authority is responsible in particular:
            </p>
            <p>
              Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)
              <br />
              Postfach 20 04 44, 40102 Düsseldorf
              <br />
              Office address: Kavalleriestraße 2–4, 40213 Düsseldorf
              <br />
              Phone: 0211 38424-0
              <br />
              Email: poststelle@ldi.nrw.de
            </p>
          </Section>

          <Section title="22. Automated decision-making and profiling">
            <p>
              There is no decision-making based solely on automated processing within the meaning of Art. 22
              GDPR that produces legal effects concerning you or similarly significantly affects you.
            </p>
          </Section>

          <Section title="23. Google Analytics">
            <p>
              Insofar as you have given your consent via our cookie notice, we use Google Analytics, a web
              analytics service of Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland.
            </p>
            <p>
              Google Analytics allows us to evaluate the use of our website statistically. This may involve
              processing information in particular about pages viewed, the time and duration of the visit,
              devices and browsers used, approximate geographical origin and interactions with our website.
              Google Analytics may use cookies or comparable technologies.
            </p>
            <p>
              Use takes place exclusively after your consent on the basis of Art. 6 (1) (a) GDPR in
              conjunction with § 25 (1) TDDDG. Without your consent, Google Analytics is not loaded. You can
              withdraw your consent at any time. When using Google services, data may be processed outside the
              European Union or the European Economic Area. Such a transfer takes place in compliance with Art.
              44 et seq. GDPR.
            </p>
          </Section>

          <Section title="24. Google Maps">
            <p>
              Insofar as you give your consent, we use Google Maps to display our studio locations and make it
              easier to plan your journey. The provider is Google Ireland Limited, Gordon House, Barrow Street,
              Dublin 4, Ireland.
            </p>
            <p>
              When a Google Maps map is loaded, in particular your IP address and technical information about
              your device may be transmitted to Google. The map is only loaded after you have agreed in the
              cookie notice or have expressly activated the map with a click. As long as you do not agree, you
              only see a placeholder and no data is transmitted to Google. You can also find the addresses of
              our studios in text form on the studio and contact pages without using the map.
            </p>
            <p>
              The legal basis is Art. 6 (1) (a) GDPR in conjunction with § 25 (1) TDDDG. You can withdraw your
              consent at any time. Further information can be found in Google’s privacy policy:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                policies.google.com/privacy
              </a>
              .
            </p>
          </Section>

          <Section title="25. Fonts">
            <p>
              The fonts used on this website are stored locally on our server and delivered from there. When
              the fonts are loaded, <strong>no</strong> connection is made to servers of Google or other third
              parties; no data is transmitted to third parties.
            </p>
          </Section>

          <Section title="26. Videos on this website">
            <p>
              The videos on this website are stored on our own web space and played from there. No video
              services such as YouTube, Instagram or TikTok are embedded, and no data is transmitted to such
              services during playback. The videos only load when you scroll to them.
            </p>
          </Section>

          <Section title="27. Currency and changes to this privacy policy">
            <p>
              We reserve the right to adapt this privacy policy if legal requirements, our website, the
              technical services used or our data processing change. The current version published on this
              website applies.
            </p>
          </Section>
        </div>
      </Container>
    </section>
  );
}
