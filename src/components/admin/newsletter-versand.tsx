"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Send, TestTube2 } from "lucide-react";
import { newsletterTestVersand, newsletterVersenden } from "@/lib/actions/admin-newsletter";
import type { ActionResult } from "@/lib/actions/newsletter";

/**
 * Die beiden Knöpfe, mit denen eine Ausgabe rausgeht.
 *
 * Der Probeversand steht links und ohne Rückfrage - er geht an die eigene
 * Adresse und kann nichts anrichten. Der echte Versand steht rechts, hat
 * eine Rückfrage, und in der Rückfrage steht die Zahl der Empfänger.
 *
 * Diese Zahl ist der eigentliche Schutz. "Wirklich senden?" beantwortet
 * jeder mit ja; "An 412 Adressen senden?" liest man zu Ende.
 */
export function NewsletterVersand({
  id,
  anzahl,
  fortsetzen,
}: {
  id: string;
  /** Wie viele Adressen noch offen sind. */
  anzahl: number;
  /** Ein bereits begonnener Versand wird fortgesetzt, nicht neu gestartet. */
  fortsetzen: boolean;
}) {
  const router = useRouter();
  const [ergebnis, setErgebnis] = useState<ActionResult | null>(null);
  const [gefragt, setGefragt] = useState(false);
  const [laeuft, starten] = useTransition();

  const rufen = (was: () => Promise<ActionResult>) =>
    starten(async () => {
      setErgebnis(await was());
      setGefragt(false);
      // Der Versand läuft nach der Antwort weiter (siehe die Aktion).
      // Ein Neuladen holt den Stand, sobald der erste Abschnitt durch ist.
      router.refresh();
    });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={laeuft}
          onClick={() => rufen(() => newsletterTestVersand(id))}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-lime disabled:opacity-50"
        >
          <TestTube2 size={14} aria-hidden />
          Probeversand an mich
        </button>

        {!gefragt ? (
          <button
            type="button"
            disabled={laeuft || anzahl === 0}
            onClick={() => setGefragt(true)}
            className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-xs font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={14} aria-hidden />
            {fortsetzen ? "Versand fortsetzen" : "An alle Abonnenten senden"}
          </button>
        ) : (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">
              An {anzahl} {anzahl === 1 ? "Adresse" : "Adressen"} senden? Das lässt sich
              nicht zurückholen.
            </span>
            <button
              type="button"
              disabled={laeuft}
              aria-busy={laeuft}
              onClick={() => rufen(() => newsletterVersenden(id))}
              className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-xs font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
            >
              {laeuft && <Loader2 size={13} className="animate-spin" aria-hidden />}
              {laeuft ? "Startet..." : "Ja, senden"}
            </button>
            <button
              type="button"
              disabled={laeuft}
              onClick={() => setGefragt(false)}
              className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition-colors hover:border-lime disabled:opacity-50"
            >
              Abbrechen
            </button>
          </span>
        )}
      </div>

      <p
        aria-live="polite"
        className={`mt-3 text-sm empty:mt-0 ${ergebnis?.ok ? "text-accent" : "text-danger"}`}
      >
        {ergebnis?.message ?? ""}
      </p>
    </div>
  );
}
