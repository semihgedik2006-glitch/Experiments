"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { haversineDistanceKm, anyStudioLocatable, sortStudiosByDistance } from "@/lib/geo";

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
 * Lageplan aller Standorte.
 *
 * Bewusst kein eingebetteter Straßenplan: Der ginge nur über einen Dienst
 * wie Google, der beim Laden die IP-Adresse des Besuchers überträgt - und
 * die Karten weiter unten auf der Seite fragen dafür einzeln um Erlaubnis.
 * Eine Übersicht ganz oben, die erst nach einem Klick erscheint, wäre keine
 * Übersicht.
 *
 * Dieser Plan wird aus den Koordinaten selbst gezeichnet: keine fremde
 * Verbindung, keine Einwilligung nötig, und er steht sofort da. Er zeigt,
 * wie die Standorte zueinander liegen - Straßen und Anfahrt zeigt die
 * Karte beim jeweiligen Studio.
 */
export function StandortUebersicht({ studios }: { studios: UebersichtStudio[] }) {
  const verortet = studios.filter(
    (studio): studio is UebersichtStudio & { latitude: number; longitude: number } =>
      studio.latitude !== null && studio.longitude !== null,
  );

  const [naechsteId, setNaechsteId] = useState<string | null>(null);
  const [entfernungen, setEntfernungen] = useState<Record<string, number>>({});
  const settledRef = useRef(false);
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);

  const kannOrten = studios.length > 1 && anyStudioLocatable(studios);

  const standortAbfragen = useCallback(() => {
    if (!kannOrten) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const km: Record<string, number> = {};
        for (const studio of verortet) {
          km[studio.id] = haversineDistanceKm(
            latitude,
            longitude,
            studio.latitude,
            studio.longitude,
          );
        }
        const sortiert = sortStudiosByDistance(studios, latitude, longitude);
        settledRef.current = true;
        setEntfernungen(km);
        if (sortiert[0]) setNaechsteId(sortiert[0].id);
      },
      () => {
        settledRef.current = true;
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

  // Kleinstes Rechteck um alle Standorte. Auf die Breite wird der Kosinus
  // der mittleren Breite gerechnet - sonst zieht sich der Plan in unseren
  // Breitengraden waagerecht auseinander, und Nachbarorte sähen weiter
  // auseinander aus, als sie liegen.
  const breiten = verortet.map((s) => s.latitude);
  const mittlereBreite = (Math.min(...breiten) + Math.max(...breiten)) / 2;
  const kor = Math.cos((mittlereBreite * Math.PI) / 180);

  const xs = verortet.map((s) => s.longitude * kor);
  const ys = verortet.map((s) => -s.latitude);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Quadratischer Ausschnitt, damit die Abstände in beide Richtungen
  // denselben Maßstab haben.
  const spanne = Math.max(maxX - minX, maxY - minY) || 0.01;
  const rand = spanne * 0.16;
  const gesamt = spanne + rand * 2;
  const mittelX = (minX + maxX) / 2;
  const mittelY = (minY + maxY) / 2;

  const punkte = verortet.map((studio, index) => ({
    studio,
    nummer: index + 1,
    x: ((studio.longitude * kor - (mittelX - gesamt / 2)) / gesamt) * 100,
    y: ((-studio.latitude - (mittelY - gesamt / 2)) / gesamt) * 100,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card relative overflow-hidden p-4">
        {/* Für die Sprachausgabe ausgeblendet, und die Punkte sind nicht
            mit der Tastatur anspringbar. Die Liste daneben führt dieselben
            vierzehn Standorte als richtige Links - beides anzubieten hieße,
            sich vierzehnmal doppelt durchzutabben. Ein role="img" wäre hier
            zudem unzulässig: Ein Bild darf keine fokussierbaren Elemente
            enthalten. Mit der Maus bleibt der Plan voll bedienbar. */}
        <svg
          viewBox="0 0 100 100"
          className="h-auto w-full"
          aria-hidden
          focusable="false"
        >
          {/* Hilfsraster - gibt dem Plan Tiefe, ohne etwas zu behaupten. */}
          <defs>
            <pattern id="raster" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="0.3"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#raster)" />

          {punkte.map(({ studio, nummer, x, y }) => {
            const istNaechste = studio.id === naechsteId;
            return (
              <a key={studio.id} href={`#studio-${studio.id}`} tabIndex={-1}>
                <title>{studio.name}</title>
                {istNaechste && (
                  <circle cx={x} cy={y} r="5" fill="var(--color-lime)" opacity="0.25" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r="2.6"
                  fill={istNaechste ? "var(--color-lime)" : "var(--surface-raised)"}
                  stroke="var(--color-accent)"
                  strokeWidth="0.7"
                />
                <text
                  x={x}
                  y={y + 0.9}
                  textAnchor="middle"
                  fontSize="2.6"
                  fontWeight="600"
                  fill={istNaechste ? "var(--color-on-lime)" : "var(--color-accent)"}
                >
                  {nummer}
                </text>
              </a>
            );
          })}
        </svg>

        <p className="mt-2 text-center text-xs text-muted">
          Lageplan zur Orientierung - die Straßenkarte mit Anfahrt steht bei jedem
          Studio weiter unten.
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
          {(naechsteId
            ? [...punkte].sort(
                (a, b) =>
                  (entfernungen[a.studio.id] ?? Infinity) -
                  (entfernungen[b.studio.id] ?? Infinity),
              )
            : punkte
          ).map(({ studio, nummer }) => (
            <li key={studio.id}>
              <a
                href={`#studio-${studio.id}`}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:border-lime ${
                  studio.id === naechsteId ? "border-lime bg-lime/10" : "border-transparent"
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
