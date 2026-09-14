"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Phone, RotateCcw, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Was der Besucher sieht, wenn etwas schiefgeht.
 *
 * Gemessen, nicht vermutet: Ohne diese Datei liefert die fertig gebaute
 * Website bei einem Fehler eine <b>komplett weiße Seite ohne Titel und
 * ohne ein einziges Wort Text</b> aus. Nachgestellt, indem die Datenbank
 * angehalten wurde - dann antworten /blog, die Seite mit den eigenen
 * Terminen und <b>alle vierzehn Standortseiten</b> so. Ausgerechnet die
 * Standortseiten sind die, auf denen Leute aus der Google-Suche nach
 * "EMS Hürth" ankommen.
 *
 * Deshalb steht hier zuallererst die Telefonnummer. Wenn die Website
 * gerade nicht kann, was sie soll, ist das Studio trotzdem erreichbar -
 * und ein Anruf ist dem Studio ohnehin lieber als ein Formular.
 *
 * Bewusst ohne technische Einzelheiten: Ein Besucher kann mit
 * "PrismaClientKnownRequestError" nichts anfangen. Die Kennung steht
 * klein darunter, damit man sie am Telefon durchgeben kann.
 */
export default function SiteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  /**
   * Heißt in dieser Next-Fassung nicht mehr reset().
   *
   * Der Unterschied ist nicht nur der Name: unstable_retry() lädt die
   * Daten neu, reset() setzt bloß den Fehlerzustand zurück. Bei einer
   * Datenbank, die kurz nicht antwortet, wäre reset() also wirkungslos -
   * es würde denselben alten Fehler erneut zeigen.
   */
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In den Serverprotokollen landet der Fehler ohnehin. Hier geht es um
    // den Fall, dass er erst im Browser auftritt - der taucht sonst
    // nirgends auf.
    console.error("Fehler auf der Website:", error);
  }, [error]);

  const telefon = siteConfig.contact.phone;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      {/* Gemessen: Diese Seite kommt mit Status 200 zurück, nicht mit 500.
          Das ist keine Nachlässigkeit, sondern die Folge davon, wie die
          Seite ausgeliefert wird - wenn der Fehler auftritt, sind die
          Kopfzeilen der Antwort längst raus und der Status nicht mehr zu
          ändern.
          Für einen Menschen ist das egal, für Google nicht: Ohne diese
          Zeile könnte "Diese Seite lädt gerade nicht" als Inhalt der
          Blog-Seite im Suchindex landen. React hebt das Element in den
          Kopf des Dokuments. */}
      <meta name="robots" content="noindex, nofollow" />

      <div className="w-full max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Kurz nicht erreichbar
        </p>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Diese Seite lädt gerade nicht.
        </h1>
        <p className="lesebreite mx-auto mt-4 text-muted">
          Das liegt an uns, nicht an dir. Versuch es in einem Moment noch einmal
          &ndash; oder ruf einfach an, dann klären wir es direkt.
        </p>

        {/* Der Anruf steht vor dem Neuladen: Wer hier gelandet ist, wollte
            etwas von uns. Ein zweiter Versuch kann genauso scheitern, das
            Telefon nicht. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${telefon.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2.5 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-on-lime transition-transform hover:scale-105 active:scale-95"
          >
            <Phone size={17} aria-hidden />
            {telefon}
          </a>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center gap-2.5 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-lime"
          >
            <RotateCcw size={16} aria-hidden />
            Nochmal versuchen
          </button>
        </div>

        {/* Wege, die erfahrungsgemäß weiterhelfen: Startseite und
            Standortliste sind vorgerendert und stehen deshalb auch dann,
            wenn die Datenbank gerade nicht antwortet. */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/"
            className="tastflaeche text-accent underline underline-offset-4 hover:text-foreground"
          >
            Zur Startseite
          </Link>
          <Link
            href="/studio"
            className="tastflaeche inline-flex items-center gap-1.5 text-accent underline underline-offset-4 hover:text-foreground"
          >
            <MapPin size={14} aria-hidden />
            Alle Standorte
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 text-xs text-muted">
            Kennung für Rückfragen: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  );
}
