"use client";

import { useState, useSyncExternalStore } from "react";
import { MapPin } from "lucide-react";
import { subscribeConsent, readConsent, serverConsent } from "@/lib/consent";

/**
 * Google-Maps-Einbettung mit vorgeschalteter Einwilligung.
 *
 * Ohne Zustimmung wird KEIN iframe gerendert - erst dadurch unterbleibt die
 * Übertragung der IP-Adresse an Google. Sichtbar ist stattdessen ein
 * Platzhalter, über den die Karte einmalig per Klick geladen werden kann.
 */
export function MapEmbed({
  src,
  title,
  className = "h-80 w-full",
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);
  const [loadedOnce, setLoadedOnce] = useState(false);

  if (consent === "accepted" || loadedOnce) {
    return (
      <iframe
        src={src}
        title={title}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 bg-surface px-6 py-10 text-center ${className}`}
    >
      <MapPin size={24} className="text-lime" />
      <p className="text-sm font-semibold">Karte von Google Maps</p>
      <p className="max-w-xs text-xs text-muted">
        Beim Laden der Karte wird eine Verbindung zu Google hergestellt und deine
        IP-Adresse übertragen. Mehr dazu in unserer{" "}
        <a href="/datenschutz" className="text-lime hover:underline">
          Datenschutzerklärung
        </a>
        .
      </p>
      <button
        type="button"
        onClick={() => setLoadedOnce(true)}
        className="mt-1 rounded-full bg-lime px-5 py-2 text-xs font-semibold text-[#0d0d0f] transition-opacity hover:opacity-90"
      >
        Karte laden
      </button>
    </div>
  );
}
