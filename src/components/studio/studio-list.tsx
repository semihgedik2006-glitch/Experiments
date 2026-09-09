"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MapPin, Phone, Mail, Clock, LocateFixed } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { MapEmbed } from "@/components/map-embed";
import { studioMapUrl } from "@/lib/studio-map";
import {
  allStudiosLocatable,
  anyStudioLocatable,
  haversineDistanceKm,
  sortStudiosByDistance,
} from "@/lib/geo";

const subscribeNothing = () => () => {};

export type StudioEntry = {
  id: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Standortliste, nach Entfernung sortiert.
 *
 * Die Seite heißt "Studios finden" und verspricht in der Einleitung den
 * Standort in der Nähe - sortierte aber stur nach dem Feld "Position" im
 * Adminbereich. Bei einem einzigen Studio fiel das nicht auf, bei vierzehn
 * schon: Wer die Seite öffnete, sah immer dieselbe Reihenfolge, egal wo er
 * stand.
 *
 * Die Regeln sind dieselben wie bei der Terminbuchung: Sortiert wird,
 * sobald wenigstens ein Studio Koordinaten hat; die Auszeichnung
 * "Am nächsten" erscheint nur, wenn alle verortet sind.
 */
export function StudioList({ studios }: { studios: StudioEntry[] }) {
  const [ordered, setOrdered] = useState(studios);
  const [nearestId, setNearestId] = useState<string | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [failure, setFailure] = useState<"denied" | "unavailable" | null>(null);
  const [settled, setSettled] = useState(false);
  const settledRef = useRef(false);

  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);

  const canLocate = studios.length > 1 && anyStudioLocatable(studios);
  const canName = allStudiosLocatable(studios);

  const locating =
    isClient && canLocate && !settled && typeof navigator !== "undefined" && !!navigator.geolocation;

  const requestLocation = useCallback(() => {
    if (!canLocate) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const byDistance = sortStudiosByDistance(studios, latitude, longitude);

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

        settledRef.current = true;
        setOrdered(byDistance);
        setDistances(km);
        if (canName && byDistance[0]) setNearestId(byDistance[0].id);
        setSettled(true);
      },
      (error) => {
        settledRef.current = true;
        setFailure(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
        setSettled(true);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 },
    );
    // studios bewusst nicht in den Abhängigkeiten - ein Wechsel würde die
    // Standortabfrage erneut auslösen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLocate, canName]);

  useEffect(() => {
    if (!canLocate) return;
    requestLocation();

    // Eigene Wartezeitüberwachung: Solange die Erlaubnisabfrage offen ist,
    // meldet der Browser weder Erfolg noch Fehler, und die Zeitbegrenzung
    // der Schnittstelle läuft dabei nicht.
    const timer = setTimeout(() => {
      if (settledRef.current) return;
      setFailure("unavailable");
      setSettled(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, [requestLocation, canLocate]);

  return (
    <>
      {canLocate && (
        <Container className="pt-10">
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {locating && (
              <>
                <LocateFixed size={14} className="animate-pulse text-accent" />
                Standort wird ermittelt...
              </>
            )}
            {!locating && nearestId && (
              <>
                <LocateFixed size={14} className="text-accent" />
                Nach Entfernung zu deinem Standort sortiert.
              </>
            )}
            {!locating && !nearestId && settled && failure === "denied" && (
              <>Standort nicht freigegeben - die Studios stehen in fester Reihenfolge.</>
            )}
            {!locating && !nearestId && settled && failure !== "denied" && (
              <button
                type="button"
                onClick={() => {
                  settledRef.current = false;
                  setFailure(null);
                  setSettled(false);
                  requestLocation();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 transition-colors hover:border-lime hover:text-foreground"
              >
                <LocateFixed size={14} /> Studio in meiner Nähe zuerst
              </button>
            )}
          </p>
        </Container>
      )}

      {ordered.map((studio, index) => (
        <section
          key={studio.id}
          // Sprungziel für den Lageplan oben. scroll-mt hält die Überschrift
          // frei von der stehenden Kopfzeile - sonst landet der Sprung
          // dahinter und man sieht die Mitte des Abschnitts.
          id={`studio-${studio.id}`}
          className={`scroll-mt-20 py-24 ${index > 0 ? "border-t border-border" : ""} ${index % 2 === 1 ? "bg-surface" : ""}`}
        >
          <Container className="grid gap-10 md:grid-cols-2">
            <Reveal className="overflow-hidden rounded-2xl border border-border">
              <MapEmbed
                src={studioMapUrl(studio)}
                title={`${studio.name} auf Google Maps`}
                className="h-96 w-full"
              />
            </Reveal>

            <Reveal delay={0.15} className="card p-8">
              <h2 className="flex flex-wrap items-center gap-3 text-xl font-semibold">
                {studio.name}
                {studio.id === nearestId && (
                  <span className="rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-semibold text-on-lime">
                    Am nächsten
                  </span>
                )}
              </h2>

              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    {studio.street}
                    <br />
                    {studio.postalCode} {studio.city}
                    {distances[studio.id] !== undefined && (
                      <span className="mt-1 block text-muted">
                        rund {Math.round(distances[studio.id])} km Luftlinie von dir
                      </span>
                    )}
                  </span>
                </li>
                {studio.phone && (
                  <li className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-accent" />
                    <a href={`tel:${studio.phone}`} className="hover:underline">
                      {studio.phone}
                    </a>
                  </li>
                )}
                {studio.email && (
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
                    <a href={`mailto:${studio.email}`} className="hover:underline">
                      {studio.email}
                    </a>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-accent" />
                  <span className="whitespace-pre-line">{studio.openingHours}</span>
                </li>
              </ul>

              <Button href="/probetermin" className="mt-8 w-full">
                Probetermin in {studio.city} buchen
              </Button>
            </Reveal>
          </Container>
        </section>
      ))}
    </>
  );
}
