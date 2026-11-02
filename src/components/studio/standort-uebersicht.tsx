"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, LocateFixed, MapPin, X } from "lucide-react";
import { haversineDistanceKm, anyStudioLocatable, sortStudiosByDistance } from "@/lib/geo";
import { ausschnittFuer } from "@/lib/karte";
import { ortsname } from "@/lib/ortsname";
import { useSprache } from "@/lib/i18n/use-sprache";

const subscribeNothing = () => () => {};

/** So viele Studios zeigt die Liste, wenn sie nach Entfernung sortiert ist. */
const NAECHSTE_ANZAHL = 7;

/** Wie weit die Karte an ein gewähltes Studio heranfährt. */
const NAH = 1.8;

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
 *
 * Liste und Karte gehören zusammen: Ein Eintrag in der Liste wählt das
 * Studio, die Karte fährt heran und hebt die Markierung hervor; ein Tipp
 * auf eine Markierung wählt den Eintrag in der Liste. Vorher führte die
 * Liste nur zu den Karten weiter unten - auf dem Handy war danach die
 * Karte aus dem Bild und man wusste nicht mehr, welcher Punkt welcher ist.
 */
export function StandortUebersicht({ studios }: { studios: UebersichtStudio[] }) {
  const verortet = studios.filter(
    (studio): studio is UebersichtStudio & { latitude: number; longitude: number } =>
      studio.latitude !== null && studio.longitude !== null,
  );

  const [naechsteId, setNaechsteId] = useState<string | null>(null);
  const [entfernungen, setEntfernungen] = useState<Record<string, number>>({});
  const [hervorgehoben, setHervorgehoben] = useState<string | null>(null);
  // Das angetippte Studio: Die Karte zoomt dorthin, bis man es wieder abwählt.
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const karteRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLOListElement>(null);
  // Mit freigegebenem Standort zeigt die Liste zuerst nur die nächsten
  // Studios (Wunsch vom 22.10.) - wer weiter sucht, klappt alle auf.
  const [alleZeigen, setAlleZeigen] = useState(false);
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const en = useSprache() === "en";

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

  // Escape führt zurück zur ganzen Karte.
  useEffect(() => {
    if (!gewaehlt) return;
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGewaehlt(null);
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [gewaehlt]);

  const ruhig = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Aus der Liste gewählt: Auf dem Handy steht die Karte darüber und ist
  // vielleicht schon aus dem Bild - dann holen wir sie zurück.
  const ausListeWaehlen = (id: string) => {
    const neu = gewaehlt === id ? null : id;
    setGewaehlt(neu);
    if (!neu) return;
    const karte = karteRef.current?.getBoundingClientRect();
    if (karte && karte.top < 64) {
      karteRef.current?.scrollIntoView({ behavior: ruhig() ? "auto" : "smooth", block: "start" });
    }
  };

  // Von der Karte gewählt: Der Eintrag rückt in der Liste ins Bild - nur
  // innerhalb der Liste, die Seite selbst springt dabei nicht.
  const ausKarteWaehlen = (id: string) => {
    if (sortiertePunkte.findIndex((p) => p.studio.id === id) >= NAECHSTE_ANZAHL) setAlleZeigen(true);
    setGewaehlt(id);
    window.requestAnimationFrame(() => {
      const liste = listeRef.current;
      const eintrag = liste?.querySelector<HTMLElement>(`[data-studio="${id}"]`);
      if (!liste || !eintrag) return;
      const oben = eintrag.offsetTop - liste.offsetTop;
      if (oben < liste.scrollTop || oben + eintrag.offsetHeight > liste.scrollTop + liste.clientHeight) {
        liste.scrollTo({ top: oben - 8, behavior: ruhig() ? "auto" : "smooth" });
      }
    });
  };

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

  const gekuerzt = Boolean(naechsteId) && !alleZeigen && sortiertePunkte.length > NAECHSTE_ANZAHL;
  const sichtbarePunkte = gekuerzt ? sortiertePunkte.slice(0, NAECHSTE_ANZAHL) : sortiertePunkte;
  const auswahl = punkte.find((p) => p.studio.id === gewaehlt) ?? null;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card overflow-hidden">
        <div
          ref={karteRef}
          className="karte relative w-full scroll-mt-24 overflow-hidden"
          style={{ aspectRatio: `${ausschnitt.fensterBreite} / ${ausschnitt.fensterHoehe}` }}
        >
          {/* Kacheln und Markierungen liegen auf einer gemeinsamen Ebene:
              Beim Heranfahren wird sie um das gewählte Studio vergrößert und
              so verschoben, dass es in der Mitte steht. Nur transform - das
              rechnet die Grafikkarte, nicht der Hauptthread. */}
          <div
            className="absolute inset-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
            style={
              auswahl
                ? {
                    transformOrigin: `${auswahl.x}% ${auswahl.y}%`,
                    transform: `translate(${50 - auswahl.x}%, ${50 - auswahl.y}%) scale(${NAH})`,
                  }
                : undefined
            }
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
            const istGewaehlt = gewaehlt === studio.id;
            const aktiv = hervorgehoben === studio.id || istGewaehlt;
            // Beim Heranfahren wächst die Ebene mit - die Markierungen sollen
            // dabei ihre Größe behalten.
            const masstab = (aktiv ? 1.25 : 1) / (auswahl ? NAH : 1);
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
                onClick={(e) => {
                  e.preventDefault();
                  ausKarteWaehlen(studio.id);
                }}
                // Feste Farben statt der Themenfarben: Die Markierung liegt
                // auf einem Kartenbild, nicht auf einer Fläche der Seite. Mit
                // text-white auf dem Akzentgrün stand sie in der dunklen
                // Ansicht bei 1,27:1 - dort ist das Akzentgrün ein helles
                // Limette. Diese beiden Paare erfüllen 4,5:1 auf hellem wie
                // auf dunklem Kartenbild (7,4:1 und 14,4:1).
                className={`karte-marke absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-md motion-safe:transition-[scale] ${
                  istNaechste ? "karte-marke-naechste" : ""
                } ${istGewaehlt ? "karte-marke-gewaehlt z-20" : aktiv ? "z-20" : "z-10"}`}
                style={{ left: `${x}%`, top: `${y}%`, scale: String(masstab) }}
              >
                {nummer}
              </a>
            );
          })}
          </div>

          {/* Das gewählte Studio, unten auf der Karte: Name, Adresse und
              der Weg zu den Einzelheiten. */}
          {auswahl && (
            <div className="absolute inset-x-2 bottom-2 z-30 flex items-start gap-3 rounded-xl border border-border bg-background/95 p-3 text-sm shadow-lg backdrop-blur">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{ortsname(auswahl.studio.name, auswahl.studio.city)}</span>
                <span className="block truncate text-xs text-muted">
                  {auswahl.studio.street}, {auswahl.studio.postalCode} {auswahl.studio.city}
                </span>
                <a
                  href={`#studio-${auswahl.studio.id}`}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent underline-offset-2 hover:underline"
                >
                  {en ? "Opening hours & trial session" : "Öffnungszeiten & Probetraining"}
                  <ArrowDown size={12} aria-hidden />
                </a>
              </span>
              <button
                type="button"
                onClick={() => setGewaehlt(null)}
                className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
                aria-label={en ? "Show the whole map" : "Ganze Karte zeigen"}
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          )}
        </div>

        <p className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-[11px] text-muted">
          <span>{en ? "Map data © OpenStreetMap contributors" : "Kartendaten © OpenStreetMap-Mitwirkende"}</span>
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
            {en ? "Licence" : "Lizenz"}
          </a>
        </p>
      </div>

      <div>
        <p className="flex items-center gap-2 text-sm font-semibold">
          <MapPin size={16} className="text-accent" />
          {verortet.length} {en ? "studios" : "Standorte"}
        </p>

        {isClient && naechsteId && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-accent">
            <LocateFixed size={13} /> {en ? "Sorted by distance from you" : "Nach Entfernung zu dir sortiert"}
          </p>
        )}

        <p className="mt-1 text-xs text-muted">
          {en ? "Tap a studio to see it on the map." : "Tipp ein Studio an, um es auf der Karte zu sehen."}
        </p>

        <ol ref={listeRef} className="mt-3 max-h-[26rem] space-y-1 overflow-y-auto pr-1 text-sm">
          {sichtbarePunkte.map(({ studio, nummer }) => (
            <li key={studio.id} data-studio={studio.id}>
              <button
                type="button"
                onClick={() => ausListeWaehlen(studio.id)}
                aria-current={gewaehlt === studio.id ? "true" : undefined}
                aria-label={`${ortsname(studio.name, studio.city)}, ${studio.street} – ${en ? "show on map" : "auf der Karte zeigen"}`}
                onMouseEnter={() => setHervorgehoben(studio.id)}
                onMouseLeave={() => setHervorgehoben(null)}
                onFocus={() => setHervorgehoben(studio.id)}
                onBlur={() => setHervorgehoben(null)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:border-lime ${
                  gewaehlt === studio.id
                    ? "border-lime bg-lime/20"
                    : studio.id === naechsteId
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
                  <span className="block truncate font-medium">{ortsname(studio.name, studio.city)}</span>
                  <span className="block truncate text-xs text-muted">{studio.street}</span>
                </span>
                {entfernungen[studio.id] !== undefined && (
                  <span className="shrink-0 text-xs text-muted">
                    {Math.round(entfernungen[studio.id])} km
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>

        {gekuerzt && (
          <button
            type="button"
            onClick={() => setAlleZeigen(true)}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-lime"
          >
            {en
              ? `Show all ${sortiertePunkte.length} studios`
              : `Alle ${sortiertePunkte.length} Standorte anzeigen`}
          </button>
        )}
      </div>
    </div>
  );
}
