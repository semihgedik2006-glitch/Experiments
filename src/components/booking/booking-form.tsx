"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { createBooking } from "@/lib/actions/booking";
import type { ActionResult } from "@/lib/actions/newsletter";

type DayGroup = {
  dateKey: string;
  dateLabel: string;
  slots: { id: string; startTime: string; endTime: string }[];
};

const initialState: ActionResult = { ok: false, message: "" };

export function BookingForm({ days }: { days: DayGroup[] }) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  const activeDay = days.find((d) => d.dateKey === selectedDay);

  if (state.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-lime bg-surface p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime/15 text-lime"
        >
          <CheckCircle2 size={30} />
        </motion.div>
        <h3 className="mt-5 text-xl font-semibold text-lime">Anfrage gesendet!</h3>
        <p className="mt-3 text-muted">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Bot-Falle: für echte Besucher unsichtbar, Bots füllen sie oft aus. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {days.length > 0 ? (
        <>
          <div>
            <p className="mb-1 text-sm font-semibold">1. Bevorzugter Tag</p>
            <p className="mb-3 text-xs text-muted">
              Optional - ohne Auswahl vereinbaren wir den genauen Termin persönlich mit dir.
            </p>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => {
                    setSelectedDay(selectedDay === day.dateKey ? "" : day.dateKey);
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
              <p className="mb-1 text-sm font-semibold">2. Bevorzugte Uhrzeit</p>
              <p className="mb-3 text-xs text-muted">Optional - auch hier reicht eine grobe Vorstellung.</p>
              <div className="flex flex-wrap gap-2">
                {activeDay.slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(selectedSlotId === slot.id ? null : slot.id)}
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
        </>
      ) : (
        <p className="text-sm text-muted">
          Aktuell sind keine festen Termine hinterlegt - schick uns einfach deine Daten,
          wir vereinbaren einen Probetermin persönlich mit dir.
        </p>
      )}

      <input type="hidden" name="slotId" value={selectedSlotId ?? ""} />

      <div>
        <p className="mb-3 text-sm font-semibold">
          {days.length > 0 ? "3. Deine Daten" : "Deine Daten"}
        </p>
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
        <motion.p
          key={state.message}
          animate={{ x: [0, -8, 8, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
          role="alert"
          className="text-sm text-red-500"
        >
          {state.message}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-lime px-7 py-3 text-sm font-semibold text-[#0d0d0f] transition-opacity disabled:opacity-50"
      >
        {pending ? "Wird gesendet..." : "Probetermin anfragen"}
      </button>
    </form>
  );
}
