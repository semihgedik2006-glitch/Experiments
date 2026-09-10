"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { abmeldenVomNewsletter, type ActionResult } from "@/lib/actions/newsletter";

/**
 * Der eine Knopf, der die Abmeldung auslöst.
 *
 * Nach dem Erfolg steht kein "Doch wieder anmelden?"-Angebot da. Wer eben
 * abgemeldet hat, will nicht im selben Atemzug zurückgeworben werden -
 * das ist der Moment, in dem aus einer Abmeldung eine Beschwerde wird.
 * Stattdessen ein Weg zurück auf die Website, mehr nicht.
 */
export function AbmeldeKnopf({ token }: { token: string }) {
  const [ergebnis, setErgebnis] = useState<ActionResult | null>(null);
  const [laeuft, starten] = useTransition();

  if (ergebnis?.ok) {
    return (
      <div className="admin-panel flex flex-col items-center px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/15 text-accent">
          <CheckCircle2 size={24} aria-hidden />
        </span>
        <p className="mt-4 text-lg font-semibold">Erledigt</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Du bekommst keinen Newsletter mehr von uns. Terminbestätigungen und
          Erinnerungen zu einem gebuchten Probetraining sind davon nicht
          betroffen - die gehören zum Termin, nicht zur Werbung.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-lime"
        >
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-sm text-muted">
        Mit einem Klick nehmen wir deine Adresse aus dem Verteiler. Sie wird
        dabei gelöscht, nicht nur stillgelegt.
      </p>

      <button
        type="button"
        disabled={laeuft}
        aria-busy={laeuft}
        onClick={() =>
          starten(async () => {
            setErgebnis(await abmeldenVomNewsletter(token));
          })
        }
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
      >
        {laeuft && <Loader2 size={15} className="animate-spin" aria-hidden />}
        {laeuft ? "Wird abgemeldet..." : "Vom Newsletter abmelden"}
      </button>

      {/* aria-live: Der Fehler steht unter dem Knopf und wird sonst nur
          gesehen, nicht vorgelesen. */}
      <p aria-live="polite" className="mt-4 text-sm text-danger empty:mt-0">
        {ergebnis && !ergebnis.ok ? ergebnis.message : ""}
      </p>
    </div>
  );
}
