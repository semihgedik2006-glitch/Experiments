"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { umfrageAbsenden } from "@/lib/actions/mitglied";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

/**
 * Die Note aus der Mail ist vorausgewählt - ein Klick auf "Absenden"
 * genügt. Gespeichert wird erst hier und nicht schon beim Öffnen des
 * Links: Postfächer rufen Links vorab auf, und eine Note, die niemand
 * vergeben hat, wäre schlimmer als keine.
 */
export function UmfrageFormular({
  token,
  vorauswahl,
  noten,
}: {
  token: string;
  vorauswahl: number | null;
  noten: { wert: number; text: string }[];
}) {
  const [state, formAction, pending] = useActionState(umfrageAbsenden, initialState);
  const [note, setNote] = useState<number | null>(vorauswahl);
  const [kommentar, setKommentar] = useState("");

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-lime bg-surface p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime/15 text-accent">
          <CheckCircle2 size={30} aria-hidden />
        </span>
        <p className="mt-5 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Wie zufrieden bist du bisher?</legend>
        <div className="grid gap-2 sm:grid-cols-5">
          {noten.map((n) => (
            <label
              key={n.wert}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-4 text-center text-sm transition-colors ${
                note === n.wert ? "border-lime bg-lime/8" : "border-border hover:border-lime/60"
              }`}
            >
              <input
                type="radio"
                name="note"
                value={n.wert}
                checked={note === n.wert}
                onChange={() => setNote(n.wert)}
                className="sr-only"
              />
              <span className="text-2xl font-bold text-accent">{n.wert}</span>
              <span>{n.text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">
          {note !== null && note <= 3
            ? "Was sollen wir besser machen? (freiwillig)"
            : "Möchtest du uns noch etwas sagen? (freiwillig)"}
        </span>
        <textarea
          name="kommentar"
          rows={4}
          maxLength={600}
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
        />
        <span className="mt-1 block text-xs text-muted">
          Bitte keine Angaben zu Krankheiten oder Beschwerden - die besprichst du am besten
          direkt mit deinem Trainer.
        </span>
      </label>

      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || note === null}
        className="knopf-glanz rounded-full bg-lime px-7 py-3 text-sm font-semibold text-on-lime transition-opacity disabled:opacity-50"
      >
        {pending ? "Wird gesendet..." : "Absenden"}
      </button>
    </form>
  );
}
