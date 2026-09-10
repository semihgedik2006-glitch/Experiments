"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { adminInput } from "@/components/admin/ui";
import { instagramPruefen, instagramSpeichern } from "@/lib/actions/admin-instagram";
import type { ActionResult } from "@/lib/actions/newsletter";

const leer: ActionResult = { ok: false, message: "" };

/** Schlüssel einfügen. */
export function InstagramFormular({ verbunden }: { verbunden: boolean }) {
  const [state, formAction, pending] = useActionState(instagramSpeichern, leer);

  return (
    <form action={formAction} className="max-w-2xl space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs text-muted">
          {verbunden ? "Neuen Zugangsschlüssel einfügen" : "Zugangsschlüssel"}
        </span>
        {/* type="password": Der Schlüssel ist ein Passwort. Wer ihn hat,
            liest im Namen des Kontos - er soll nicht offen auf einem
            Bildschirm stehen, an dem jemand vorbeigeht. */}
        <input
          type="password"
          name="token"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="IGQ..."
          className={`${adminInput} font-mono`}
        />
      </label>

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-accent" : "text-danger"}`}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-on-lime disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
        {pending ? "Wird geprüft..." : verbunden ? "Schlüssel ersetzen" : "Verbinden"}
      </button>
    </form>
  );
}

/** Jetzt prüfen und verlängern - dasselbe, was nachts von allein läuft. */
export function InstagramPruefen() {
  const router = useRouter();
  const [ergebnis, setErgebnis] = useState<ActionResult | null>(null);
  const [laeuft, starten] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={laeuft}
        onClick={() =>
          starten(async () => {
            setErgebnis(await instagramPruefen());
            router.refresh();
          })
        }
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-lime disabled:opacity-50"
      >
        {laeuft ? (
          <Loader2 size={14} className="animate-spin" aria-hidden />
        ) : (
          <RefreshCw size={14} aria-hidden />
        )}
        {laeuft ? "Wird geprüft..." : "Jetzt prüfen und verlängern"}
      </button>

      <p
        aria-live="polite"
        className={`mt-2 text-sm empty:mt-0 ${ergebnis?.ok ? "text-accent" : "text-danger"}`}
      >
        {ergebnis?.message ?? ""}
      </p>
    </div>
  );
}
