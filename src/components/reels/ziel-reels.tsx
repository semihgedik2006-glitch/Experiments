"use client";

import { ReelReihe } from "@/components/reels/reel-reihe";
import { useZiel } from "@/components/ziel/ziel-kontext";
import { REELS, REELS_START, type Reel } from "@/lib/reels";

/**
 * Die Reel-Reihe, nach dem gewählten Ziel sortiert: Wer "Rücken"
 * gewählt hat, sieht das Rücken-Video zuerst, wer "Fitter im Alltag"
 * gewählt hat, das über wenig Zeit.
 */
const ZUERST: Partial<Record<string, Reel>> = {
  ruecken: REELS.ruecken,
  gelenke: REELS.ruecken,
  fitness: REELS.keineZeit,
  abnehmen: REELS.keineZeit,
};

export function ZielReels() {
  const { ziel } = useZiel();
  const erstes = ziel ? ZUERST[ziel] : undefined;
  const reels = erstes ? [erstes, ...REELS_START.filter((r) => r.id !== erstes.id)].slice(0, 4) : REELS_START;
  return <ReelReihe reels={reels} />;
}
