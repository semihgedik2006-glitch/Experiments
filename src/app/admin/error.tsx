"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Dieselbe Panne, ein anderer Leser.
 *
 * Dem Besucher der Website nützt eine Kennung nichts - der will
 * telefonieren. Wer im Adminbereich steht, will wissen, ob seine Eingabe
 * weg ist und ob er etwas tun muss. Deshalb steht hier beides: was
 * vermutlich los ist und was mit dem passiert, was gerade nicht
 * gespeichert wurde.
 *
 * Der häufigste Fall ist die Datenbank, die kurz nicht antwortet. Das ist
 * kein Datenverlust: Was nicht gespeichert wurde, ist nicht gespeichert -
 * halb gespeichert gibt es nicht.
 *
 * Warum die Datei hier liegt und nicht eine Ebene tiefer bei den Seiten:
 * error.tsx fängt ausdrücklich nicht das Layout neben sich ab. Das Layout
 * des Adminbereichs prüft aber als Erstes, wer angemeldet ist - und das
 * ist eine Datenbankabfrage. Bei genau dem Fall, für den diese Seite
 * gedacht ist, wäre sie also nie erschienen. Eine Ebene höher umschließt
 * sie dieses Layout mit.
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Fehler im Adminbereich:", error);
  }, [error]);

  return (
    // Eigener Rahmen: Greift die Grenze, weil das Layout selbst
    // gescheitert ist, steht diese Seite ohne Seitenleiste und ohne
    // Seitenkopf da. Ohne den Rahmen klebte sie am Bildschirmrand.
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
      <div className="admin-panel p-6 sm:p-8">
      <p className="flex items-center gap-2.5 text-base font-semibold">
        <AlertTriangle size={18} className="shrink-0 text-amber-600" aria-hidden />
        Dieser Bereich konnte nicht geladen werden
      </p>

      <div className="lesebreite mt-4 space-y-3 text-sm text-muted">
        <p>
          Meistens antwortet die Datenbank kurz nicht. Ein zweiter Versuch
          genügt dann.
        </p>
        <p>
          <strong className="text-foreground">Zu deinen Daten:</strong> Was du
          zuletzt gespeichert hast, ist gespeichert. Was gerade nicht
          durchging, ist nicht durchgegangen &ndash; halb gespeichert gibt es
          nicht. Eingaben in einem Formular, das du noch nicht abgeschickt
          hast, sind allerdings weg.
        </p>
        <p>
          Bleibt es dabei, ist es kein Aussetzer. Dann hilft ein Blick in die
          Datenbank beim Anbieter &ndash; und die Kennung unten.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90"
        >
          <RotateCcw size={15} aria-hidden />
          Nochmal versuchen
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-lime"
        >
          Zur Übersicht
        </Link>
      </div>

        {error.digest && (
          <p className="mt-6 text-xs text-muted">
            Kennung: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  );
}
