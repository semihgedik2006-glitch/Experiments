import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return (
    <section className="py-20">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Datenschutzerklärung</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <p className="rounded-lg border border-lime/40 bg-lime/5 p-4 text-foreground">
            Platzhalter-Inhalt. Bitte diese Datenschutzerklärung vor dem
            Livegang durch einen Rechtsanwalt bzw. Datenschutzbeauftragten
            prüfen und an die tatsächlich eingesetzten Dienste (z.B. Google
            Analytics, Cookies) anpassen.
          </p>

          <div>
            <h2 className="font-semibold text-foreground">1. Verantwortlicher</h2>
            <p className="mt-2">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              <br />
              {siteConfig.name}, {siteConfig.contact.email}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p className="mt-2">
              Wenn du über unsere Formulare (z.B. Probetermin-Buchung,
              Kontaktformular oder Newsletter-Anmeldung) Daten an uns
              übermittelst, verarbeiten wir diese ausschließlich zur
              Bearbeitung deiner Anfrage bzw. zum Versand des Newsletters.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">3. Cookies</h2>
            <p className="mt-2">
              Diese Website verwendet nur technisch notwendige Cookies (z.B.
              zur Speicherung der Design-Einstellung). Sofern Analyse-Tools
              wie Google Analytics eingesetzt werden, informieren wir dich
              hierüber gesondert und holen - falls erforderlich - deine
              Einwilligung ein.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">4. Deine Rechte</h2>
            <p className="mt-2">
              Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung
              und Einschränkung der Verarbeitung deiner bei uns gespeicherten
              personenbezogenen Daten. Wende dich hierfür an{" "}
              {siteConfig.contact.email}.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
