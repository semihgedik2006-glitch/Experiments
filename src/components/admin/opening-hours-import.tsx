"use client";

import { useActionState } from "react";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { importOpeningHours, type ImportResult } from "@/lib/actions/admin-studios";

/**
 * Öffnungszeiten für viele Studios auf einmal.
 *
 * Beim Anlegen gelten für alle importierten Standorte dieselben Zeiten -
 * in der Praxis unterscheiden sie sich aber je Studio. Sie einzeln
 * nachzupflegen hieße vierzehnmal aufklappen, tippen, speichern. Hier
 * genügt eine Liste.
 */
export function OpeningHoursImport({ studios }: { studios: string[] }) {
  const [result, action, pending] = useActionState<ImportResult | null, FormData>(
    importOpeningHours,
    null,
  );

  // Vorlage mit den tatsächlich vorhandenen Studionamen - so muss niemand
  // Namen abtippen und Tippfehler entstehen gar nicht erst.
  const vorlage = studios
    .map((name) => `${name}\nMontag - Freitag: 08:00 - 21:00 Uhr\nSamstag: 10:00 - 16:00 Uhr\nSonntag: geschlossen`)
    .join("\n\n");

  return (
    <form action={action} className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Clock size={17} className="text-accent" />
        Öffnungszeiten für mehrere Studios setzen
      </h2>
      <p className="mt-2 text-sm text-muted">
        Ein Absatz je Studio, getrennt durch eine Leerzeile. Die erste Zeile ist der
        Studioname, alle weiteren sind die Öffnungszeiten - genau so, wie sie später
        auf der Website stehen sollen.
      </p>
      <p className="mt-2 text-xs text-muted">
        Das Feld ist bereits mit allen {studios.length} vorhandenen Studios vorbelegt.
        Du musst also nur die Zeiten anpassen und speichern. Absätze, deren Name zu
        keinem Studio passt, werden gemeldet statt übergangen.
      </p>

      <textarea
        name="blocks"
        rows={14}
        required
        defaultValue={vorlage}
        className="mt-4 w-full rounded-lg border border-border bg-transparent px-4 py-3 font-mono text-xs leading-relaxed outline-none focus:border-lime"
      />

      <button
        disabled={pending}
        className="mt-4 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Wird gespeichert..." : "Öffnungszeiten speichern"}
      </button>

      {result && (
        <div className="mt-4 space-y-2 text-sm">
          {result.added > 0 && (
            <p className="flex items-center gap-2 text-accent">
              <CheckCircle2 size={16} />
              {result.added === 1
                ? "Ein Studio aktualisiert."
                : `${result.added} Studios aktualisiert.`}
            </p>
          )}
          {result.skipped.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="flex items-center gap-2 font-medium">
                <AlertTriangle size={16} />
                Nicht übernommen:
              </p>
              <ul className="mt-1.5 list-inside list-disc text-xs text-muted">
                {result.skipped.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
