"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAdmin } from "@/lib/actions/admin-auth";
import { adminInput } from "@/components/admin/ui";
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
        className={adminInput}
      />
      <input
        type="password"
        name="password"
        required
        placeholder="Passwort"
        className={adminInput}
      />

      {state?.message && !state.ok && <p className="text-sm text-danger">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-7 py-3 text-sm font-semibold text-on-lime transition-opacity disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={15} className="animate-spin" aria-hidden />}
        {pending ? "Wird geprüft..." : "Anmelden"}
      </button>
    </form>
  );
}
