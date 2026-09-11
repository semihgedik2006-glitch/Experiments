import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, KeyRound, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ZugangAnfordern } from "@/components/termin/zugang-anfordern";
import { GUELTIG_MINUTEN } from "@/lib/kundenbereich";

export const metadata: Metadata = {
  alternates: { canonical: "/meine-termine" },
  title: "Meine Termine",
  description:
    "Alle deine Termine bei Körperformen an einer Stelle - ohne Konto und ohne Passwort. Adresse eingeben, Link im Postfach, fertig.",
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
export default function MeineTerminePage() {
  return (
    <>
      <PageHeader
        ohneMotiv
        kicker="Deine Termine"
        title={
          <>
            Alles an <span className="text-accent">einer Stelle</span>
          </>
        }
        intro="Trag deine E-Mail-Adresse ein - du bekommst einen Link zu allen Terminen, die unter dieser Adresse bei uns liegen. Kein Konto, kein Passwort."
      />

      <Container className="pb-24">
        <ZugangAnfordern />

        <div className="mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <KeyRound size={18} className="text-accent" aria-hidden />
            <h2 className="mt-3 text-sm font-semibold">Warum kein Passwort?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Weil es nichts sicherer machen würde. Ein vergessenes Passwort
              setzt man über das Postfach zurück - das Postfach ist also
              ohnehin die Tür. Wir sparen uns den Umweg und dir ein Passwort
              mehr.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <CalendarClock size={18} className="text-accent" aria-hidden />
            <h2 className="mt-3 text-sm font-semibold">
              Der Link gilt {GUELTIG_MINUTEN} Minuten
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Danach holst du dir einfach einen neuen, beliebig oft. So liegt
              in deinem Postfach kein Link, der Monate später noch
              funktioniert.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <ShieldCheck size={18} className="text-accent" aria-hidden />
            <h2 className="mt-3 text-sm font-semibold">Was du dort siehst</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Deine Termine mit Datum, Uhrzeit und Studio. Absagen und
              Verlegen läuft weiter über den Link aus der jeweiligen
              Bestätigungsmail - ein Klick weiter.
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm text-muted">
          Noch gar keinen Termin?{" "}
          <Link href="/probetermin" className="text-accent underline underline-offset-2">
            Hier geht es zum kostenlosen Probetraining
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
