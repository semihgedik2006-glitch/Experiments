import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten bei KörperFormen Köln Rondorf.",
};

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

export default function DatenschutzPage() {
  const { owner, address, contact, lastUpdated } = legalConfig;
  const email = contact.email;

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Datenschutzerklärung</h1>
        <p className="mt-3 text-sm text-muted">
          KörperFormen Köln Rondorf &middot; Stand: {lastUpdated}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <Section title="1. Datenschutz auf einen Blick">
            <p>
              Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir behandeln Ihre
              personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
              Datenschutzvorschriften, insbesondere der Datenschutz-Grundverordnung
              (DSGVO), des Bundesdatenschutzgesetzes (BDSG) sowie des
              Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG).
            </p>
            <p>
              Personenbezogene Daten sind alle Informationen, mit denen Sie persönlich
              identifiziert werden können oder die sich auf eine identifizierte oder
              identifizierbare natürliche Person beziehen.
            </p>
            <p>
              Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen
              Daten beim Besuch und bei der Nutzung unserer Website verarbeitet werden, zu
              welchen Zwecken dies geschieht, auf welcher Rechtsgrundlage die Verarbeitung
              erfolgt und welche Rechte Ihnen zustehen.
            </p>
          </Section>

          <Section title="2. Verantwortlicher">
            <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung ist:</p>
            <p>
              Inhaber: {owner}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              {address.country}
              <br />
              Telefon: {contact.phone}
              <br />
              E-Mail: {email}
            </p>
            <p>
              Verantwortlicher ist die natürliche oder juristische Person, die allein oder
              gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung
              personenbezogener Daten entscheidet.
            </p>
          </Section>

          <Section title="3. Hosting und Bereitstellung der Website">
            <p>
              Beim Aufruf unserer Website werden durch den Webserver beziehungsweise durch
              unseren Hosting-Dienstleister automatisch bestimmte technische Informationen
              verarbeitet:
            </p>
            <List
              items={[
                "IP-Adresse des verwendeten Endgeräts",
                "Datum und Uhrzeit des Zugriffs",
                "aufgerufene Seite beziehungsweise Datei",
                "übertragene Datenmenge",
                "Referrer-URL",
                "Browsertyp und Browserversion",
                "verwendetes Betriebssystem",
                "Informationen über den Erfolg des Seitenabrufs",
              ]}
            />
            <p>
              Die Verarbeitung dieser Daten ist erforderlich, um die Website technisch
              bereitzustellen, einen störungsfreien Betrieb sicherzustellen sowie Angriffe
              und missbräuchliche Zugriffe erkennen und abwehren zu können.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse
              besteht in der sicheren, zuverlässigen und technisch einwandfreien
              Bereitstellung unseres Internetangebots. Server-Logdateien werden gelöscht,
              sobald sie für die genannten Zwecke nicht mehr erforderlich sind, sofern
              keine gesetzlichen Aufbewahrungspflichten oder konkrete Sicherheitsgründe
              eine längere Speicherung erforderlich machen.
            </p>
            <p>
              Diese Website wird technisch bereitgestellt durch die Vercel Inc., 340 S
              Lemon Ave #4133, Walnut, CA 91789, USA. Die Verarbeitung kann dabei auch auf
              Servern in den Vereinigten Staaten erfolgen. Mit dem Anbieter besteht ein
              Vertrag über Auftragsverarbeitung gemäß Art. 28 DSGVO. Vercel ist nach dem
              EU-US Data Privacy Framework zertifiziert; ergänzend werden die
              Standardvertragsklauseln der Europäischen Kommission zugrunde gelegt.
            </p>
            <p>
              Die Datenbank dieser Website, in der insbesondere Terminanfragen,
              Kontaktnachrichten, Newsletter-Anmeldungen und Blog-Kommentare gespeichert
              werden, wird bei der Neon Inc. in einem Rechenzentrum innerhalb der
              Europäischen Union (Region Frankfurt am Main, Deutschland) betrieben.
            </p>
          </Section>

          <Section title="4. SSL- beziehungsweise TLS-Verschlüsselung">
            <p>
              Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung
              vertraulicher Inhalte eine SSL- beziehungsweise TLS-Verschlüsselung. Eine
              verschlüsselte Verbindung erkennen Sie insbesondere daran, dass die
              Adresszeile Ihres Browsers mit „https://“ beginnt. Durch die Verschlüsselung
              sollen Daten, die Sie an uns übermitteln, vor einem unbefugten Zugriff
              Dritter geschützt werden.
            </p>
          </Section>

          <Section title="5. Cookies und ähnliche Technologien">
            <p>
              Unsere Website verwendet Cookies und vergleichbare Technologien. Cookies sind
              kleine Dateien oder Informationen, die auf Ihrem Endgerät gespeichert oder aus
              diesem ausgelesen werden können.
            </p>
            <p>
              Technisch notwendige Cookies und Technologien werden ausschließlich
              eingesetzt, soweit sie für den Betrieb der Website oder für eine von Ihnen
              ausdrücklich gewünschte Funktion erforderlich sind. Auf dieser Website betrifft
              das Ihre Entscheidung im Cookie-Hinweis und Ihre Design-Einstellung
              (hell/dunkel), die ausschließlich lokal in Ihrem Browser gespeichert und nicht
              an uns übertragen werden, sowie ein Sitzungs-Cookie für die Anmeldung im
              internen Verwaltungsbereich, das ausschließlich Mitarbeitende betrifft.
            </p>
            <p>
              Die Speicherung beziehungsweise der Zugriff auf Informationen auf Ihrem
              Endgerät erfolgt bei technisch notwendigen Funktionen auf Grundlage von § 25
              Abs. 2 TDDDG. Soweit hierbei personenbezogene Daten verarbeitet werden, erfolgt
              die Verarbeitung insbesondere auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>
            <p>
              Nicht technisch notwendige Technologien, insbesondere für Statistik,
              Reichweitenmessung, Marketing oder externe Medien, werden ausschließlich nach
              Ihrer vorherigen Einwilligung eingesetzt. Rechtsgrundlage ist in diesen Fällen
              Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit § 25 Abs. 1 TDDDG.
            </p>
            <p>
              Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft
              widerrufen, indem Sie die Website-Daten in Ihrem Browser löschen und beim
              nächsten Aufruf im Cookie-Hinweis „Nur notwendige“ wählen. Der Widerruf
              berührt nicht die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung.
            </p>
          </Section>

          <Section title="6. Kontaktaufnahme per E-Mail und Telefon">
            <p>
              Wenn Sie uns per E-Mail oder telefonisch kontaktieren, verarbeiten wir die von
              Ihnen mitgeteilten personenbezogenen Daten zur Bearbeitung Ihrer Anfrage. Dies
              können insbesondere Ihr Name, Ihre Telefonnummer, Ihre E-Mail-Adresse sowie
              die von Ihnen mitgeteilten Inhalte sein.
            </p>
            <p>
              Bezieht sich Ihre Anfrage auf einen bestehenden Vertrag oder dient sie der
              Vorbereitung eines Vertrags, insbesondere einer Mitgliedschaft oder der
              Vereinbarung eines Probetrainings, erfolgt die Verarbeitung auf Grundlage von
              Art. 6 Abs. 1 lit. b DSGVO. Bei sonstigen Anfragen erfolgt die Verarbeitung auf
              Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in
              der sachgerechten Bearbeitung der an uns gerichteten Anfrage.
            </p>
            <p>
              Die Daten werden gelöscht, sobald sie für die Bearbeitung der Anfrage nicht
              mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten oder
              berechtigten Interessen an einer weiteren Speicherung bestehen.
            </p>
          </Section>

          <Section title="7. Kontakt-, Anfrage- und Probetrainingformulare">
            <p>
              Sofern Sie auf unserer Website das Kontaktformular, das Formular zur
              Vereinbarung eines Probetermins oder eine vergleichbare Anfragefunktion
              nutzen, verarbeiten wir die von Ihnen dort eingegebenen Daten. Hierbei können
              insbesondere Name, Telefonnummer, E-Mail-Adresse, gewünschter Termin,
              gewünschtes Studio und Ihre Nachricht verarbeitet werden.
            </p>
            <p>
              Die Verarbeitung dient der Bearbeitung Ihrer Anfrage, der Kontaktaufnahme und
              gegebenenfalls der Vorbereitung beziehungsweise Durchführung eines
              Probetrainings oder eines anderen gewünschten Angebots.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf den
              Abschluss eines Vertrages oder auf vorvertragliche Maßnahmen gerichtet ist.
              Soweit die Verarbeitung nicht unmittelbar vorvertraglichen Zwecken dient,
              erfolgt sie auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres
              berechtigten Interesses an der Bearbeitung von Kunden- und
              Interessentenanfragen.
            </p>
            <p>
              Technische Daten wie IP-Adresse, Datum und Uhrzeit der Übermittlung können
              zusätzlich verarbeitet werden, um Missbrauch des Formulars zu verhindern und
              die Sicherheit unserer Systeme zu gewährleisten.
            </p>
          </Section>

          <Section title="8. Versand von Bestätigungs-E-Mails">
            <p>
              Sobald wir einen von Ihnen angefragten Probetermin bestätigen, erhalten Sie
              hierüber automatisch eine E-Mail. Für den technischen Versand nutzen wir die
              Resend, Inc., 2261 Market Street, San Francisco, CA 94114, USA, mit der ein
              Vertrag über Auftragsverarbeitung gemäß Art. 28 DSGVO besteht.
            </p>
            <p>
              Übermittelt werden hierbei Ihr Name, Ihre E-Mail-Adresse sowie die Daten des
              bestätigten Termins. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1
              lit. b DSGVO. Eine Verarbeitung auf Servern in den Vereinigten Staaten kann
              dabei nicht ausgeschlossen werden; die Übermittlung erfolgt unter Beachtung der
              Art. 44 ff. DSGVO.
            </p>
          </Section>

          <Section title="9. Standortermittlung bei der Terminbuchung">
            <p>
              Auf der Seite zur Terminbuchung bieten wir Ihnen an, automatisch das
              nächstgelegene Studio vorzuschlagen. Ihr Browser fragt Sie hierfür um
              Erlaubnis, Ihren Standort zu verwenden.
            </p>
            <p>
              Die Berechnung der Entfernung findet ausschließlich lokal in Ihrem Browser
              statt. Ihre Standortdaten werden <strong>nicht</strong> an uns oder an Dritte
              übertragen und nicht gespeichert. Wenn Sie die Standortfreigabe ablehnen,
              können Sie das Studio weiterhin manuell auswählen. Rechtsgrundlage ist Ihre
              Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO, die Sie über die Einstellungen
              Ihres Browsers jederzeit widerrufen können.
            </p>
          </Section>

          <Section title="10. Newsletter">
            <p>
              Wenn Sie sich für unseren Newsletter anmelden, speichern wir Ihre
              E-Mail-Adresse, um Ihnen Trainingstipps und Angebote zuzusenden.
              Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.
            </p>
            <p>
              Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen,
              etwa durch eine formlose Nachricht an {email}. Ihre E-Mail-Adresse wird nach
              dem Widerruf aus dem Verteiler gelöscht.
            </p>
          </Section>

          <Section title="11. Gesundheitsbezogene Angaben">
            <p>
              Im Zusammenhang mit EMS-Training können Nutzer uns freiwillig Informationen
              über Trainingsziele, körperliche Beschwerden, Rückenbeschwerden,
              gesundheitliche Einschränkungen oder vergleichbare gesundheitliche Umstände
              mitteilen.
            </p>
            <p>
              Gesundheitsdaten gehören zu den besonders geschützten Kategorien
              personenbezogener Daten im Sinne von Art. 9 DSGVO. Soweit über die Website
              gezielt Gesundheitsdaten erhoben werden, erfolgt deren Verarbeitung nur, wenn
              hierfür eine zulässige Rechtsgrundlage besteht. Soweit erforderlich, holen wir
              vor der Verarbeitung eine ausdrückliche Einwilligung gemäß Art. 9 Abs. 2 lit. a
              DSGVO ein.
            </p>
            <p>
              Eine solche Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen
              werden. Wir empfehlen Nutzern, in allgemeinen Kontakt- oder Freitextfeldern nur
              diejenigen gesundheitlichen Angaben mitzuteilen, die für die Bearbeitung der
              Anfrage tatsächlich erforderlich sind.
            </p>
          </Section>

          <Section title="12. Blog, redaktionelle Inhalte und Kommentarfunktion">
            <p>
              Auf unserer Website stellen wir Blogbeiträge, Ratgeber und Informationen zu
              EMS-Training, Bewegung, Gesundheit und verwandten Themen zur Verfügung. Beim
              bloßen Lesen dieser Inhalte werden grundsätzlich nur diejenigen technischen
              Daten verarbeitet, die bereits im Zusammenhang mit der Bereitstellung der
              Website beschrieben wurden.
            </p>
            <p>
              Wenn Sie einen Kommentar zu einem Blogbeitrag hinterlassen, speichern wir den
              von Ihnen angegebenen Namen und den Inhalt Ihres Kommentars. Die Angabe eines
              Klarnamens ist nicht erforderlich; ein Pseudonym genügt. Kommentare werden vor
              der Veröffentlichung von uns geprüft und freigeschaltet.
            </p>
            <p>
              Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO sowie
              unser berechtigtes Interesse an einem missbrauchsfreien Austausch gemäß Art. 6
              Abs. 1 lit. f DSGVO. Veröffentlichte Kommentare bleiben gespeichert, bis Sie
              deren Löschung verlangen; wenden Sie sich hierfür an {email}.
            </p>
            <p>
              Sofern innerhalb von Blogbeiträgen externe Inhalte wie Karten oder
              vergleichbare Dienste eingebunden werden, gelten ergänzend die entsprechenden
              Datenschutzinformationen dieser Datenschutzerklärung.
            </p>
          </Section>

          <Section title="13. Verarbeitung von Kunden- und Vertragsdaten">
            <p>
              Soweit über die Website Anfragen gestellt werden, die anschließend zu einer
              Mitgliedschaft, einem Probetraining oder einem sonstigen Vertragsverhältnis
              führen, können die hierfür notwendigen personenbezogenen Daten zur
              Vertragsdurchführung weiterverarbeitet werden.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Soweit gesetzliche
              Aufbewahrungspflichten bestehen, insbesondere aus handels- oder steuerrechtlichen
              Vorschriften, erfolgt die weitere Speicherung auf Grundlage von Art. 6 Abs. 1
              lit. c DSGVO.
            </p>
          </Section>

          <Section title="14. Empfänger personenbezogener Daten und Auftragsverarbeitung">
            <p>
              Wir geben personenbezogene Daten grundsätzlich nur weiter, wenn dies zur
              Erfüllung eines Vertrages erforderlich ist, eine gesetzliche Verpflichtung
              besteht, wir ein berechtigtes Interesse an der Weitergabe haben oder Sie in die
              Weitergabe eingewilligt haben.
            </p>
            <p>
              Empfänger beziehungsweise Auftragsverarbeiter sind auf dieser Website
              insbesondere unser Hosting-Anbieter, der Betreiber unserer Datenbank sowie der
              Dienstleister für den Versand von Bestätigungs-E-Mails. Soweit Dienstleister
              personenbezogene Daten ausschließlich in unserem Auftrag verarbeiten, schließen
              wir mit diesen – soweit gesetzlich erforderlich – Verträge zur
              Auftragsverarbeitung gemäß Art. 28 DSGVO.
            </p>
          </Section>

          <Section title="15. Übermittlung von Daten in Drittländer">
            <p>
              Soweit im Rahmen bestimmter Dienste personenbezogene Daten an Empfänger
              außerhalb der Europäischen Union beziehungsweise des Europäischen
              Wirtschaftsraums übermittelt werden, erfolgt dies nur unter Beachtung der
              Anforderungen der Art. 44 ff. DSGVO.
            </p>
            <p>
              Eine Datenübermittlung kann insbesondere auf Grundlage eines
              Angemessenheitsbeschlusses der Europäischen Kommission, geeigneter Garantien
              wie den Standardvertragsklauseln der Europäischen Kommission oder – soweit
              gesetzlich zulässig – Ihrer ausdrücklichen Einwilligung erfolgen. Auf mögliche
              Drittlandübermittlungen bei einzelnen Diensten weisen wir innerhalb der
              jeweiligen Abschnitte gesondert hin.
            </p>
          </Section>

          <Section title="16. Speicherdauer">
            <p>
              Personenbezogene Daten werden grundsätzlich nur so lange gespeichert, wie dies
              für den jeweiligen Verarbeitungszweck erforderlich ist. Bestehen gesetzliche
              Aufbewahrungspflichten, werden die betroffenen Daten entsprechend diesen
              gesetzlichen Fristen gespeichert.
            </p>
            <p>
              Daten können darüber hinaus aufbewahrt werden, soweit dies für die
              Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich
              ist. Nach Wegfall des jeweiligen Verarbeitungszwecks beziehungsweise nach
              Ablauf gesetzlicher Aufbewahrungsfristen werden die Daten gelöscht oder
              anonymisiert.
            </p>
          </Section>

          <Section title="17. Ihre Rechte">
            <p>
              Sie haben nach Maßgabe der gesetzlichen Voraussetzungen insbesondere folgende
              Rechte:
            </p>
            <List
              items={[
                "Recht auf Auskunft gemäß Art. 15 DSGVO",
                "Recht auf Berichtigung unrichtiger Daten gemäß Art. 16 DSGVO",
                "Recht auf Löschung gemäß Art. 17 DSGVO",
                "Recht auf Einschränkung der Verarbeitung gemäß Art. 18 DSGVO",
                "Recht auf Datenübertragbarkeit gemäß Art. 20 DSGVO",
                "Recht auf Widerspruch gemäß Art. 21 DSGVO",
                "Recht auf Widerruf einer erteilten Einwilligung gemäß Art. 7 Abs. 3 DSGVO",
                "Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde gemäß Art. 77 DSGVO",
              ]}
            />
            <p>Zur Ausübung Ihrer Rechte können Sie sich jederzeit an uns wenden: {email}</p>
          </Section>

          <Section title="18. Widerspruchsrecht">
            <p>
              Soweit personenbezogene Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
              verarbeitet werden, haben Sie gemäß Art. 21 DSGVO das Recht, aus Gründen, die
              sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung
              Widerspruch einzulegen.
            </p>
            <p>
              Werden personenbezogene Daten zum Zwecke der Direktwerbung verarbeitet, haben
              Sie das Recht, jederzeit und ohne Angabe von Gründen der Verarbeitung Ihrer
              personenbezogenen Daten zum Zwecke derartiger Werbung zu widersprechen.
            </p>
          </Section>

          <Section title="19. Widerruf Ihrer Einwilligung">
            <p>
              Soweit eine Datenverarbeitung auf Ihrer Einwilligung beruht, können Sie diese
              Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Die
              Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt hiervon
              unberührt.
            </p>
          </Section>

          <Section title="20. Beschwerderecht bei der Aufsichtsbehörde">
            <p>
              Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde über die
              Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Für Unternehmen mit
              Sitz in Nordrhein-Westfalen ist insbesondere folgende Aufsichtsbehörde
              zuständig:
            </p>
            <p>
              Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen
              (LDI NRW)
              <br />
              Postfach 20 04 44, 40102 Düsseldorf
              <br />
              Dienstanschrift: Kavalleriestraße 2–4, 40213 Düsseldorf
              <br />
              Telefon: 0211 38424-0
              <br />
              E-Mail: poststelle@ldi.nrw.de
            </p>
          </Section>

          <Section title="21. Automatisierte Entscheidungsfindung und Profiling">
            <p>
              Eine ausschließlich auf einer automatisierten Verarbeitung beruhende
              Entscheidungsfindung im Sinne von Art. 22 DSGVO, die Ihnen gegenüber rechtliche
              Wirkung entfaltet oder Sie in ähnlicher Weise erheblich beeinträchtigt, findet
              nicht statt.
            </p>
          </Section>

          <Section title="22. Google Analytics">
            <p>
              Soweit Sie hierzu über unseren Cookie-Hinweis Ihre Zustimmung erteilt haben,
              nutzen wir Google Analytics, einen Webanalysedienst der Google Ireland Limited,
              Gordon House, Barrow Street, Dublin 4, Irland.
            </p>
            <p>
              Google Analytics ermöglicht es uns, die Nutzung unserer Website statistisch
              auszuwerten. Hierbei können insbesondere Informationen über aufgerufene Seiten,
              Zeitpunkt und Dauer des Besuchs, verwendete Geräte und Browser, ungefähre
              geografische Herkunft sowie Interaktionen mit unserer Website verarbeitet
              werden. Google Analytics kann Cookies oder vergleichbare Technologien
              verwenden.
            </p>
            <p>
              Die Nutzung erfolgt ausschließlich nach Ihrer Einwilligung auf Grundlage von
              Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit § 25 Abs. 1 TDDDG. Ohne Ihre
              Zustimmung wird Google Analytics nicht geladen. Ihre Einwilligung können Sie
              jederzeit widerrufen. Im Rahmen der Nutzung von Google-Diensten kann eine
              Verarbeitung von Daten außerhalb der Europäischen Union beziehungsweise des
              Europäischen Wirtschaftsraums stattfinden. Eine solche Übermittlung erfolgt
              unter Beachtung der Art. 44 ff. DSGVO.
            </p>
          </Section>

          <Section title="23. Google Maps">
            <p>
              Soweit Sie hierzu Ihre Einwilligung erteilen, setzen wir Google Maps zur
              Darstellung unserer Studiostandorte und zur erleichterten Anfahrtsplanung ein.
              Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
              Irland.
            </p>
            <p>
              Beim Laden einer Google-Maps-Karte können insbesondere Ihre IP-Adresse sowie
              technische Informationen über Ihr Endgerät an Google übertragen werden. Die
              Karte wird erst geladen, nachdem Sie im Cookie-Hinweis zugestimmt oder die
              Karte ausdrücklich per Klick aktiviert haben. Solange Sie nicht zustimmen,
              sehen Sie lediglich einen Platzhalter, und es findet keine Datenübertragung an
              Google statt. Die Adressen unserer Studios finden Sie auch ohne Kartennutzung
              im Textformat auf der Studio- und Kontaktseite.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit § 25 Abs. 1
              TDDDG. Ihre Einwilligung können Sie jederzeit widerrufen. Weitere Informationen
              finden Sie in der Datenschutzerklärung von Google:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime hover:underline"
              >
                policies.google.com/privacy
              </a>
              .
            </p>
          </Section>

          <Section title="24. Schriftarten">
            <p>
              Die auf dieser Website verwendeten Schriftarten werden lokal auf unserem Server
              gespeichert und von dort ausgeliefert. Beim Laden der Schriften wird{" "}
              <strong>keine</strong> Verbindung zu Servern von Google oder anderen Dritten
              hergestellt; es werden keine Daten an Dritte übertragen.
            </p>
          </Section>

          <Section title="25. Aktualität und Änderung dieser Datenschutzerklärung">
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich
              gesetzliche Vorgaben, unsere Website, die eingesetzten technischen Dienste oder
              unsere Datenverarbeitungsprozesse ändern. Es gilt die jeweils auf dieser
              Website veröffentlichte aktuelle Fassung.
            </p>
          </Section>
        </div>
      </Container>
    </section>
  );
}
