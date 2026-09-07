"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createSlotTemplate } from "@/lib/actions/admin-slots";
import { adminInput } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

const weekdays = [
  { value: 1, label: "Montag" },
  { value: 2, label: "Dienstag" },
  { value: 3, label: "Mittwoch" },
  { value: 4, label: "Donnerstag" },
  { value: 5, label: "Freitag" },
  { value: 6, label: "Samstag" },
  { value: 0, label: "Sonntag" },
];

/** Siehe slot-form.tsx: Das <label> umschließt sein Feld, damit die
    Sprachausgabe den Namen des Feldes nennt. */
function Feld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

export function TemplateForm({ studios }: { studios: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createSlotTemplate, initialState);

  return (
    <form
      action={formAction}
      className="admin-panel flex flex-wrap items-end gap-3 border-lime/40 p-4 sm:p-5"
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

      <Feld label="Wochentag">
        <select name="weekday" required className={adminInput}>
          {weekdays.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
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
        {pending ? "Wird angelegt..." : "Wiederkehrend anlegen"}
      </button>

      {state?.message && (
        <p className={`w-full text-sm ${state.ok ? "text-accent" : "text-danger"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
