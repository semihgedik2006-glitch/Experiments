/**
 * Geschätzte Lesezeit eines Beitrags in Minuten.
 *
 * 200 Wörter pro Minute - ein gemütliches Lesetempo am Handy, eher zu
 * großzügig als zu knapp: "3 Min." und dann dauert es fünf, ärgert mehr
 * als umgekehrt. Mindestens eine Minute.
 */
export function lesezeit(text: string): number {
  const woerter = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}
