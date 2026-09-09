"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MapPin } from "lucide-react";
import { subscribeConsent, readConsent, serverConsent } from "@/lib/consent";

/**
 * Google-Maps-Einbettung mit vorgeschalteter Einwilligung.
 *
 * Ohne Zustimmung wird KEIN iframe gerendert - erst dadurch unterbleibt die
 * Übertragung der IP-Adresse an Google. Sichtbar ist stattdessen ein
 * Platzhalter, über den die Karte einmalig per Klick geladen werden kann.
 *
 * Zweite Bedingung: Der Ausschnitt muss in die Nähe des Bildschirms gerückt
 * sein. Auf der Studio-Seite stehen vierzehn Karten untereinander - mit
 * erteilter Einwilligung wären das sonst vierzehn gleichzeitige Verbindungen
 * zu Google beim Öffnen der Seite, von denen man eine sieht. loading="lazy"
 * allein genügt dafür nicht: Der Browser entscheidet die Schwelle selbst und
 * lädt oft großzügig vor.
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
  const [nahAmBildschirm, setNahAmBildschirm] = useState(false);
  const platzRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = platzRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege.some((eintrag) => eintrag.isIntersecting)) return;
        // Einmal geladen bleibt geladen - sonst verschwände die Karte
        // wieder, sobald man daran vorbeiscrollt.
        setNahAmBildschirm(true);
        beobachter.disconnect();
      },
      // Eine halbe Bildschirmhöhe Vorlauf: Die Karte steht, wenn sie ins
      // Bild kommt, statt erst dann zu laden.
      { rootMargin: "500px 0px" },
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  if ((consent === "accepted" && nahAmBildschirm) || loadedOnce) {
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

  // Mit Einwilligung, aber noch außer Sichtweite: nur die Fläche freihalten,
  // damit beim Heranscrollen nichts springt.
  if (consent === "accepted") {
    return <div ref={platzRef} className={`bg-surface ${className}`} aria-hidden />;
  }

  return (
    <div
      ref={platzRef}
      className={`flex flex-col items-center justify-center gap-3 bg-surface px-6 py-10 text-center ${className}`}
    >
      <MapPin size={24} className="text-accent" />
      <p className="text-sm font-semibold">Karte von Google Maps</p>
      <p className="max-w-xs text-xs text-muted">
        Beim Laden der Karte wird eine Verbindung zu Google hergestellt und deine
        IP-Adresse übertragen. Mehr dazu in unserer{" "}
        <a href="/datenschutz" className="text-accent underline underline-offset-2">
          Datenschutzerklärung
        </a>
        .
      </p>
      <button
        type="button"
        onClick={() => setLoadedOnce(true)}
        className="mt-1 rounded-full bg-lime px-5 py-2 text-xs font-semibold text-on-lime transition-opacity hover:opacity-90"
      >
        Karte laden
      </button>
    </div>
  );
}
