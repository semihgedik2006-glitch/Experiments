"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { placeIdSuchen } from "@/lib/actions/admin-studios";
import type { PlaceTreffer } from "@/lib/google-bewertungen";

/**
 * Sucht die Google-Place-ID zu Name und Adresse aus diesem Formular und
 * trägt den gewählten Treffer in das Feld daneben ein. Gespeichert wird
 * erst mit dem normalen "Speichern" des Formulars.
 */
export function PlaceIdSuche({ studioId, feldId }: { studioId: string | null; feldId: string }) {
  const [treffer, setTreffer] = useState<PlaceTreffer[] | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();

  function suchen(knopf: HTMLButtonElement) {
    const form = knopf.closest("form");
    const wert = (name: string) =>
      (form?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? "").trim();
    const suche = [wert("name"), wert("street"), wert("postalCode"), wert("city")].filter(Boolean).join(", ");
    setFehler(null);
    starten(async () => {
      const ergebnis = await placeIdSuchen(studioId, suche);
      if ("fehler" in ergebnis) {
        setFehler(ergebnis.fehler);
        setTreffer(null);
      } else {
        setTreffer(ergebnis);
        if (ergebnis.length === 0) setFehler("Google hat dazu nichts gefunden.");
      }
    });
  }

  function uebernehmen(id: string) {
    const feld = document.getElementById(feldId) as HTMLInputElement | null;
    if (feld) feld.value = id;
    setTreffer(null);
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={(e) => suchen(e.currentTarget)}
        disabled={laeuft}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold transition-colors hover:border-lime disabled:opacity-60"
      >
        <Search size={12} aria-hidden />
        {laeuft ? "Sucht..." : "Place-ID suchen"}
      </button>
      {fehler && <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{fehler}</p>}
      {treffer && treffer.length > 0 && (
        <ul className="mt-2 space-y-1">
          {treffer.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => uebernehmen(t.id)}
                className="w-full rounded-lg border border-border px-3 py-1.5 text-left text-xs hover:border-lime"
              >
                <span className="font-semibold">{t.name}</span>
                <span className="block text-muted">{t.adresse}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
