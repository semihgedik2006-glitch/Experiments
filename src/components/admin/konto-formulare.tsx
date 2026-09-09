"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { eigenenNamenAendern, eigenesPasswortAendern } from "@/lib/actions/admin-konto";
import { adminInput } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/actions/newsletter";

const leer: ActionResult = { ok: false, message: "" };

/**
 * Rückmeldung zu einem der Formulare auf der Kontoseite.
 *
 * role="status" statt einer stillen Zeile: Wer mit der Tastatur arbeitet,
 * steht nach dem Absenden noch auf dem Knopf und bekäme sonst nicht mit,
 * ob etwas passiert ist.
 */
function Meldung({ status }: { status: ActionResult }) {
  return (
    <p role="status" aria-live="polite" className="min-h-5 text-sm">
      {status.message && (
        <span className={status.ok ? "text-accent" : "text-danger"}>{status.message}</span>
      )}
    </p>
  );
}

function Knopf({ pending, label, laufend }: { pending: boolean; label: string; laufend: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
    >
      {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
      {pending ? laufend : label}
    </button>
  );
}

export function NameFormular({ name }: { name: string | null }) {
  const [status, absenden, pending] = useActionState(eigenenNamenAendern, leer);

  return (
    <form action={absenden} className="space-y-3">
      <label className="block max-w-sm">
        <span className="text-xs text-muted">Angezeigter Name</span>
        <input
          type="text"
          name="name"
          defaultValue={name ?? ""}
          maxLength={120}
          placeholder="Vor- und Nachname"
          className={`${adminInput} mt-1`}
        />
      </label>
      <Meldung status={status} />
      <Knopf pending={pending} label="Namen speichern" laufend="Wird gespeichert..." />
    </form>
  );
}

export function PasswortFormular({ email }: { email: string }) {
  const [status, absenden, pending] = useActionState(eigenesPasswortAendern, leer);

  return (
    <form action={absenden} className="space-y-3">
      {/* Für Passwortverwaltungen: Ohne ein Feld mit dem Benutzernamen
          ordnen sie den Eintrag nicht zu und bieten das Speichern des neuen
          Passworts nicht an. Sichtbar ist es nicht, ausgefüllt schon. */}
      <input
        type="text"
        name="benutzername"
        value={email}
        readOnly
        autoComplete="username"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid max-w-xl gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs text-muted">Bisheriges Passwort</span>
          <input
            type="password"
            name="alt"
            required
            autoComplete="current-password"
            className={`${adminInput} mt-1`}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Neues Passwort</span>
          <input
            type="password"
            name="neu"
            required
            minLength={10}
            autoComplete="new-password"
            placeholder="mindestens 10 Zeichen"
            className={`${adminInput} mt-1`}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Neues Passwort wiederholen</span>
          <input
            type="password"
            name="wiederholung"
            required
            minLength={10}
            autoComplete="new-password"
            className={`${adminInput} mt-1`}
          />
        </label>
      </div>

      <Meldung status={status} />
      <Knopf pending={pending} label="Passwort ändern" laufend="Wird geändert..." />
    </form>
  );
}
