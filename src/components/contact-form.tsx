"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

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
        <h3 className="mt-5 text-xl font-semibold text-lime">Nachricht gesendet!</h3>
        <p className="mt-3 text-muted">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Bot-Falle: für echte Besucher unsichtbar, Bots füllen sie oft aus. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

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
        className="w-full rounded-full bg-lime px-7 py-3 text-sm font-semibold text-[#0d0d0f] transition-opacity disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Wird gesendet..." : "Nachricht senden"}
      </button>
    </form>
  );
}
