import type { Metadata } from "next";
import Link from "@/components/sprach-link";
import { CalendarClock, KeyRound, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ZugangAnfordern } from "@/components/termin/zugang-anfordern";
import { ImpulsSzene } from "@/components/ui/impuls-szene";
import { GUELTIG_MINUTEN } from "@/lib/kundenbereich";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import type { Sprache } from "@/lib/sprache";

export function meineTermineMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(sprache, "/meine-termine", {
    title: sprache === "en" ? "My appointments" : "Meine Termine",
    description:
      sprache === "en"
        ? "All your appointments at Körperformen in one place - no account and no password. Enter your address, get a link by email, done."
        : "Alle deine Termine bei Körperformen an einer Stelle - ohne Konto und ohne Passwort. Adresse eingeben, Link im Postfach, fertig.",
  });
}

const KAESTEN = {
  de: [
    {
      icon: KeyRound,
      titel: "Warum kein Passwort?",
      text: "Weil es nichts sicherer machen würde. Ein vergessenes Passwort setzt man über das Postfach zurück - das Postfach ist also ohnehin die Tür. Wir sparen uns den Umweg und dir ein Passwort mehr.",
    },
    {
      icon: CalendarClock,
      titel: `Der Link gilt ${GUELTIG_MINUTEN} Minuten`,
      text: "Danach holst du dir einfach einen neuen, beliebig oft. So liegt in deinem Postfach kein Link, der Monate später noch funktioniert.",
    },
    {
      icon: ShieldCheck,
      titel: "Was du dort siehst",
      text: "Deine Termine mit Datum, Uhrzeit und Studio. Absagen und Verlegen läuft weiter über den Link aus der jeweiligen Bestätigungsmail - ein Klick weiter.",
    },
  ],
  en: [
    {
      icon: KeyRound,
      titel: "Why no password?",
      text: "Because it would not make anything safer. A forgotten password is reset through your inbox anyway - so your inbox is the door either way. We skip the detour and save you one more password.",
    },
    {
      icon: CalendarClock,
      titel: `The link is valid for ${GUELTIG_MINUTEN} minutes`,
      text: "After that, simply request a new one, as often as you like. That way there is no link in your inbox that still works months later.",
    },
    {
      icon: ShieldCheck,
      titel: "What you will see",
      text: "Your appointments with date, time and studio. Cancelling and rescheduling still works through the link in each confirmation email - one click further.",
    },
  ],
};

/**
 * Der Einstieg in den eigenen Terminbereich.
 *
 * Diese Seite darf in den Index: Sie enthält nichts als ein Formular.
 * Die Seite dahinter - die mit den Terminen - ist von der Indizierung
 * ausgenommen.
 *
 * Die drei Kästen unten beantworten die Fragen, die vor dem Absenden
 * aufkommen ("warum kein Passwort?", "was seht ihr da?"). Sie stehen
 * unter dem Formular und nicht darüber: Wer den Link will, soll ihn
 * anfordern können, ohne vorher drei Absätze zu lesen.
 */
export function MeineTermineSeite({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  return (
    <>
      <PageHeader
        ohneMotiv
        kicker={en ? "Your appointments" : "Deine Termine"}
        title={
          en ? (
            <>
              Everything in <span className="text-accent">one place</span>
            </>
          ) : (
            <>
              Alles an <span className="text-accent">einer Stelle</span>
            </>
          )
        }
        intro={
          en
            ? "Enter your email address - you will get a link to all appointments we have under this address. No account, no password."
            : "Trag deine E-Mail-Adresse ein - du bekommst einen Link zu allen Terminen, die unter dieser Adresse bei uns liegen. Kein Konto, kein Passwort."
        }
      />

      <Container className="pb-24">
        {/* Diese Seite trägt bewusst kein Motiv im Kopf (ohneMotiv oben) -
            sie bestand dadurch aus einem Eingabefeld auf leerer Fläche.
            Das Bild steht neben dem Feld und erzählt genau das, was gleich
            passiert: Der Impuls läuft in einen Umschlag. */}
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <ZugangAnfordern />
          <ImpulsSzene
            name="postfach"
            className="mx-auto hidden w-full max-w-[240px] md:block"
          />
        </div>

        <div className="mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {KAESTEN[sprache].map(({ icon: Icon, titel, text }) => (
            <div key={titel} className="rounded-2xl border border-border bg-surface p-5">
              <Icon size={18} className="text-accent" aria-hidden />
              <h2 className="mt-3 text-sm font-semibold">{titel}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          {en ? "No appointment yet?" : "Noch gar keinen Termin?"}{" "}
          <Link href="/probetermin" className="text-accent underline underline-offset-2">
            {en ? "Book your free trial session here" : "Hier geht es zum kostenlosen Probetraining"}
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
