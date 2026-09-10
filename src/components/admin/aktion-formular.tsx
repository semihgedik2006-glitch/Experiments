"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { aktionAendern, aktionAnlegen } from "@/lib/actions/admin-aktionen";
import { adminInput } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/actions/newsletter";

const leer: ActionResult = { ok: false, message: "" };

/** "2026-08-31" - das Format, das ein Datumsfeld erwartet. */
function alsFeldwert(datum: Date | null): string {
  if (!datum) return "";
  return datum.toISOString().slice(0, 10);
}

export function AktionFormular({
  aktion,
}: {
  /** Fehlt sie, ist das Formular zum Anlegen. */
  aktion?: {
    id: string;
    code: string;
    label: string;
    benefit: string | null;
    active: boolean;
    validFrom: Date | null;
    validUntil: Date | null;
  };
}) {
  const [status, absenden, pending] = useActionState(
    aktion ? aktionAendern : aktionAnlegen,
    leer,
  );

  return (
    <form action={absenden} className="space-y-3">
      {aktion && <input type="hidden" name="id" value={aktion.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">Code</span>
          <input
            type="text"
            name="code"
            required
            maxLength={40}
            defaultValue={aktion?.code ?? ""}
            autoComplete="off"
            placeholder="SOMMER26"
            className={`${adminInput} mt-1 uppercase`}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Wofür der Code steht</span>
          <input
            type="text"
            name="label"
            required
            maxLength={160}
            defaultValue={aktion?.label ?? ""}
            placeholder="Anzeige Kölner Wochenspiegel KW 30"
            className={`${adminInput} mt-1`}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs text-muted">Was der Gast bekommt (optional)</span>
          <input
            type="text"
            name="benefit"
            maxLength={300}
            defaultValue={aktion?.benefit ?? ""}
            placeholder="Zweites Probetraining gratis"
            className={`${adminInput} mt-1`}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Gültig ab (optional)</span>
          <input
            type="date"
            name="validFrom"
            defaultValue={alsFeldwert(aktion?.validFrom ?? null)}
            className={`${adminInput} mt-1`}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Gültig bis einschließlich (optional)</span>
          <input
            type="date"
            name="validUntil"
            defaultValue={alsFeldwert(aktion?.validUntil ?? null)}
            className={`${adminInput} mt-1`}
          />
        </label>
      </div>

      {/* Neue Aktionen sind voreingestellt aktiv - alles andere wäre eine
          Falle: angelegt, gedruckt, und dann funktioniert der Code nicht. */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={aktion?.active ?? true}
          className="h-4 w-4 accent-[var(--color-lime)]"
        />
        Code ist gültig
      </label>

      {status.message && (
        <p role="status" className={`text-sm ${status.ok ? "text-accent" : "text-danger"}`}>
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
        {pending ? "Wird gespeichert..." : aktion ? "Änderungen speichern" : "Aktion anlegen"}
      </button>
    </form>
  );
}
