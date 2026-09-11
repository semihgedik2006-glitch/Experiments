"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import { motion } from "motion/react";
import { BookingForm } from "@/components/booking/booking-form";
import { allStudiosLocatable, anyStudioLocatable, sortStudiosByDistance } from "@/lib/geo";
import type { TerminTag as DayGroup } from "@/lib/termin-tage";
import { texte, type Sprache } from "@/lib/sprache";

/** Der Zustand ändert sich nie - useSyncExternalStore dient hier nur dazu,
 *  Server und Browser sauber zu unterscheiden. */
const subscribeNothing = () => () => {};

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
  sprache = "de",
}: {
  studios: StudioOption[];
  slotsByStudio: Record<string, DayGroup[]>;
  /** Auf der englischen Seite "en" - siehe src/lib/sprache.ts. */
  sprache?: Sprache;
}) {
  const t = texte(sprache);
  const englisch = sprache === "en";
  const [selectedStudioId, setSelectedStudioId] = useState(studios[0]?.id ?? "");
  const [recommendedStudioId, setRecommendedStudioId] = useState<string | null>(null);
  // Nach der Standortermittlung nach Entfernung sortiert - das nächste
  // Studio soll auch tatsächlich obenstehen und nicht nur ausgewählt sein.
  const [orderedStudios, setOrderedStudios] = useState(studios);
  const [userPicked, setUserPicked] = useState(false);

  // Sortiert wird, sobald wenigstens ein Studio Koordinaten hat. Studios
  // ohne hängen hinten an.
  const canLocate = studios.length > 1 && anyStudioLocatable(studios);

  // Die Auszeichnung "Am nächsten" setzt dagegen voraus, dass jedes Studio
  // verortet ist - sonst könnte ausgerechnet das unverortete das nächste
  // sein und die Aussage wäre falsch.
  const canName = allStudiosLocatable(studios);

  // Der Hinweis "Standort wird ermittelt" darf erst nach der Hydration
  // erscheinen. Würde er schon beim ersten Aufbau aus navigator abgeleitet,
  // käme auf dem Server ein anderes Ergebnis heraus als im Browser, und
  // React verwürfe die gesamte vom Server gelieferte Seite. Sichtbar wurde
  // das erst, seit es mehr als ein Studio gibt - vorher war dieser Zweig nie
  // aktiv.
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [locationSettled, setLocationSettled] = useState(false);
  // Unterschieden wird bewusst: Eine abgelehnte Freigabe merkt sich der
  // Browser, ein erneuter Versuch führt dann zu nichts. Bei einem
  // fehlgeschlagenen oder zu langsamen Versuch lohnt er dagegen.
  const [failure, setFailure] = useState<"denied" | "unavailable" | null>(null);
  // Merkt sich außerhalb des Renderns, ob schon eine Antwort da war - die
  // Wartezeitüberwachung unten darf sonst nicht wissen, wann sie eingreifen
  // muss.
  const settledRef = useRef(false);

  const locating =
    isClient &&
    canLocate &&
    !locationSettled &&
    typeof navigator !== "undefined" &&
    !!navigator.geolocation;

  const requestLocation = useCallback(() => {
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
          if (canName) setRecommendedStudioId(nearest.id);
          setSelectedStudioId((current) => (userPicked ? current : nearest.id));
        }
        settledRef.current = true;
        setLocationSettled(true);
      },
      (error) => {
        settledRef.current = true;
        setFailure(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
        setLocationSettled(true);
      },
      // Hohe Genauigkeit, weil am Rechner sonst grob über die IP-Adresse
      // geschätzt wird - dabei landet man schnell im falschen Stadtteil.
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 },
    );
    // studios und userPicked absichtlich nicht in den Abhängigkeiten: Ein
    // Wechsel würde die Standortabfrage erneut auslösen und den Nutzer noch
    // einmal um Erlaubnis fragen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLocate, canName]);

  useEffect(() => {
    if (!canLocate) return;
    requestLocation();

    // Eigene Wartezeitüberwachung: Solange die Erlaubnisabfrage offen ist,
    // ruft der Browser weder den Erfolgs- noch den Fehlerfall auf - und die
    // Zeitbegrenzung der Schnittstelle läuft dabei ebenfalls nicht. Wer die
    // Abfrage einfach stehen lässt, sähe sonst endlos "Standort wird
    // ermittelt...". Nach zwölf Sekunden bieten wir stattdessen an, es
    // erneut zu versuchen.
    const timer = setTimeout(() => {
      if (settledRef.current) return;
      setFailure("unavailable");
      setLocationSettled(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, [requestLocation, canLocate]);

  if (studios.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-muted">
        {sprache === "de"
          ? "Aktuell ist kein Studio hinterlegt. Kontaktiere uns gerne direkt über die Kontaktseite."
          : "No studio is listed right now. Please get in touch with us directly."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {studios.length > 1 && (
        <div>
          <p className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
            {t.studioWaehlen}
            {locating && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-muted">
                <LocateFixed size={13} className="animate-pulse" />{" "}
                {englisch ? "Finding your location..." : "Standort wird ermittelt..."}
              </span>
            )}
            {/* Verweigert der Browser den Standort oder dauert es zu lange,
                passierte bisher nichts Sichtbares - die Liste stand einfach
                in der gespeicherten Reihenfolge da. Jetzt lässt sich der
                Versuch bewusst wiederholen. */}
            {canLocate && failure === "denied" && (
              <span className="text-xs font-normal text-muted">{t.ortAbgelehnt}</span>
            )}
            {canLocate && failure === "unavailable" && (
              <button
                type="button"
                onClick={() => {
                  settledRef.current = false;
                  setFailure(null);
                  setLocationSettled(false);
                  requestLocation();
                }}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-normal text-muted transition-colors hover:border-lime hover:text-foreground"
              >
                <LocateFixed size={13} /> {t.naechstesFinden}
              </button>
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
                  // karte-hebt gibt derselben Kachel dieselbe Rückmeldung
                  // wie überall sonst auf der Seite. Die ausgewählte hebt
                  // sich nicht mit: Sie ist schon hervorgehoben, und eine
                  // zweite Hervorhebung darüber macht die Auswahl unklar.
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-lime bg-lime/10"
                      : "karte-hebt border-border"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <MapPin size={15} className="shrink-0 text-accent" />
                    {studio.name}
                    {isRecommended && (
                      <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-on-lime">
                        {englisch ? "Closest" : "Am nächsten"}
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

      {/* Der Standort geht als verstecktes Feld mit ins Formular. Ohne ihn
          hing eine Anfrage nur dann an einem Studio, wenn zusätzlich eine
          feste Zeit angeklickt wurde. */}
      <BookingForm
        days={slotsByStudio[selectedStudioId] ?? []}
        studioId={selectedStudioId}
        studioName={
          orderedStudios.find((studio) => studio.id === selectedStudioId)?.name ?? ""
        }
        sprache={sprache}
      />
    </div>
  );
}
