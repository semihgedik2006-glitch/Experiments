"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, Globe } from "lucide-react";
import { adresseTesten, type AdressPruefung } from "@/lib/actions/admin-adresse";

/**
 * Ruft die eigene Adresse von außen auf und zeigt, was dabei herauskommt.
 *
 * Bewusst auf Knopfdruck und nicht beim Laden der Seite: Der Aufruf geht
 * ins Netz hinaus und kann je nach Domain in eine Zeitüberschreitung
 * laufen. Eine Verwaltungsseite, die acht Sekunden lang weiß bleibt, weil
 * eine fremde Domain nicht antwortet, wäre der schlechtere Tausch.
 */
export function AdressePruefen({ label, ziel }: { label: string; ziel: "basis" | "vorgesehen" }) {
  const [ergebnis, setErgebnis] = useState<AdressPruefung | null>(null);
  const [laeuft, starten] = useTransition();

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={laeuft}
        onClick={() =>
          starten(async () => {
            setErgebnis(await adresseTesten(ziel));
          })
        }
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-lime disabled:opacity-60"
      >
        <Globe size={15} className="text-accent" aria-hidden />
        {laeuft ? "Wird aufgerufen …" : label}
      </button>

      {/* aria-live: Das Ergebnis erscheint erst nach dem Klick und ohne
          Seitenwechsel - ohne diesen Hinweis bekäme es niemand mit, der
          sich die Seite vorlesen lässt. */}
      <div aria-live="polite">
        {ergebnis && (
          <div
            className={`mt-3 rounded-xl border p-4 ${
              ergebnis.ok
                ? "border-lime/50 bg-lime/10"
                : "border-amber-500/50 bg-amber-500/10"
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              {ergebnis.ok ? (
                <CheckCircle2 size={16} className="shrink-0 text-accent" aria-hidden />
              ) : (
                <AlertTriangle size={16} className="shrink-0 text-amber-600" aria-hidden />
              )}
              {ergebnis.titel}
            </p>
            <p className="mt-1.5 text-sm text-muted">{ergebnis.text}</p>
            {ergebnis.wegpunkte && (
              <ol className="mt-3 space-y-1 text-xs text-muted">
                {ergebnis.wegpunkte.map((punkt, i) => (
                  <li key={`${punkt}-${i}`} className="flex items-start gap-1.5">
                    {i > 0 && <ArrowRight size={12} className="mt-0.5 shrink-0" aria-hidden />}
                    <span className="break-all font-mono">{punkt}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
