import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { AbmeldeKnopf } from "@/components/newsletter/abmelde-knopf";
import type { Sprache } from "@/lib/sprache";

export function abmeldenMetadaten(sprache: Sprache): Metadata {
  return {
    title: sprache === "en" ? "Unsubscribe from the newsletter" : "Newsletter abmelden",
    // Diese Adresse gehört genau einer Person. Sie darf weder in einer
    // Suchmaschine landen noch als Verweis weitergereicht werden - ein
    // Referrer würde den Schlüssel an die nächste Seite mitgeben.
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

/**
 * Abmeldung vom Newsletter.
 *
 * Warum hier ein Knopf steht und nicht schon das Öffnen abmeldet:
 * Postfächer und Sicherheitsprogramme rufen Links in E-Mails vorab auf,
 * um sie zu prüfen. Würde die Seite beim Aufruf abmelden, verschwänden
 * Abonnenten, die nie geklickt haben.
 *
 * Ein Klick ist trotzdem alles - keine Rückfrage, keine Anmeldung, kein
 * Formular. Mehr verlangt § 7 Abs. 2 Nr. 4 UWG auch nicht, und alles
 * darüber hinaus wäre eine Hürde vor einem Recht.
 *
 * Der Schlüssel wird hier NICHT nachgeschlagen. Damit sieht eine Adresse,
 * die es nie gab, genauso aus wie eine gültige - wer Schlüssel
 * durchprobiert, erfährt nichts.
 */
export function NewsletterAbmeldenSeite({ sprache, token }: { sprache: Sprache; token: string }) {
  const en = sprache === "en";
  return (
    <>
      <PageHeader
        kicker="Newsletter"
        title={
          en ? (
            <>
              Not <span className="text-accent-strong">reading</span> any more?
            </>
          ) : (
            <>
              Nicht mehr <span className="text-accent-strong">mitlesen</span>?
            </>
          )
        }
        intro={
          en
            ? "No problem. One click and we will stop writing to you."
            : "Kein Problem. Ein Klick, und wir schreiben dir nicht mehr."
        }
        ohneMotiv
      />

      <section className="py-16 sm:py-20">
        <Container className="max-w-xl">
          <AbmeldeKnopf token={token} />
        </Container>
      </section>
    </>
  );
}
