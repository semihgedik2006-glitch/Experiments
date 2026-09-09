"use client";

import { useActionState, useState } from "react";
import { CalendarClock, CalendarX, Check, Loader2 } from "lucide-react";
import { terminAbsagen, terminVerschieben } from "@/lib/actions/termin";
import type { ActionResult } from "@/lib/actions/newsletter";

const leer: ActionResult = { ok: false, message: "" };

export type FreieZeit = { id: string; label: string };

/**
 * Absagen und Verschieben.
 *
 * Beides steht bewusst hinter einem zweiten Schritt: Auf einer Seite, die
 * man über einen Link in einer E-Mail erreicht, wäre ein einzelner Knopf
 * "Absagen" zu nah an einem versehentlichen Antippen - und rückgängig
 * machen kann der Gast es nicht.
 */
export function TerminVerwaltung({
  token,
  freieZeiten,
}: {
  token: string;
  freieZeiten: FreieZeit[];
}) {
  const [absageStatus, absagen, absagePending] = useActionState(terminAbsagen, leer);
  const [verschiebeStatus, verschieben, verschiebePending] = useActionState(
    terminVerschieben,
    leer,
  );

  const [modus, setModus] = useState<"nichts" | "absagen" | "verschieben">("nichts");

  const erledigt = absageStatus.ok && absageStatus.message;
  const verschoben = verschiebeStatus.ok && verschiebeStatus.message;

  if (erledigt || verschoben) {
    return (
      <div className="card mt-8 flex items-start gap-3 p-6">
        <Check size={20} className="mt-0.5 shrink-0 text-accent" />
        <div>
          <p className="font-semibold">{erledigt ? "Abgesagt" : "Verschoben"}</p>
          <p className="mt-1 text-sm text-muted">
            {erledigt ? absageStatus.message : verschiebeStatus.message}
          </p>
          <a
            href="/probetermin"
            className="mt-4 inline-block rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90"
          >
            {erledigt ? "Neuen Termin buchen" : "Zur Terminübersicht"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {modus === "nichts" && (
        <div className="flex flex-wrap gap-3">
          {freieZeiten.length > 0 && (
            <button
              type="button"
              onClick={() => setModus("verschieben")}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime"
            >
              <CalendarClock size={16} className="text-accent" />
              Auf eine andere Zeit legen
            </button>
          )}
          <button
            type="button"
            onClick={() => setModus("absagen")}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-danger transition-colors hover:border-danger"
          >
            <CalendarX size={16} />
            Termin absagen
          </button>
        </div>
      )}

      {modus === "absagen" && (
        <form action={absagen} className="card p-6">
          <input type="hidden" name="token" value={token} />
          <p className="font-semibold">Termin wirklich absagen?</p>
          <p className="mt-1 text-sm text-muted">
            Die Zeit wird dann wieder für andere frei. Du bekommst eine kurze
            Bestätigung per E-Mail.
          </p>
          {absageStatus.message && !absageStatus.ok && (
            <p className="mt-3 text-sm text-danger">{absageStatus.message}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={absagePending}
              aria-busy={absagePending}
              className="bg-danger inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
            >
              {absagePending && <Loader2 size={15} className="animate-spin" aria-hidden />}
              {absagePending ? "Wird abgesagt..." : "Ja, Termin absagen"}
            </button>
            <button
              type="button"
              onClick={() => setModus("nichts")}
              disabled={absagePending}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime disabled:opacity-50"
            >
              Doch nicht
            </button>
          </div>
        </form>
      )}

      {modus === "verschieben" && (
        <form action={verschieben} className="card p-6">
          <input type="hidden" name="token" value={token} />
          <p className="font-semibold">Neue Zeit wählen</p>
          <p className="mt-1 text-sm text-muted">
            Alle freien Zeiten in deinem Studio in den nächsten Wochen.
          </p>

          <div className="mt-4 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {freieZeiten.map((zeit, index) => (
              <label
                key={zeit.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm transition-colors hover:border-lime has-checked:border-lime has-checked:bg-lime/10"
              >
                <input
                  type="radio"
                  name="slotId"
                  value={zeit.id}
                  defaultChecked={index === 0}
                  required
                  className="h-4 w-4 accent-[var(--color-lime)]"
                />
                {zeit.label}
              </label>
            ))}
          </div>

          {verschiebeStatus.message && !verschiebeStatus.ok && (
            <p className="mt-3 text-sm text-danger">{verschiebeStatus.message}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={verschiebePending}
              aria-busy={verschiebePending}
              className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
            >
              {verschiebePending && <Loader2 size={15} className="animate-spin" aria-hidden />}
              {verschiebePending ? "Wird verschoben..." : "Auf diese Zeit legen"}
            </button>
            <button
              type="button"
              onClick={() => setModus("nichts")}
              disabled={verschiebePending}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime disabled:opacity-50"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
