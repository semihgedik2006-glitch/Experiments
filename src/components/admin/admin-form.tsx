"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";

/**
 * Gemeinsame Bausteine für alle Formulare im Adminbereich.
 *
 * Zwei Dinge fehlten vorher überall:
 *
 * 1. Nach dem Speichern passierte sichtbar nichts. Die Seite lud die Daten
 *    neu, aber die Felder standen danach genauso da wie vorher - man konnte
 *    nicht unterscheiden zwischen "gespeichert" und "Klick nicht angekommen".
 *    Entsprechend wurde mehrfach geklickt.
 * 2. Während die Anfrage lief, blieb der Knopf unverändert bedienbar. Bei
 *    einer langsamen Verbindung heißt das: mehrere gleiche Anfragen.
 *
 * <AdminForm> übernimmt beides. Der Zustand "gerade gespeichert" wird im
 * Ablauf der Aktion gesetzt, nicht in einem Effekt - React beanstandet das
 * Setzen von Zustand in Effekten zu Recht.
 */

const SavedContext = createContext(false);

export function AdminForm({
  action,
  children,
  className,
  /** Felder nach erfolgreichem Absenden leeren (für Anlege-Formulare). */
  resetOnSuccess = false,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const run = useCallback(
    async (formData: FormData) => {
      await action(formData);

      // Wirft die Aktion, kommen wir hier nicht an - die Bestätigung
      // erscheint also nur, wenn tatsächlich gespeichert wurde.
      if (resetOnSuccess) formRef.current?.reset();

      setSaved(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSaved(false), 4000);
    },
    [action, resetOnSuccess],
  );

  return (
    <SavedContext value={saved}>
      <form ref={formRef} action={run} className={className}>
        {children}
      </form>
    </SavedContext>
  );
}

type Variant = "primary" | "outline" | "link";

const variantClass: Record<Variant, string> = {
  primary:
    "rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90",
  outline:
    "rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-lime",
  link: "text-sm text-accent hover:underline",
};

/**
 * Absende-Knopf mit Ladeanzeige und - innerhalb einer <AdminForm> -
 * sichtbarer Bestätigung.
 *
 * useFormStatus liest den Zustand des umgebenden Formulars, funktioniert
 * also auch in einem gewöhnlichen <form action={serverAction}>. Dort fehlt
 * dann nur die Bestätigung.
 */
export function SubmitButton({
  children,
  variant = "outline",
  className = "",
  pendingLabel,
  savedLabel = "Gespeichert",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  pendingLabel?: string;
  savedLabel?: string;
}) {
  const { pending } = useFormStatus();
  const saved = useContext(SavedContext);

  return (
    <span className="inline-flex items-center gap-2.5">
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`inline-flex items-center gap-2 disabled:cursor-progress disabled:opacity-60 ${variantClass[variant]} ${className}`}
      >
        {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
        {pending && pendingLabel ? pendingLabel : children}
      </button>

      {/* aria-live, damit die Bestätigung auch vorgelesen wird - sonst
          bekommt sie nur mit, wer auf den Knopf schaut. */}
      <span aria-live="polite" className="text-xs font-medium text-accent">
        {saved && !pending && (
          <span className="inline-flex items-center gap-1">
            <Check size={13} aria-hidden /> {savedLabel}
          </span>
        )}
      </span>
    </span>
  );
}
