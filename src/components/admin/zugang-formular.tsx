"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { zugangAendern, zugangAnlegen } from "@/lib/actions/admin-team";
import { adminInput } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/actions/newsletter";

const leer: ActionResult = { ok: false, message: "" };

export type StudioWahl = { id: string; name: string };

/**
 * Anlegen und Ändern eines Zugangs.
 *
 * Die Standortauswahl erscheint nur bei der Rolle Studioleitung - bei der
 * Leitung gäbe es nichts zu wählen, und ein sichtbares, aber wirkungsloses
 * Feld führt in die Irre.
 */
export function ZugangFormular({
  studios,
  zugang,
}: {
  studios: StudioWahl[];
  /** Fehlt er, ist das Formular zum Anlegen. */
  zugang?: {
    id: string;
    email: string;
    name: string | null;
    istLeitung: boolean;
    studioId: string | null;
  };
}) {
  const [status, absenden, pending] = useActionState(
    zugang ? zugangAendern : zugangAnlegen,
    leer,
  );
  const [istLeitung, setIstLeitung] = useState(zugang?.istLeitung ?? false);

  return (
    <form action={absenden} className="space-y-3">
      {zugang && <input type="hidden" name="id" value={zugang.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        {zugang ? (
          <p className="text-sm">
            <span className="text-xs text-muted">E-Mail</span>
            <br />
            <span className="font-medium">{zugang.email}</span>
          </p>
        ) : (
          <label className="block">
            <span className="text-xs text-muted">E-Mail</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="off"
              placeholder="name@koerperformen.com"
              className={`${adminInput} mt-1`}
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs text-muted">Name (optional)</span>
          <input
            type="text"
            name="name"
            defaultValue={zugang?.name ?? ""}
            placeholder="Vor- und Nachname"
            className={`${adminInput} mt-1`}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Rolle</span>
          <select
            name="rolle"
            defaultValue={zugang?.istLeitung ? "LEITUNG" : "STUDIOLEITUNG"}
            onChange={(event) => setIstLeitung(event.target.value === "LEITUNG")}
            className={`${adminInput} mt-1`}
          >
            <option value="STUDIOLEITUNG">Studioleitung - nur ein Standort</option>
            <option value="LEITUNG">Leitung - alles</option>
          </select>
        </label>

        {!istLeitung && (
          <label className="block">
            <span className="text-xs text-muted">Standort</span>
            <select
              name="studioId"
              defaultValue={zugang?.studioId ?? ""}
              required
              className={`${adminInput} mt-1`}
            >
              <option value="">Bitte wählen</option>
              {studios.map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block sm:col-span-2">
          <span className="text-xs text-muted">
            {zugang ? "Neues Passwort (leer lassen = unverändert)" : "Passwort"}
          </span>
          <input
            type="password"
            name="passwort"
            required={!zugang}
            minLength={10}
            autoComplete="new-password"
            placeholder="mindestens 10 Zeichen"
            className={`${adminInput} mt-1`}
          />
        </label>
      </div>

      {status.message && (
        <p className={`text-sm ${status.ok ? "text-accent" : "text-danger"}`}>{status.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
        {pending
          ? "Wird gespeichert..."
          : zugang
            ? "Änderungen speichern"
            : "Zugang anlegen"}
      </button>
    </form>
  );
}
