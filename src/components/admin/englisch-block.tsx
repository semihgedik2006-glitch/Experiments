import type { ReactNode } from "react";

/**
 * Die englischen Felder eines Formulars - zusammengefasst und zugeklappt.
 *
 * Wer nur Deutsch pflegt, sieht sie nicht und muss nichts tun: Leere
 * Felder heißen, auf der englischen Seite steht der deutsche Text.
 * Aufgeklappt ist der Block, sobald schon etwas Englisches eingetragen ist.
 */
export function EnglischBlock({
  children,
  ausgefuellt = false,
  className = "",
}: {
  children: ReactNode;
  ausgefuellt?: boolean;
  className?: string;
}) {
  return (
    <details open={ausgefuellt} className={`rounded-xl border border-border bg-surface/50 px-4 py-3 ${className}`}>
      <summary className="cursor-pointer text-sm font-semibold">
        Englische Fassung <span className="font-normal text-muted">(für die englische Seite, freiwillig)</span>
      </summary>
      <p className="mt-2 text-xs text-muted">
        Leer gelassen steht auf der englischen Seite der deutsche Text.
      </p>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

/** Beschriftung über einem englischen Feld. */
export function EnglischFeld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
