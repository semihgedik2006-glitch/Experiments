import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact-form";
import { LottieBox } from "@/components/lottie-box";
import { ImpulsSzene } from "@/components/ui/impuls-szene";
import { getStudios } from "@/lib/data";
import { isVisible } from "@/lib/site-toggles";
import { siteConfig } from "@/lib/site-config";
import { StudioJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  // Kanonische Adresse: Sonst kann Google dieselbe Seite unter mehreren
  // Adressen als mehrere Seiten werten und die Bewertung aufteilen.
  alternates: { canonical: "/kontakt" },
  title: "Kontakt",
  description: "Kontaktiere Körperformen bei Fragen rund um EMS-Training, Preise oder deinen Probetermin.",
};

/**
 * Die Kontaktseite.
 *
 * Sie war die letzte Seite ohne eigenen Seitenkopf: Überschrift, Absatz,
 * dann direkt der Inhalt. Neben allen anderen Unterseiten sah sie dadurch
 * unfertig aus.
 *
 * Der zweite und größere Umbau betrifft die Standorte. Darunter standen
 * bisher ALLE vierzehn mit voller Anschrift, Telefonnummer und E-Mail
 * untereinander - eine Spalte von rund zweitausend Pixeln Höhe neben einem
 * Formular, das nach fünfhundert zu Ende ist. Wer die Nummer seines
 * Studios sucht, scrollt daran vorbei; wer schreiben will, sieht das
 * Formular nicht mehr, sobald er einmal gescrollt hat.
 *
 * Jetzt: oben das Formular neben den zentralen Wegen, darunter die
 * vierzehn Standorte als kompaktes Raster mit Name und Nummer. Jede Kachel
 * führt auf die Seite des Standorts - dort steht ohnehin mehr, als hier je
 * stehen könnte.
 */
export default async function KontaktPage() {
  // Ist der Standortbereich ausgeblendet, entfällt auch das Raster - sonst
  // führten vierzehn Kacheln auf Seiten, die es nicht mehr gibt.
  const studioSeiteSichtbar = await isVisible("studio");
  const studios = await getStudios();

  const wege = [
    {
      icon: Phone,
      label: "Anrufen",
      wert: siteConfig.contact.phone,
      href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`,
      zusatz: "Zu den Öffnungszeiten direkt im Studio",
    },
    {
      icon: Mail,
      label: "E-Mail schreiben",
      wert: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      zusatz: "Antwort in der Regel am selben Werktag",
    },
  ];

  return (
    <>
      <StudioJsonLd />

      <PageHeader
        kicker="Kontakt"
        title={
          <>
            Kontakt <span className="text-accent-strong">aufnehmen</span>
          </>
        }
        // "Wir freuen uns auf deine Nachricht" streicht sich selbst - der
        // Halbsatz danach ist die eigentliche Auskunft und bleibt.
        intro="Wir melden uns in der Regel am selben Werktag."
      />

      <section className="py-20 sm:py-24">
        <Container className="grid gap-14 md:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight">Schreib uns</h2>
            <p className="mt-3 text-muted">
              Ein paar Zeilen genügen. Wenn du eine Telefonnummer dalässt, rufen
              wir auch gern zurück.
            </p>

            {/* Die Datei lag seit Beginn im Projekt und wurde nirgends
                verwendet - ausgerechnet die, die "contact" heißt. Sie steht
                hier neben den Kontaktwegen und nicht über dem Formular:
                Oben wäre sie das größte Element der Seite und bestimmte
                damit die gemessene Ladezeit. Geladen wird sie ohnehin erst,
                wenn sie ins Bild kommt und der Browser Luft hat. */}
            <LottieBox
              src="/lottie/contact.json"
              ratio="800 / 600"
              className="mt-8 w-full max-w-[260px]"
            />

            <div className="mt-4 space-y-3">
              {wege.map((weg) => (
                <a
                  key={weg.label}
                  href={weg.href}
                  className="karte-hebt card flex items-center gap-4 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/12 text-accent">
                    <weg.icon size={18} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted">{weg.label}</span>
                    <span className="block truncate font-semibold">{weg.wert}</span>
                    <span className="block text-xs text-muted">{weg.zusatz}</span>
                  </span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </Container>
      </section>

      {/* Die Standorte als Raster statt als endlose Spalte. */}
      {studios.length > 0 && (
        <section className="border-t border-border bg-surface py-20 sm:py-24">
          {/* relative: Die Standort-Illustration liegt absolut in dieser
              Fläche. Ohne das richtete sie sich am nächsten positionierten
              Vorfahren aus - irgendwo weiter oben auf der Seite. */}
          <Container className="relative">
            {/* Erst absolut gesetzt - da lag die Nadel hinter der
                Kopfzeile, die beim Scrollen stehen bleibt. Im Raster steht
                sie da, wo sie hingehört. */}
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <Reveal className="max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {studios.length > 1
                    ? `Oder direkt an eines der ${studios.length} Studios`
                    : "Oder direkt ans Studio"}
                </h2>
                <p className="mt-3 text-muted">
                  Jeder Standort hat eine eigene Nummer.
                </p>
              </Reveal>
              <ImpulsSzene name="standort" className="mx-auto hidden w-full max-w-[190px] md:block" />
            </div>

            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studios.map((studio) => {
                const inhalt = (
                  <>
                    <span className="flex items-start gap-2.5 font-semibold">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                      {studio.name}
                    </span>
                    <span className="mt-2 block text-sm text-muted">
                      {studio.street}
                      <br />
                      {studio.postalCode} {studio.city}
                    </span>
                    {studio.phone && (
                      <span className="mt-3 block text-sm font-medium">{studio.phone}</span>
                    )}
                    {studioSeiteSichtbar && (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent">
                        Zum Standort
                        <ArrowRight size={14} aria-hidden />
                      </span>
                    )}
                  </>
                );

                return (
                  <StaggerItem key={studio.id}>
                    {/* Mit Standortseite wird die ganze Kachel zum Link.
                        Ohne sie bleibt sie eine Kachel - ein Link ins Nichts
                        wäre schlechter als keiner. */}
                    {studioSeiteSichtbar && studio.slug ? (
                      <Link
                        href={`/studio/${studio.slug}`}
                        className="karte-hebt card block h-full p-5"
                      >
                        {inhalt}
                      </Link>
                    ) : (
                      <div className="card h-full p-5">{inhalt}</div>
                    )}
                  </StaggerItem>
                );
              })}
            </Stagger>
          </Container>
        </section>
      )}
    </>
  );
}
