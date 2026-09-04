import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen von Körperformen.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export default function AgbPage() {
  const email = legalConfig.contact.email;

  return (
    <section className="py-20 sm:py-24 md:py-32">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="mt-3 text-sm text-muted">Stand: {legalConfig.lastUpdated}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <Section title="§ 1 Geltungsbereich">
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
              Verträge zwischen {legalConfig.companyName} (nachfolgend „Studio“)
              und seinen Kundinnen und Kunden (nachfolgend „Mitglied“) über die
              Nutzung der Trainingsleistungen sowie für die über diese Website
              angebotene Terminbuchung.
            </p>
            <p>
              Abweichende Bedingungen des Mitglieds werden nicht Vertragsbestandteil,
              es sei denn, das Studio stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
          </Section>

          <Section title="§ 2 Probetermin">
            <p>
              Über diese Website kann ein kostenloser und unverbindlicher
              Probetermin angefragt werden. Die Anfrage stellt noch keinen
              verbindlichen Termin dar. Ein Termin kommt erst zustande, wenn das
              Studio die Anfrage ausdrücklich bestätigt.
            </p>
            <p>
              Aus dem Probetermin entsteht keinerlei Verpflichtung zum Abschluss
              einer Mitgliedschaft. Es fallen für den Probetermin keine Kosten an.
            </p>
          </Section>

          <Section title="§ 3 Vertragsschluss über eine Mitgliedschaft">
            <p>
              Ein Vertrag über eine Mitgliedschaft bzw. ein Trainingspaket kommt
              nicht über diese Website zustande. Er wird ausschließlich im
              persönlichen Gespräch in den Räumen des Studios geschlossen, in der
              Regel im Anschluss an einen Probetermin und ein Beratungsgespräch.
            </p>
            <p>
              Die konkreten Leistungen, Laufzeiten und Preise werden dabei
              individuell vereinbart und dem Mitglied in Textform ausgehändigt.
              Die auf dieser Website dargestellten Informationen stellen kein
              bindendes Angebot dar.
            </p>
          </Section>

          <Section title="§ 4 Leistungen des Studios">
            <p>
              Das Studio stellt dem Mitglied im Rahmen der vereinbarten
              Mitgliedschaft die Nutzung der EMS-Trainingsanlagen sowie eine
              fachliche Betreuung durch geschultes Personal zur Verfügung. Das
              EMS-Training findet grundsätzlich unter persönlicher Anleitung statt.
            </p>
            <p>
              Das Studio ist berechtigt, Trainingszeiten und Öffnungszeiten in
              zumutbarem Umfang anzupassen sowie den Betrieb wegen Feiertagen,
              Wartungsarbeiten, Betriebsferien oder aus anderen sachlichen Gründen
              vorübergehend einzuschränken. Über längere Schließzeiten wird
              rechtzeitig informiert.
            </p>
          </Section>

          <Section title="§ 5 Gesundheitliche Voraussetzungen">
            <p>
              EMS-Training ist nicht für alle Personen geeignet. Vor dem ersten
              Training füllt das Mitglied eine Gesundheitserklärung aus und
              bestätigt darin, dass keine Ausschlussgründe vorliegen.
            </p>
            <p>
              Ein EMS-Training ist insbesondere ausgeschlossen bei
              Herzschrittmachern und anderen elektronischen Implantaten, in der
              Schwangerschaft, bei Epilepsie, bei akuten Erkrankungen und
              Entzündungen, bei Thrombosen sowie bei schweren
              Durchblutungsstörungen. In Zweifelsfällen ist vor Trainingsbeginn
              ärztlicher Rat einzuholen; das Studio kann die Vorlage einer
              ärztlichen Unbedenklichkeitsbescheinigung verlangen.
            </p>
            <p>
              Das Mitglied ist verpflichtet, das Studio unverzüglich über
              gesundheitliche Veränderungen zu informieren, die dem Training
              entgegenstehen können. Unrichtige Angaben in der Gesundheitserklärung
              gehen zulasten des Mitglieds.
            </p>
          </Section>

          <Section title="§ 6 Trainingstermine, Absagen und Nichterscheinen">
            <p>
              EMS-Training findet ausschließlich nach vorheriger Terminvereinbarung
              statt. Vereinbarte Termine sind verbindlich.
            </p>
            <p>
              Kann ein Termin nicht wahrgenommen werden, ist er rechtzeitig
              abzusagen. Die konkrete Absagefrist wird im Mitgliedsvertrag geregelt.
              Bei nicht rechtzeitig abgesagten Terminen kann die Trainingseinheit
              als in Anspruch genommen gewertet werden.
            </p>
          </Section>

          <Section title="§ 7 Laufzeit und Kündigung">
            <p>
              Laufzeit, Verlängerung und Kündigungsfristen der Mitgliedschaft
              richten sich nach der im Mitgliedsvertrag getroffenen individuellen
              Vereinbarung. Die gesetzlichen Vorgaben, insbesondere die Regelungen
              der §§ 309 Nr. 9, 327c BGB zu Laufzeiten und stillschweigenden
              Verlängerungen bei Verbraucherverträgen, werden eingehalten.
            </p>
            <p>
              Das Recht beider Parteien zur außerordentlichen Kündigung aus
              wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt für das
              Mitglied insbesondere vor, wenn ihm die Nutzung der Leistungen aus
              gesundheitlichen Gründen dauerhaft unmöglich wird; ein entsprechender
              Nachweis ist auf Verlangen vorzulegen.
            </p>
            <p>
              Kündigungen bedürfen der Textform (z.B. per E-Mail an {email}).
            </p>
          </Section>

          <Section title="§ 8 Preise und Zahlungsbedingungen">
            <p>
              Es gelten die im Mitgliedsvertrag individuell vereinbarten Entgelte.
              Sofern nicht abweichend vereinbart, sind die Beiträge monatlich im
              Voraus zur Zahlung fällig.
            </p>
            <p>
              Bei Rücklastschriften, die das Mitglied zu vertreten hat, können die
              tatsächlich angefallenen Bankgebühren weiterberechnet werden.
              Änderungen der Bankverbindung sind dem Studio unverzüglich mitzuteilen.
            </p>
          </Section>

          <Section title="§ 9 Widerrufsrecht für Verbraucher">
            <p>
              Mitgliedschaftsverträge werden in den Räumen des Studios geschlossen.
              Ein gesetzliches Widerrufsrecht für Fernabsatzverträge oder außerhalb
              von Geschäftsräumen geschlossene Verträge (§§ 312g, 355 BGB) besteht
              in diesem Fall grundsätzlich nicht.
            </p>
            <p>
              Sollte im Einzelfall dennoch ein Vertrag im Fernabsatz oder außerhalb
              der Geschäftsräume zustande kommen, steht dem Mitglied als Verbraucher
              ein Widerrufsrecht von 14 Tagen ab Vertragsschluss zu. Der Widerruf
              ist gegenüber dem Studio in Textform zu erklären; eine Begründung ist
              nicht erforderlich. Über die Einzelheiten wird das Mitglied in diesem
              Fall gesondert und in gesetzlich vorgeschriebener Form belehrt.
            </p>
            <p>
              Die kostenlose Anfrage eines Probetermins über diese Website begründet
              keinen entgeltlichen Vertrag und ist jederzeit formlos widerrufbar.
            </p>
          </Section>

          <Section title="§ 10 Verhalten im Studio">
            <p>
              Das Mitglied verpflichtet sich, den Anweisungen des Studiopersonals
              Folge zu leisten sowie die Einrichtungen und Geräte pfleglich zu
              behandeln. Für das Training ist geeignete Sportkleidung erforderlich;
              Handtücher sind mitzubringen.
            </p>
            <p>
              Das Studio kann Personen, die trotz Abmahnung nachhaltig gegen die
              Studioordnung verstoßen, andere Mitglieder belästigen oder unter dem
              Einfluss von Alkohol oder Betäubungsmitteln stehen, vom Training
              ausschließen.
            </p>
          </Section>

          <Section title="§ 11 Haftung">
            <p>
              Das Studio haftet unbeschränkt für Schäden aus der Verletzung des
              Lebens, des Körpers oder der Gesundheit, die auf einer fahrlässigen
              oder vorsätzlichen Pflichtverletzung des Studios oder seiner
              Erfüllungsgehilfen beruhen, sowie für sonstige Schäden, die auf
              Vorsatz oder grober Fahrlässigkeit beruhen.
            </p>
            <p>
              Bei einfacher Fahrlässigkeit haftet das Studio nur bei Verletzung
              einer wesentlichen Vertragspflicht (Kardinalpflicht) und begrenzt auf
              den vertragstypischen, vorhersehbaren Schaden. Eine weitergehende
              Haftung ist ausgeschlossen.
            </p>
            <p>
              Das Training erfolgt im Übrigen auf eigene Verantwortung des
              Mitglieds, insbesondere hinsichtlich der Richtigkeit der Angaben in
              der Gesundheitserklärung. Für eingebrachte Wertsachen haftet das
              Studio nur im Rahmen der gesetzlichen Bestimmungen.
            </p>
          </Section>

          <Section title="§ 12 Datenschutz">
            <p>
              Die Verarbeitung personenbezogener Daten erfolgt ausschließlich nach
              Maßgabe der geltenden Datenschutzbestimmungen. Einzelheiten sind
              unserer{" "}
              <a href="/datenschutz" className="text-lime hover:underline">
                Datenschutzerklärung
              </a>{" "}
              zu entnehmen.
            </p>
          </Section>

          <Section title="§ 13 Streitbeilegung">
            <p>
              Wir sind nicht bereit und nicht verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </Section>

          <Section title="§ 14 Schlussbestimmungen">
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
              UN-Kaufrechts. Ist das Mitglied Verbraucher, bleiben zwingende
              Verbraucherschutzvorschriften seines Aufenthaltsstaates unberührt.
            </p>
            <p>
              Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam
              sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen
              unberührt. An die Stelle der unwirksamen Bestimmung tritt die
              gesetzliche Regelung.
            </p>
            <p>
              Änderungen und Ergänzungen des Mitgliedsvertrags bedürfen der
              Textform.
            </p>
          </Section>
        </div>
      </Container>
    </section>
  );
}
