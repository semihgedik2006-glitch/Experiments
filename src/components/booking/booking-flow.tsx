"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import { motion } from "motion/react";
import { BookingForm } from "@/components/booking/booking-form";
import { allStudiosLocatable, sortStudiosByDistance } from "@/lib/geo";

/** Der Zustand ändert sich nie - useSyncExternalStore dient hier nur dazu,
 *  Server und Browser sauber zu unterscheiden. */
const subscribeNothing = () => () => {};

type DayGroup = {
  dateKey: string;
  dateLabel: string;
  slots: { id: string; startTime: string; endTime: string }[];
};

type StudioOption = {
  id: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

export function BookingFlow({
  studios,
  slotsByStudio,
}: {
  studios: StudioOption[];
  slotsByStudio: Record<string, DayGroup[]>;
}) {
  const [selectedStudioId, setSelectedStudioId] = useState(studios[0]?.id ?? "");
  const [recommendedStudioId, setRecommendedStudioId] = useState<string | null>(null);
  // Nach der Standortermittlung nach Entfernung sortiert - das nächste
  // Studio soll auch tatsächlich obenstehen und nicht nur ausgewählt sein.
  const [orderedStudios, setOrderedStudios] = useState(studios);
  const [userPicked, setUserPicked] = useState(false);

  // Die Standortabfrage lohnt nur, wenn es etwas zu vergleichen gibt und
  // jedes Studio überhaupt verortet ist. Fehlen bei einem die Koordinaten,
  // könnte es nie gewinnen - die Auszeichnung "Am nächsten" wäre dann eine
  // falsche Aussage über die anderen.
  const canLocate = studios.length > 1 && allStudiosLocatable(studios);

  // Der Hinweis "Standort wird ermittelt" darf erst nach der Hydration
  // erscheinen. Würde er schon beim ersten Aufbau aus navigator abgeleitet,
  // käme auf dem Server ein anderes Ergebnis heraus als im Browser, und
  // React verwürfe die gesamte vom Server gelieferte Seite. Sichtbar wurde
  // das erst, seit es mehr als ein Studio gibt - vorher war dieser Zweig nie
  // aktiv.
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [locationSettled, setLocationSettled] = useState(false);

  const locating =
    isClient &&
    canLocate &&
    !locationSettled &&
    typeof navigator !== "undefined" &&
    !!navigator.geolocation;

  useEffect(() => {
    if (!canLocate) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const byDistance = sortStudiosByDistance(
          studios,
          position.coords.latitude,
          position.coords.longitude,
        );
        const nearest = byDistance[0];
        if (nearest) {
          setOrderedStudios(byDistance);
          setRecommendedStudioId(nearest.id);
          setSelectedStudioId((current) => (userPicked ? current : nearest.id));
        }
        setLocationSettled(true);
      },
      () => setLocationSettled(true),
      { timeout: 8000 },
    );
    // Runs once on mount to fetch the user's position; re-running on every
    // studios/userPicked change would re-trigger the browser's location prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (studios.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-muted">
        Aktuell ist kein Studio hinterlegt. Kontaktiere uns gerne direkt über die
        Kontaktseite.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {studios.length > 1 && (
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            Studio wählen
            {locating && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-muted">
                <LocateFixed size={13} className="animate-pulse" /> Standort wird ermittelt...
              </span>
            )}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {orderedStudios.map((studio) => {
              const isSelected = selectedStudioId === studio.id;
              const isRecommended = recommendedStudioId === studio.id;
              return (
                <motion.button
                  key={studio.id}
                  type="button"
                  onClick={() => {
                    setUserPicked(true);
                    setSelectedStudioId(studio.id);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    isSelected ? "border-lime bg-lime/10" : "border-border hover:border-lime/60"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <MapPin size={15} className="shrink-0 text-accent" />
                    {studio.name}
                    {isRecommended && (
                      <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-on-lime">
                        Am nächsten
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {studio.street}, {studio.postalCode} {studio.city}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <BookingForm days={slotsByStudio[selectedStudioId] ?? []} />
    </div>
  );
}
