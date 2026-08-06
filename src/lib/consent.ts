"use client";

/**
 * Kleiner externer Store für die Cookie-Entscheidung.
 *
 * Bewusst als geteilter Store statt lokalem State: Sowohl das Cookie-Banner
 * als auch einwilligungspflichtige Einbettungen (z.B. Google Maps) müssen
 * dieselbe Entscheidung lesen UND sofort mitbekommen, wenn sie sich ändert.
 */

const STORAGE_KEY = "cookie-consent";

export type Consent = "accepted" | "declined";

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  // Auch auf Änderungen aus anderen Browser-Tabs reagieren.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function readConsent(): Consent | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "accepted" || stored === "declined" ? stored : null;
}

/** Auf dem Server ist noch keine Entscheidung bekannt. */
export function serverConsent(): Consent | null {
  return null;
}

export function writeConsent(value: Consent) {
  window.localStorage.setItem(STORAGE_KEY, value);
  notify();
}
