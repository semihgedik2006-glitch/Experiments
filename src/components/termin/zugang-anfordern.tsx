"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { zugangAnfordern } from "@/lib/actions/kundenbereich";

const anfang = { ok: false, message: "" };

/**
 * Das Formular, mit dem man sich den Link zu den eigenen Terminen holt.
 *
 * Ein einziges Feld. Kein Passwort, keine Anmeldung, kein "Konto
 * anlegen" - siehe die Begründung in src/lib/kundenbereich.ts.
 *
 * Nach dem Absenden bleibt das Feld stehen, statt sich zu leeren: Kommt
 * die Mail nicht an, ist der zweite Versuch ein Klick und kein
 * Neutippen. Und die Antwort ist immer dieselbe - ob es zu der Adresse
 * Termine gibt, steht hier bewusst nicht.
 */
export function ZugangAnfordern() {
  const [zustand, absenden, laeuft] = useActionState(zugangAnfordern, anfang);

  return (
    <form action={absenden} className="mt-8 max-w-md">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Deine E-Mail-Adresse</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="deine@email.de"
          suppressHydrationWarning
          className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm outline-none transition-colors focus:border-lime"
        />
      </label>

      <button
        type="submit"
        disabled={laeuft}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-on-lime transition-opacity disabled:opacity-60"
      >
        <Mail size={16} aria-hidden />
        {laeuft ? "Wird verschickt..." : "Link schicken"}
      </button>

      {/* aria-live, weil die Antwort nach dem Absenden erscheint und
          sonst nur zu sehen, aber nicht zu hören wäre. */}
      <p aria-live="polite" className="mt-4 min-h-[1.25rem] text-sm">
        {zustand?.message && (
          <span className={zustand.ok ? "text-accent" : "text-danger"}>{zustand.message}</span>
        )}
      </p>
    </form>
  );
}
