"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MapPin, Phone, Clock, LocateFixed, CalendarCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  allStudiosLocatable,
  anyStudioLocatable,
  haversineDistanceKm,
  sortStudiosByDistance,
} from "@/lib/geo";

const subscribeNothing = () => () => {};

export type StudioEntry = {
  id: string;
  slug: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  /**
   * Bleibt im Typ, wird auf der Karte aber nicht mehr angezeigt: Neben
   * Telefonnummer und Öffnungszeiten war sie die vierte Zeile und nahm
   * Platz, ohne eine Frage zu beantworten. Auf der Standortseite steht
   * sie weiterhin.
   */
  email: string;
  mapEmbedUrl: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
  /**
   * Freie Plätze in den nächsten sieben Tagen. Ist nichts frei, steht
   * hier null und die Zeile entfällt - "0 freie Termine" liest sich wie
   * "brauchst du gar nicht erst zu fragen", dabei ergibt ein Anruf
   * häufig trotzdem eine Zeit.
   */
  freieTermine: number | null;
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

      {/* ------------------------------------------------------------------
          Ein Raster statt vierzehn Bildschirmseiten.

          Vorher bekam jeder Standort einen eigenen Abschnitt über die
          volle Breite: links eine Karte, rechts die Adresse, 580 Pixel
          hoch. Bei vierzehn Studios ergab das eine Seite von fast 10.000
          Pixeln - und weil die Karte erst nach einem Klick lädt, stand
          darin vierzehnmal derselbe Hinweistext über die Verbindung zu
          Google. Wer den zum dritten Mal liest, hat aufgehört zu lesen.

          Die Einzelkarte ist deshalb weg. Sie steht ohnehin auf der Seite
          des jeweiligen Studios, einen Klick entfernt und dort in voller
          Größe - und den Überblick über alle vierzehn gibt der Lageplan
          oben auf dieser Seite, der schon interaktiv ist.

          Geblieben ist alles, wonach hier gesucht wird: Name, Adresse,
          Entfernung, Telefon, Öffnungszeiten und die freien Termine.
          ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((studio) => (
              <li
                key={studio.id}
                // Sprungziel für den Lageplan oben. scroll-mt hält die
                // Karte frei von der stehenden Kopfzeile.
                id={`studio-${studio.id}`}
                className="scroll-mt-24"
              >
                <div
                  className={`karte-hebt flex h-full flex-col rounded-2xl border bg-surface-raised p-6 ${
                    studio.id === nearestId ? "border-lime" : "border-border"
                  }`}
                >
                  <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                    {studio.name}
                    {studio.id === nearestId && (
                      <span className="rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-semibold text-on-lime">
                        Am nächsten
                      </span>
                    )}
                  </h2>

                  <ul className="mt-4 flex-1 space-y-3 text-sm">
                    <li className="flex items-start gap-2.5">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                      <span>
                        {studio.street}
                        <br />
                        {studio.postalCode} {studio.city}
                        {distances[studio.id] !== undefined && (
                          <span className="mt-0.5 block text-muted">
                            rund {Math.round(distances[studio.id])} km Luftlinie von dir
                          </span>
                        )}
                      </span>
                    </li>

                    {studio.phone && (
                      <li className="flex items-start gap-2.5">
                        <Phone size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                        <a href={`tel:${studio.phone}`} className="hover:underline">
                          {studio.phone}
                        </a>
                      </li>
                    )}

                    <li className="flex items-start gap-2.5">
                      <Clock size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                      <span className="whitespace-pre-line text-muted">
                        {studio.openingHours}
                      </span>
                    </li>

                    {/* Die Zahl, die auf dieser Seite tatsächlich gesucht
                        wird: Kann ich da diese Woche überhaupt hin? */}
                    {studio.freieTermine !== null && (
                      <li className="flex items-start gap-2.5">
                        <CalendarCheck size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                        <span>
                          <strong className="font-semibold">{studio.freieTermine}</strong>{" "}
                          {studio.freieTermine === 1 ? "freier Termin" : "freie Termine"} in
                          den nächsten 7 Tagen
                        </span>
                      </li>
                    )}
                  </ul>

                  {/* Zur Standortseite statt zur allgemeinen Terminseite:
                      Dort steht der Ort im Titel, die Anfahrt, die Karte
                      und nur die freien Zeiten dieses Studios - und die
                      Anfrage kommt ohne weitere Auswahl beim richtigen
                      Standort an. */}
                  {/* Nicht "Studio {city} ansehen": Sechs der vierzehn
                      Standorte liegen in Köln, damit stünde sechsmal
                      derselbe Knopf im Raster und man wüsste nicht, wohin
                      welcher führt. Der Name steht in der Überschrift
                      darüber - der Knopf muss nur sagen, was dahinter
                      kommt. */}
                  <Button href={`/studio/${studio.slug}`} className="mt-6 w-full">
                    Details &amp; Anfahrt
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
