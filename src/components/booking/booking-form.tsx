"use client";

import { useActionState, useState } from "react";
import { createBooking } from "@/lib/actions/booking";
import type { ActionResult } from "@/lib/actions/newsletter";

type DayGroup = {
  dateKey: string;
  dateLabel: string;
  slots: { id: string; startTime: string; endTime: string }[];
};

const initialState: ActionResult = { ok: false, message: "" };

export function BookingForm({ days }: { days: DayGroup[] }) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.dateKey ?? "");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  const activeDay = days.find((d) => d.dateKey === selectedDay);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-lime bg-surface p-10 text-center">
        <h3 className="text-xl font-semibold text-lime">Anfrage gesendet!</h3>
        <p className="mt-3 text-muted">{state.message}</p>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-muted">
        Aktuell sind keine freien Termine verfügbar. Kontaktiere uns gerne direkt
        über die Kontaktseite.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-semibold">1. Tag wählen</p>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => {
                setSelectedDay(day.dateKey);
                setSelectedSlotId(null);
              }}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selectedDay === day.dateKey
                  ? "border-lime bg-lime text-[#0d0d0f]"
                  : "border-border hover:border-lime"
              }`}
            >
              {day.dateLabel}
            </button>
          ))}
        </div>
      </div>

      {activeDay && (
        <div>
          <p className="mb-3 text-sm font-semibold">2. Uhrzeit wählen</p>
          <div className="flex flex-wrap gap-2">
            {activeDay.slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlotId(slot.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  selectedSlotId === slot.id
                    ? "border-lime bg-lime text-[#0d0d0f]"
                    : "border-border hover:border-lime"
                }`}
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        </div>
      )}

      <input type="hidden" name="slotId" value={selectedSlotId ?? ""} />

      <div>
        <p className="mb-3 text-sm font-semibold">3. Deine Daten</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            required
            placeholder="Vor- und Nachname"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime sm:col-span-2"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="E-Mail-Adresse"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
          />
          <input
            type="tel"
            name="phone"
            required
            placeholder="Telefonnummer"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
          />
          <textarea
            name="message"
            rows={3}
            placeholder="Nachricht (optional)"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime sm:col-span-2"
          />
        </div>
      </div>

      {state.message && !state.ok && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || !selectedSlotId}
        className="w-full rounded-full bg-lime px-7 py-3 text-sm font-semibold text-[#0d0d0f] transition-opacity disabled:opacity-50"
      >
        {pending ? "Wird gesendet..." : "Probetermin anfragen"}
      </button>
    </form>
  );
}
