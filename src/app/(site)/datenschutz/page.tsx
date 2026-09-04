import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung deiner personenbezogenen Daten bei Körperformen.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export default function DatenschutzPage() {
  const { companyName, owner, address, contact } = legalConfig;
  const email = contact.email;

  return (
    <section className="py-28 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Datenschutzerklärung</h1>
        <p className="mt-3 text-sm text-muted">Stand: {legalConfig.lastUpdated}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <Section title="1. Verantwortlicher">
            <p>
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
            </p>
            <p>
              {companyName}
              <br />
              Inhaber: {owner}
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              E-Mail: {email}
              <br />
              Telefon: {contact.phone}
            </p>
            {legalConfig.dataProtectionOfficer && (
              <p>Datenschutzbeauftragter: {legalConfig.dataProtectionOfficer}</p>
            )}
          </Section>

          <Section title="2. Grundsätzliches">
            <p>
              Wir verarbeiten personenbezogene Daten nur, soweit dies zur
              Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte
              und Leistungen erforderlich ist oder du eingewilligt hast. Als
              Rechtsgrundlagen kommen insbesondere in Betracht: deine Einwilligung
              (Art. 6 Abs. 1 lit. a DSGVO), die Erfüllung eines Vertrags oder
              vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO), eine
              rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO) sowie unser
              berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p>
              Die Nutzung dieser Website ist grundsätzlich ohne Angabe
              personenbezogener Daten möglich. Die Angabe von Daten in unseren
              Formularen ist freiwillig; ohne sie können wir deine Anfrage
              allerdings nicht bearbeiten.
            </p>
          </Section>

          <Section title="3. Hosting">
            <p>
              Diese Website wird bei der Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, USA gehostet. Beim Aufruf der Website werden
              technisch notwendige Verbindungsdaten an Vercel übertragen und dort
              verarbeitet. Rechtsgrundlage ist unser berechtigtes Interesse an
              einem sicheren und performanten Betrieb der Website (Art. 6 Abs. 1
              lit. f DSGVO).
            </p>
            <p>
              Die Verarbeitung kann dabei auch auf Servern in den USA erfolgen. Mit
              Vercel besteht ein Auftragsverarbeitungsvertrag. Vercel ist nach dem
              EU-US Data Privacy Framework zertifiziert; ergänzend werden
              Standardvertragsklauseln der EU-Kommission zugrunde gelegt. Ein
              gleichwertiges Datenschutzniveau wie in der EU kann für Drittländer
              dennoch nicht in jedem Fall garantiert werden.
            </p>
            <p>
              Die Datenbank dieser Website (z.B. Buchungsanfragen, Nachrichten,
              Kommentare) wird bei der Neon Inc. in einem Rechenzentrum innerhalb
              der Europäischen Union (Region Frankfurt am Main, Deutschland)
              betrieben.
            </p>
          </Section>

          <Section title="4. Server-Logfiles">
            <p>
              Beim Aufruf unserer Website werden automatisch Informationen erfasst,
              die dein Browser übermittelt. Dies sind insbesondere: aufgerufene
              Seite, Datum und Uhrzeit des Abrufs, übertragene Datenmenge,
              Referrer-URL, verwendeter Browser und Betriebssystem sowie die
              IP-Adresse.
            </p>
            <p>
              Diese Daten dienen ausschließlich der technischen Bereitstellung,
              Stabilität und Sicherheit der Website und werden nicht mit anderen
              Datenquellen zusammengeführt. Rechtsgrundlage ist Art. 6 Abs. 1
              lit. f DSGVO. Die Logdaten werden nach kurzer Zeit automatisch
              gelöscht.
            </p>
          </Section>

          <Section title="5. Cookies und lokale Speicherung">
            <p>
              Diese Website verwendet nur wenige, technisch notwendige
              Speichervorgänge im Browser (Local Storage). Gespeichert werden
              deine Entscheidung im Cookie-Hinweis sowie - falls du sie änderst -
              deine Design-Einstellung (hell/dunkel). Diese Daten verlassen deinen
              Browser nicht und werden nicht an uns übertragen. Rechtsgrundlage
              ist § 25 Abs. 2 TDDDG (unbedingt erforderliche Speicherung).
            </p>
            <p>
              Für den Admin-Bereich der Website setzen wir zusätzlich ein technisch
              notwendiges Sitzungs-Cookie zur Anmeldung ein. Dieses betrifft nur
              Mitarbeitende des Studios, nicht normale Besucher.
            </p>
            <p>
              Alle darüber hinausgehenden Dienste (Google Analytics, Google Maps)
              werden erst geladen, nachdem du im Cookie-Hinweis ausdrücklich
              zugestimmt hast. Deine Einwilligung kannst du jederzeit widerrufen,
              indem du die Website-Daten in deinem Browser löschst.
            </p>
          </Section>

          <Section title="6. Kontaktformular und Kontaktaufnahme">
            <p>
              Wenn du uns über das Kontaktformular oder per E-Mail kontaktierst,
              verarbeiten wir die von dir angegebenen Daten (Name, E-Mail-Adresse,
              ggf. Telefonnummer, Betreff und Nachricht) zur Bearbeitung deiner
              Anfrage.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern deine Anfrage
              der Anbahnung oder Erfüllung eines Vertrags dient, ansonsten unser
              berechtigtes Interesse an der Beantwortung von Anfragen (Art. 6
              Abs. 1 lit. f DSGVO). Die Daten werden gelöscht, sobald sie für die
              Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen
              Aufbewahrungsfristen entgegenstehen.
            </p>
          </Section>

          <Section title="7. Buchung eines Probetermins">
            <p>
              Für die Buchung eines Probetermins verarbeiten wir deinen Namen,
              deine E-Mail-Adresse, deine Telefonnummer, den gewünschten Termin
              bzw. Wunschzeitraum, das gewählte Studio sowie eine optionale
              Nachricht.
            </p>
            <p>
              Diese Daten benötigen wir, um deinen Termin zu koordinieren, zu
              bestätigen und dich bei Rückfragen oder Änderungen erreichen zu
              können. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
              (vorvertragliche Maßnahmen auf deine Anfrage hin).
            </p>
            <p>
              Sobald wir deinen Termin bestätigen, erhältst du automatisch eine
              Bestätigungs-E-Mail. Für den Versand nutzen wir den Dienstleister
              Resend, Inc., 2261 Market Street, San Francisco, CA 94114, USA, mit
              dem ein Auftragsverarbeitungsvertrag besteht. Hierbei werden dein
              Name, deine E-Mail-Adresse und die Termindaten übermittelt.
            </p>
          </Section>

          <Section title="8. Standortermittlung bei der Terminbuchung">
            <p>
              Auf der Seite zur Terminbuchung bieten wir dir an, automatisch das
              nächstgelegene Studio vorzuschlagen. Dein Browser fragt dich dafür
              um Erlaubnis, deinen Standort zu verwenden.
            </p>
            <p>
              Die Berechnung findet ausschließlich lokal in deinem Browser statt.
              Deine Standortdaten werden <strong>nicht</strong> an uns oder an
              Dritte übertragen und nicht gespeichert. Wenn du die Standortfreigabe
              ablehnst, kannst du das Studio weiterhin manuell auswählen.
              Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO),
              die du über die Einstellungen deines Browsers jederzeit widerrufen
              kannst.
            </p>
          </Section>

          <Section title="9. Newsletter">
            <p>
              Wenn du dich für unseren Newsletter anmeldest, speichern wir deine
              E-Mail-Adresse, um dir Trainingstipps und Angebote zuzusenden.
              Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a
              DSGVO.
            </p>
            <p>
              Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft
              widerrufen, etwa durch eine formlose Nachricht an {email}. Deine
              E-Mail-Adresse wird nach dem Widerruf aus dem Verteiler gelöscht.
            </p>
          </Section>

          <Section title="10. Kommentarfunktion im Blog">
            <p>
              Wenn du einen Kommentar zu einem Blogbeitrag hinterlässt, speichern
              wir den von dir angegebenen Namen und den Inhalt deines Kommentars.
              Die Angabe eines Klarnamens ist nicht erforderlich - ein Pseudonym
              genügt.
            </p>
            <p>
              Kommentare werden vor der Veröffentlichung von uns geprüft und
              freigeschaltet. Rechtsgrundlage ist deine Einwilligung (Art. 6
              Abs. 1 lit. a DSGVO) sowie unser berechtigtes Interesse an einem
              missbrauchsfreien Austausch (Art. 6 Abs. 1 lit. f DSGVO).
              Veröffentlichte Kommentare bleiben gespeichert, bis du ihre Löschung
              verlangst; wende dich dafür an {email}.
            </p>
          </Section>

          <Section title="11. Google Analytics (nur mit deiner Einwilligung)">
            <p>
              Sofern du im Cookie-Hinweis zugestimmt hast, nutzen wir Google
              Analytics, einen Webanalysedienst der Google Ireland Limited, Gordon
              House, Barrow Street, Dublin 4, Irland. Google Analytics verwendet
              Cookies und ähnliche Technologien, um die Nutzung unserer Website zu
              analysieren und uns zu helfen, das Angebot zu verbessern.
            </p>
            <p>
              Dabei können Informationen über dein Nutzungsverhalten an Server von
              Google - auch in den USA - übertragen und dort gespeichert werden.
              Google LLC ist nach dem EU-US Data Privacy Framework zertifiziert.
            </p>
            <p>
              Rechtsgrundlage ist ausschließlich deine Einwilligung nach Art. 6
              Abs. 1 lit. a DSGVO in Verbindung mit § 25 Abs. 1 TDDDG. Ohne deine
              Zustimmung wird Google Analytics nicht geladen. Du kannst deine
              Einwilligung jederzeit für die Zukunft widerrufen, indem du die
              Website-Daten in deinem Browser löschst und beim erneuten Aufruf
              „Nur notwendige“ wählst.
            </p>
          </Section>

          <Section title="12. Google Maps (nur mit deiner Einwilligung)">
            <p>
              Auf unseren Studio- und Kontaktseiten binden wir Kartenmaterial von
              Google Maps ein, einem Dienst der Google Ireland Limited, Gordon
              House, Barrow Street, Dublin 4, Irland.
            </p>
            <p>
              Die Karte wird erst geladen, nachdem du dem im Cookie-Hinweis
              zugestimmt oder die Karte ausdrücklich per Klick aktiviert hast. Erst
              in diesem Moment wird eine Verbindung zu Google hergestellt und deine
              IP-Adresse an Google übertragen. Solange du nicht zustimmst, siehst
              du lediglich einen Platzhalter und es findet keine Datenübertragung
              an Google statt.
            </p>
            <p>
              Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a
              DSGVO in Verbindung mit § 25 Abs. 1 TDDDG. Die Adresse unserer
              Studios findest du auch ohne Kartennutzung im Textformat auf der
              Studio- und Kontaktseite. Weitere Informationen findest du in der
              Datenschutzerklärung von Google:{" "}
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

          <Section title="13. Schriftarten">
            <p>
              Diese Website verwendet Schriftarten, die lokal auf unserem Server
              gespeichert und von dort ausgeliefert werden. Beim Laden der
              Schriften wird <strong>keine</strong> Verbindung zu Servern von
              Google oder anderen Dritten hergestellt und es werden keine Daten an
              Dritte übertragen.
            </p>
          </Section>

          <Section title="14. Social-Media-Profile">
            <p>
              Auf unserer Website verlinken wir auf unsere Profile bei Instagram,
              Facebook und TikTok. Es handelt sich dabei um einfache Verlinkungen,
              nicht um eingebettete Social-Media-Plugins. Eine Datenübertragung an
              die jeweiligen Netzwerke findet erst statt, wenn du einen dieser
              Links aktiv anklickst. Für die Datenverarbeitung auf den verlinkten
              Plattformen sind die jeweiligen Anbieter verantwortlich.
            </p>
          </Section>

          <Section title="15. Speicherdauer">
            <p>
              Wir speichern personenbezogene Daten nur so lange, wie es für die
              jeweiligen Zwecke erforderlich ist oder gesetzliche
              Aufbewahrungsfristen (insbesondere handels- und steuerrechtliche
              Fristen von bis zu zehn Jahren) dies vorschreiben. Danach werden die
              Daten gelöscht oder anonymisiert.
            </p>
          </Section>

          <Section title="16. Deine Rechte">
            <p>Dir stehen als betroffene Person die folgenden Rechte zu:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Auskunft über die zu deiner Person gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>
                Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft
                (Art. 7 Abs. 3 DSGVO)
              </li>
            </ul>
            <p>
              Zur Ausübung deiner Rechte genügt eine formlose Nachricht an {email}.
            </p>
          </Section>

          <Section title="17. Beschwerderecht bei der Aufsichtsbehörde">
            <p>
              Unabhängig davon hast du das Recht, dich bei einer
              Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Für
              Nordrhein-Westfalen zuständig ist:
            </p>
            <p>
              Landesbeauftragte für Datenschutz und Informationsfreiheit
              Nordrhein-Westfalen
              <br />
              Kavalleriestr. 2-4, 40213 Düsseldorf
              <br />
              <a
                href="https://www.ldi.nrw.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime hover:underline"
              >
                www.ldi.nrw.de
              </a>
            </p>
          </Section>

          <Section title="18. SSL-/TLS-Verschlüsselung">
            <p>
              Diese Website nutzt aus Sicherheitsgründen und zum Schutz der
              Übertragung vertraulicher Inhalte eine SSL-/TLS-Verschlüsselung. Eine
              verschlüsselte Verbindung erkennst du daran, dass die Adresszeile des
              Browsers mit „https://“ beginnt und ein Schloss-Symbol angezeigt wird.
            </p>
          </Section>

          <Section title="19. Änderungen dieser Datenschutzerklärung">
            <p>
              Wir passen diese Datenschutzerklärung an, sobald Änderungen an
              unserer Website oder an den eingesetzten Diensten dies erforderlich
              machen. Es gilt jeweils die auf dieser Seite veröffentlichte
              aktuelle Fassung.
            </p>
          </Section>
        </div>
      </Container>
    </section>
  );
}
