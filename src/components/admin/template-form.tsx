"use client";

import { useActionState } from "react";
import { createSlotTemplate } from "@/lib/actions/admin-slots";
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

export function TemplateForm({ studios }: { studios: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createSlotTemplate, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-lime/40 bg-surface p-6"
    >
      {studios.length > 1 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Studio</label>
          <select
            name="studioId"
            required
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-lime"
          >
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {studios.length === 1 && <input type="hidden" name="studioId" value={studios[0].id} />}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Wochentag</label>
        <select
          name="weekday"
          required
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-lime"
        >
          {weekdays.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Von</label>
        <input
          type="time"
          name="startTime"
          required
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-lime"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Bis</label>
        <input
          type="time"
          name="endTime"
          required
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-lime"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Kapazität</label>
        <input
          type="number"
          name="capacity"
          min={1}
          defaultValue={1}
          required
          className="w-20 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-lime"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime disabled:opacity-50"
      >
        {pending ? "..." : "Wiederkehrend anlegen"}
      </button>

      {state?.message && (
        <p className={`w-full text-sm ${state.ok ? "text-accent" : "text-red-500"}`}>{state.message}</p>
      )}
    </form>
  );
}
