"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createSlot } from "@/lib/actions/admin-slots";
import { adminInput } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

/**
 * Die Beschriftungen standen vorher als <label> neben ihrem Feld, ohne
 * Verbindung dazu - für die Sprachausgabe waren die Felder damit namenlos
 * ("Kombinationsfeld", "Textfeld"). Jetzt umschließt das <label> sein Feld.
 */
function Feld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

export function SlotForm({ studios }: { studios: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createSlot, initialState);

  return (
    <form
      action={formAction}
      className="admin-panel flex flex-wrap items-end gap-3 p-4 sm:p-5"
    >
      {studios.length > 1 && (
        <Feld label="Studio">
          <select name="studioId" required className={adminInput}>
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </Feld>
      )}
      {studios.length === 1 && <input type="hidden" name="studioId" value={studios[0].id} />}

      <Feld label="Datum">
        <input type="date" name="date" required className={adminInput} />
      </Feld>
      <Feld label="Von">
        <input type="time" name="startTime" required className={adminInput} />
      </Feld>
      <Feld label="Bis">
        <input type="time" name="endTime" required className={adminInput} />
      </Feld>
      <Feld label="Kapazität">
        <input
          type="number"
          name="capacity"
          min={1}
          defaultValue={1}
          required
          className={`${adminInput} w-20`}
        />
      </Feld>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
        {pending ? "Wird angelegt..." : "Termin anlegen"}
      </button>

      {state?.message && (
        <p className={`w-full text-sm ${state.ok ? "text-accent" : "text-danger"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
