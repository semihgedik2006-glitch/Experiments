import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mitParams, param, type SuchParams } from "@/lib/admin-list";

/**
 * Filterreihe und Seitenaufteilung.
 *
 * Beides sind gewöhnliche Links: kein JavaScript nötig, die Adresse ist
 * teilbar, und der Zurück-Knopf führt zurück zur vorigen Auswahl.
 */

export type FilterOption = { wert: string; label: string; anzahl?: number };

export function FilterChips({
  basis,
  params,
  name,
  optionen,
  klasse = "",
}: {
  /** Pfad der Seite, z.B. "/admin/bookings". */
  basis: string;
  params: SuchParams;
  /** Name des Wertes in der Adresse, z.B. "status". */
  name: string;
  /** Der erste Eintrag mit leerem Wert ist die Voreinstellung ("Alle"). */
  optionen: FilterOption[];
  klasse?: string;
}) {
  const aktiv = param(params, name);

  return (
    <div className={`flex flex-wrap gap-2 ${klasse}`}>
      {optionen.map((option) => {
        const gewaehlt = aktiv === option.wert;
        return (
          <Link
            key={option.wert || "alle"}
            href={mitParams(basis, params, { [name]: option.wert })}
            aria-current={gewaehlt ? "true" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              gewaehlt ? "border-lime bg-lime/10" : "border-border hover:border-lime/60"
            }`}
          >
            {option.label}
            {option.anzahl !== undefined && (
              <span className={gewaehlt ? "" : "text-muted"}> {option.anzahl}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Pagination({
  basis,
  params,
  seite,
  proSeite,
  gesamt,
  einheit = "Einträge",
}: {
  /** Pfad der Seite, z.B. "/admin/bookings". */
  basis: string;
  params: SuchParams;
  seite: number;
  proSeite: number;
  gesamt: number;
  einheit?: string;
}) {
  const seiten = Math.max(1, Math.ceil(gesamt / proSeite));
  const von = gesamt === 0 ? 0 : (seite - 1) * proSeite + 1;
  const bis = Math.min(seite * proSeite, gesamt);

  // Passt alles auf eine Seite, genügt die Zahl - eine Blätterleiste mit
  // zwei toten Pfeilen wäre nur Beiwerk.
  if (seiten <= 1) {
    return (
      <p className="mt-4 text-xs text-muted">
        {gesamt} {einheit}
      </p>
    );
  }

  const knopf =
    "inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-lime";
  const aus = "pointer-events-none opacity-40";

  return (
    <nav
      aria-label="Seiten"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
    >
      <p className="text-xs text-muted">
        {von}&ndash;{bis} von {gesamt} {einheit}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={mitParams(basis, params, { seite: seite - 1 })}
          aria-disabled={seite <= 1}
          tabIndex={seite <= 1 ? -1 : undefined}
          className={`${knopf} ${seite <= 1 ? aus : ""}`}
        >
          <ChevronLeft size={14} /> Zurück
        </Link>
        <span className="text-xs text-muted">
          Seite {seite} von {seiten}
        </span>
        <Link
          href={mitParams(basis, params, { seite: seite + 1 })}
          aria-disabled={seite >= seiten}
          tabIndex={seite >= seiten ? -1 : undefined}
          className={`${knopf} ${seite >= seiten ? aus : ""}`}
        >
          Weiter <ChevronRight size={14} />
        </Link>
      </div>
    </nav>
  );
}
