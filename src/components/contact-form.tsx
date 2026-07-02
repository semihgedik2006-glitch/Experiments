"use client";

import { useActionState } from "react";
import { sendContactMessage } from "@/lib/actions/contact";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-lime bg-surface p-10 text-center">
        <h3 className="text-xl font-semibold text-lime">Nachricht gesendet!</h3>
        <p className="mt-3 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
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
          placeholder="Telefonnummer (optional)"
          className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
        />
        <input
          type="text"
          name="subject"
          required
          placeholder="Betreff"
          className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime sm:col-span-2"
        />
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Deine Nachricht"
          className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime sm:col-span-2"
        />
      </div>

      {state.message && !state.ok && <p className="text-sm text-red-500">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-lime px-7 py-3 text-sm font-semibold text-[#0d0d0f] transition-opacity disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Wird gesendet..." : "Nachricht senden"}
      </button>
    </form>
  );
}
