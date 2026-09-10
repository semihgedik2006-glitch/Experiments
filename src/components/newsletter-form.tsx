"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

const initialState = { ok: false, message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2">
      <div className="flex overflow-hidden rounded-full border border-border">
        <input
          type="email"
          name="email"
          required
          placeholder="deine@email.de"
          suppressHydrationWarning
          className="w-full bg-transparent px-4 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="whitespace-nowrap bg-lime px-4 py-2 text-sm font-semibold text-on-lime transition-opacity disabled:opacity-60"
        >
          {pending ? "..." : "Anmelden"}
        </button>
      </div>
      {state?.message && (
        <p className={`text-xs ${state.ok ? "text-accent" : "text-danger"}`}>{state.message}</p>
      )}
      {/* Steht hier, weil es beim Eintragen zählt und nicht erst in der
          Datenschutzerklärung: Wer weiß, dass er jederzeit wieder rauskommt,
          trägt sich eher ein. */}
      <p className="text-xs text-muted">
        Jederzeit abbestellbar - der Abmeldelink steht in jeder E-Mail.
      </p>
    </form>
  );
}
