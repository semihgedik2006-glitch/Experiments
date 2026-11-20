"use client";

import { readConsent, resetConsent } from "@/lib/consent";

export function CookieEinstellungen({ en }: { en: boolean }) {
  function oeffnen() {
    const warAn = readConsent() === "accepted";
    resetConsent();
    // Google Analytics bleibt bis zum Neuladen im Speicher, deshalb nach
    // einer erteilten Zustimmung neu laden.
    if (warAn) window.location.reload();
  }

  return (
    <button type="button" onClick={oeffnen} className="tastflaeche py-2 hover:text-foreground">
      {en ? "Cookie settings" : "Cookie-Einstellungen"}
    </button>
  );
}
