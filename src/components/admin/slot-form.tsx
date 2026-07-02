"use client";

import { useActionState } from "react";
import { createSlot } from "@/lib/actions/admin-slots";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

export function SlotForm() {
  const [state, formAction, pending] = useActionState(createSlot, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Datum</label>
        <input
          type="date"
          name="date"
          required
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-lime"
        />
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
        className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-[#0d0d0f] disabled:opacity-50"
      >
        {pending ? "..." : "Termin anlegen"}
      </button>

      {state?.message && (
        <p className={`w-full text-sm ${state.ok ? "text-lime" : "text-red-500"}`}>{state.message}</p>
      )}
    </form>
  );
}
