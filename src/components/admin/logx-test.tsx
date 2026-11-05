"use client";

import { useState, useTransition } from "react";
import { PlugZap } from "lucide-react";
import { logxVerbindungTesten } from "@/lib/actions/logx";

/**
 * "Verbindung testen": prüft mit den Angaben aus diesem Formular (auch
 * vor dem Speichern), ob LogX antwortet, ob das TryNow-Profil
 * eingeschaltet ist und ob es freie Zeiten gibt - und sagt, was fehlt.
 */
export function LogxTest({ studioId }: { studioId: string | null }) {
  const [ergebnis, setErgebnis] = useState<{ ok: boolean; zeilen: string[] } | null>(null);
  const [laeuft, starten] = useTransition();

  function testen(knopf: HTMLButtonElement) {
    const form = knopf.closest("form");
    const wert = (name: string) =>
      (form?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? "").trim();
    starten(async () => {
      setErgebnis(
        await logxVerbindungTesten(studioId, {
          hash: wert("logxStudioHash"),
          profil: wert("logxProfileId"),
          schluessel: wert("logxApiKey"),
        }),
      );
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={(e) => testen(e.currentTarget)}
        disabled={laeuft}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold transition-colors hover:border-lime disabled:opacity-60"
      >
        <PlugZap size={12} aria-hidden />
        {laeuft ? "Prüft..." : "Verbindung testen"}
      </button>
      {ergebnis && (
        <ul
          className={`mt-2 space-y-0.5 rounded-lg border px-3 py-2 text-xs ${
            ergebnis.ok ? "border-lime/50 bg-lime/10" : "border-amber-500/40 bg-amber-500/10"
          }`}
        >
          {ergebnis.zeilen.map((z) => (
            <li key={z}>{z}</li>
          ))}
          <li className="pt-1 font-semibold">
            {ergebnis.ok
              ? "Alles bereit: Das Anfrageformular zeigt für dieses Studio freie Zeiten aus LogX."
              : "Noch nicht bereit: Das Formular bleibt bei den Wunschzeiten."}
          </li>
        </ul>
      )}
    </div>
  );
}
