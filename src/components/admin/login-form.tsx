"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/lib/actions/admin-auth";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <input
        type="email"
        name="email"
        required
        placeholder="E-Mail-Adresse"
        className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
      />
      <input
        type="password"
        name="password"
        required
        placeholder="Passwort"
        className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
      />

      {state?.message && !state.ok && <p className="text-sm text-red-500">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-lime px-7 py-3 text-sm font-semibold text-on-lime transition-opacity disabled:opacity-50"
      >
        {pending ? "Anmelden..." : "Anmelden"}
      </button>
    </form>
  );
}
