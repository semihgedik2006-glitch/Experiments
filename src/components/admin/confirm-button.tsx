"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarX, Loader2, Trash2 } from "lucide-react";

/**
 * Löschknopf mit Rückfrage.
 *
 * Vorher löschte ein einziger Klick sofort und endgültig - ein Studio, einen
 * Artikel, einen Termin samt Buchungen. Rückgängig machen ließ sich das
 * nicht, und der Knopf stand im Studio-Formular direkt unter "Speichern".
 *
 * Bewusst eine eingebaute Rückfrage statt window.confirm: Der Browserdialog
 * lässt sich nicht gestalten, wird auf manchen Geräten unterdrückt und
 * blockiert die Seite. Hier bleibt sichtbar, worauf sich die Frage bezieht.
 *
 * Die Rückfrage verfällt nach acht Sekunden von selbst wieder - sonst bleibt
 * ein scharf gestellter Löschknopf stehen, während man längst woanders liest.
 */
export function ConfirmButton({
  label = "Löschen",
  question = "Wirklich löschen?",
  confirmLabel = "Ja, löschen",
  variant = "outline",
  icon = "trash",
  pendingLabel = "Wird gelöscht...",
}: {
  label?: string;
  question?: string;
  confirmLabel?: string;
  variant?: "outline" | "link";
  /**
   * Bewusst ein Name statt der Komponente selbst: Diese Komponente läuft im
   * Browser, und eine Funktion lässt sich nicht vom Server dorthin
   * übergeben - React bricht die Darstellung sonst mit "Functions cannot be
   * passed directly to Client Components" ab. "keins" lässt das Symbol weg.
   */
  icon?: "trash" | "termin" | "keins";
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function disarm() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setArmed(false);
  }

  function arm() {
    setArmed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setArmed(false), 8000);
  }

  const Icon = icon === "trash" ? Trash2 : icon === "termin" ? CalendarX : null;

  const base =
    variant === "link"
      ? "text-xs text-danger hover:underline"
      : "border-danger rounded-full border border-border px-4 py-2 text-xs font-semibold text-danger transition-colors";

  if (!armed) {
    return (
      <button type="button" onClick={arm} className={`inline-flex items-center gap-1.5 ${base}`}>
        {Icon && <Icon size={13} aria-hidden />} {label}
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted">{question}</span>
      {/* Bewusst kein Zurücksetzen im Klick: Würde der Knopf beim Absenden
          aus dem Baum genommen, bräche die Übermittlung ab. Verschwindet
          der Eintrag, verschwindet auch dieser Knopf mit ihm. */}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="bg-danger inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={13} className="animate-spin" aria-hidden />}
        {pending ? pendingLabel : confirmLabel}
      </button>
      <button
        type="button"
        onClick={disarm}
        disabled={pending}
        className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition-colors hover:border-lime disabled:opacity-50"
      >
        Abbrechen
      </button>
    </span>
  );
}
