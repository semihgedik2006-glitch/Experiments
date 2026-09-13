"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { haversineDistanceKm, anyStudioLocatable, sortStudiosByDistance } from "@/lib/geo";
import { ausschnittFuer } from "@/lib/karte";

const subscribeNothing = () => () => {};

export type UebersichtStudio = {
  id: string;
  name: string;
  city: string;
  street: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Übersichtskarte aller Standorte.
 *
 * Erste Fassung war ein selbst gezeichneter Lageplan aus reinen Punkten -
 * datenschutzfreundlich, aber als Karte praktisch leer: Ohne Straßen,
 * Flüsse und Ortsnamen sagt ein Punktefeld nichts darüber, wo ein Studio
 * liegt.
 *
 * Jetzt echte Kartenkacheln, aber über den eigenen Server (siehe
 * /api/karte). Damit bleibt die Eigenschaft erhalten, um die es ging: Der
 * Browser des Besuchers baut keine Verbindung zu einem fremden Dienst auf,
 * die Karte braucht also keine Einwilligung und steht sofort da.
 */
export function StandortUebersicht({ studios }: { studios: UebersichtStudio[] }) {
  const verortet = studios.filter(
    (studio): studio is UebersichtStudio & { latitude: number; longitude: number } =>
      studio.latitude !== null && studio.longitude !== null,
  );

  const [naechsteId, setNaechsteId] = useState<string | null>(null);
  const [entfernungen, setEntfernungen] = useState<Record<string, number>>({});
  const [hervorgehoben, setHervorgehoben] = useState<string | null>(null);
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);

  const kannOrten = studios.length > 1 && anyStudioLocatable(studios);

  const standortAbfragen = useCallback(() => {
    if (!kannOrten) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const km: Record<string, number> = {};
        for (const studio of studios) {
          if (studio.latitude === null || studio.longitude === null) continue;
          km[studio.id] = haversineDistanceKm(
            latitude,
            longitude,
            studio.latitude,
            studio.longitude,
          );
        }
        const sortiert = sortStudiosByDistance(studios, latitude, longitude);
        setEntfernungen(km);
        if (sortiert[0]) setNaechsteId(sortiert[0].id);
      },
      () => {
        // Keine Freigabe: Die Karte bleibt, nur ohne Entfernungen.
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 },
    );
    // studios bewusst nicht in den Abhängigkeiten - ein Wechsel würde die
    // Standortabfrage erneut auslösen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kannOrten]);

  useEffect(() => {
    if (!kannOrten) return;
    standortAbfragen();
  }, [standortAbfragen, kannOrten]);

  if (verortet.length < 2) return null;

  const ausschnitt = ausschnittFuer(verortet);
  const kacheln: { x: number; y: number }[] = [];
  for (let y = ausschnitt.vonY; y <= ausschnitt.bisY; y++) {
    for (let x = ausschnitt.vonX; x <= ausschnitt.bisX; x++) {
      kacheln.push({ x, y });
    }
  }

  const punkte = verortet.map((studio, index) => ({
    studio,
    nummer: index + 1,
    ...ausschnitt.position(studio),
  }));

  const sortiertePunkte = naechsteId
    ? [...punkte].sort(
        (a, b) =>
          (entfernungen[a.studio.id] ?? Infinity) - (entfernungen[b.studio.id] ?? Infinity),
      )
    : punkte;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card overflow-hidden">
        <div
          className="karte relative w-full overflow-hidden"
          style={{ aspectRatio: `${ausschnitt.fensterBreite} / ${ausschnitt.fensterHoehe}` }}
        >
          {/* Das Kachelraster ist größer als das Fenster und liegt
              verschoben darunter - dadurch zeigt die Karte den Bereich der
              Standorte und nicht den, den die Kachelgrenzen vorgeben. */}
          <div
            className="absolute grid"
            style={{
              gridTemplateColumns: `repeat(${ausschnitt.spalten}, 1fr)`,
              left: `${ausschnitt.versatzX}%`,
              top: `${ausschnitt.versatzY}%`,
              width: `${ausschnitt.rasterBreite}%`,
              height: `${ausschnitt.rasterHoehe}%`,
            }}
            aria-hidden
          >
            {kacheln.map((kachel) => (
              // Kein next/image: Das sind bereits fertig zugeschnittene
              // Kacheln fester Größe - eine zweite Bildverarbeitung darüber
              // brächte nichts und liefe über einen weiteren Umweg.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${kachel.x}-${kachel.y}`}
                src={`/api/karte/${ausschnitt.zoom}/${kachel.x}/${kachel.y}`}
                alt=""
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                className="h-full w-full"
              />
            ))}
          </div>

          {/* Die Markierungen liegen über den Kacheln, in Prozent der
              Gesamtfläche gesetzt - dadurch sitzen sie in jeder Breite an
              der richtigen Stelle. */}
          {punkte.map(({ studio, nummer, x, y }) => {
            const istNaechste = studio.id === naechsteId;
            const aktiv = hervorgehoben === studio.id;
            return (
              <a
                key={studio.id}
                href={`#studio-${studio.id}`}
                // Nicht mit der Tastatur anspringbar: Die Liste daneben
                // führt dieselben Standorte als richtige Links. Beides
                // hieße, sich vierzehnmal doppelt durchzutabben.
                tabIndex={-1}
                aria-hidden
                title={`${studio.name} - ${studio.street}, ${studio.postalCode} ${studio.city}`}
                onMouseEnter={() => setHervorgehoben(studio.id)}
                onMouseLeave={() => setHervorgehoben(null)}
                // Feste Farben statt der Themenfarben: Die Markierung liegt
                // auf einem Kartenbild, nicht auf einer Fläche der Seite. Mit
                // text-white auf dem Akzentgrün stand sie in der dunklen
                // Ansicht bei 1,27:1 - dort ist das Akzentgrün ein helles
                // Limette. Diese beiden Paare erfüllen 4,5:1 auf hellem wie
                // auf dunklem Kartenbild (7,4:1 und 14,4:1).
                className={`karte-marke absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-md transition-transform hover:scale-125 ${
                  istNaechste ? "karte-marke-naechste" : ""
                } ${aktiv ? "z-20 scale-125" : "z-10"}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {nummer}
              </a>
            );
          })}
        </div>

        <p className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-[11px] text-muted">
          <span>Kartendaten &copy; OpenStreetMap-Mitwirkende</span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            // -my-1 py-1: Der Verweis war 18 Pixel hoch und blieb damit
            // unter dem Mindestmaß von 24 aus WCAG 2.5.8. Das negative
            // Außenmaß nimmt die Polsterung optisch wieder zurück - die
            // Zeile unter der Karte bleibt genauso schmal wie vorher.
            className="-my-1 py-1 underline underline-offset-2 hover:text-foreground"
          >
            Lizenz
          </a>
        </p>
      </div>

      <div>
        <p className="flex items-center gap-2 text-sm font-semibold">
          <MapPin size={16} className="text-accent" />
          {verortet.length} Standorte
        </p>

        {isClient && naechsteId && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-accent">
            <LocateFixed size={13} /> Nach Entfernung zu dir sortiert
          </p>
        )}

        <ol className="mt-3 max-h-[26rem] space-y-1 overflow-y-auto pr-1 text-sm">
          {sortiertePunkte.map(({ studio, nummer }) => (
            <li key={studio.id}>
              <a
                href={`#studio-${studio.id}`}
                onMouseEnter={() => setHervorgehoben(studio.id)}
                onMouseLeave={() => setHervorgehoben(null)}
                onFocus={() => setHervorgehoben(studio.id)}
                onBlur={() => setHervorgehoben(null)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:border-lime ${
                  studio.id === naechsteId
                    ? "border-lime bg-lime/10"
                    : hervorgehoben === studio.id
                      ? "border-lime/50"
                      : "border-transparent"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    studio.id === naechsteId
                      ? "bg-lime text-on-lime"
                      : "border border-border text-accent"
                  }`}
                >
                  {nummer}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{studio.city}</span>
                  <span className="block truncate text-xs text-muted">{studio.street}</span>
                </span>
                {entfernungen[studio.id] !== undefined && (
                  <span className="shrink-0 text-xs text-muted">
                    {Math.round(entfernungen[studio.id])} km
                  </span>
                )}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
