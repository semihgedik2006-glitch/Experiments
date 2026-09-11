import { Apple, Activity, HeartPulse, UserRound, Sparkles } from "lucide-react";
import type { SymbolTyp } from "@/components/admin/ui";

/**
 * Sinnbilder für die Zusatzangebote.
 *
 * Eine feste, kurze Auswahl statt eines freien Feldes. Zwei Gründe: Ein
 * Eingabefeld für einen Symbolnamen führt zu Tippfehlern, die als leere
 * Fläche enden - und eine Auswahl aus tausend Symbolen führt dazu, dass
 * fünf Angebote fünf völlig verschiedene Bildsprachen haben.
 *
 * Fünf Einträge decken ab, was ein EMS-Studio tatsächlich anbietet. Kommt
 * etwas Neues dazu, gehört es hier hinein und nicht in ein freies Feld.
 */
export type SymbolSchluessel =
  | "ernaehrung"
  | "messung"
  | "gesundheit"
  | "betreuung"
  | "sonstiges";

export const SYMBOLE: { schluessel: SymbolSchluessel; label: string; icon: SymbolTyp }[] = [
  { schluessel: "ernaehrung", label: "Ernährung", icon: Apple },
  { schluessel: "messung", label: "Messung", icon: Activity },
  { schluessel: "gesundheit", label: "Gesundheit", icon: HeartPulse },
  { schluessel: "betreuung", label: "Persönliche Betreuung", icon: UserRound },
  { schluessel: "sonstiges", label: "Sonstiges", icon: Sparkles },
];

/** Das Symbol zu einem Schlüssel. Unbekanntes ergibt das allgemeine. */
export function symbolFuer(schluessel: string): SymbolTyp {
  return SYMBOLE.find((s) => s.schluessel === schluessel)?.icon ?? Sparkles;
}

export function istSymbol(wert: string): boolean {
  return SYMBOLE.some((s) => s.schluessel === wert);
}

export type AngebotAnzeige = {
  id: string;
  name: string;
  text: string | null;
  preis: string | null;
  symbol: string;
  nurStudios: string[];
};

/**
 * Gilt dieses Angebot an diesem Standort?
 *
 * Leere Liste heißt "überall". Das ist die Voreinstellung, und sie ist die
 * richtige: Ein neu angelegtes Angebot soll erscheinen, nicht verborgen
 * bleiben, bis jemand vierzehn Haken setzt.
 */
export function giltAn(angebot: { nurStudios: string[] }, studioId: string): boolean {
  return angebot.nurStudios.length === 0 || angebot.nurStudios.includes(studioId);
}
