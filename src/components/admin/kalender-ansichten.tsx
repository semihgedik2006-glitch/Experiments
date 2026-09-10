import Link from "next/link";
import { CalendarOff, ChevronLeft, ChevronRight, Phone, Users } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/admin/ui";
import { mitParams, type SuchParams } from "@/lib/admin-list";
import { STATUS_LABEL, STATUS_TON } from "@/lib/buchung-status";
import type { BookingStatus } from "@/generated/prisma/enums";
import {
  OHNE_TERMIN,
  istVoll,
  studioTagSchluessel,
  type Belegung,
} from "@/lib/kalender";
import {
  WOCHENTAGE_KURZ,
  kurzesDatum,
  langerTag,
  tagesSchluessel,
} from "@/lib/woche";

/**
 * Die drei Ansichten des Kalenders. Zum Aufbau siehe src/lib/kalender.ts.
 *
 * Alles hier sind Server-Komponenten: Es wird nichts umgeschaltet, was
 * nicht auch als Adresse taugt. Ein Klick auf einen Tag in der Wochen- oder
 * Monatsansicht führt in die Tagesansicht dieses Tages - mitsamt dem
 * Studiofilter, der gerade eingestellt ist.
 */

/** Gemeinsame Optik der Blätter-Schaltflächen. */
const navKnopf =
  "inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-lime";

export function KalenderNav({
  titel,
  zurueckHref,
  zurueckLabel,
  vorHref,
  vorLabel,
  heuteHref,
  heuteLabel,
}: {
  titel: string;
  zurueckHref: string;
  zurueckLabel: string;
  vorHref: string;
  vorLabel: string;
  heuteHref: string;
  heuteLabel: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <p className="font-medium">{titel}</p>
      <nav aria-label="Zeitraum wechseln" className="flex items-center gap-2">
        <Link href={zurueckHref} className={navKnopf}>
          <ChevronLeft size={14} aria-hidden /> {zurueckLabel}
        </Link>
        <Link href={heuteHref} className={navKnopf}>
          {heuteLabel}
        </Link>
        <Link href={vorHref} className={navKnopf}>
          {vorLabel} <ChevronRight size={14} aria-hidden />
        </Link>
      </nav>
    </div>
  );
}

/** Farbe der Belegungszahl: voll ist ein Zustand, über den man Bescheid wissen will. */
function belegungsTon(belegung: Belegung): string {
  if (belegung.termine === 0) return "text-muted";
  return istVoll(belegung) ? "text-danger" : "";
}

/* ------------------------------------------------------------------ Tag */

export type TagesGast = {
  id: string;
  name: string;
  phone: string;
  status: BookingStatus;
  zuZweit: boolean;
};

export type TagesSlot = {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  belegt: number;
  studioName: string;
  gaeste: TagesGast[];
};

/**
 * Ein Tag, nach Uhrzeit gebündelt.
 *
 * Nach Uhrzeit und nicht nach Standort: Um neun Uhr will man wissen, was um
 * neun Uhr läuft - an welchem der vierzehn Standorte, steht dann in der
 * Karte. Nach Standort gruppiert müsste man vierzehn Blöcke durchgehen, um
 * dieselbe Frage zu beantworten.
 */
export function KalenderTag({ tag, slots }: { tag: Date; slots: TagesSlot[] }) {
  if (slots.length === 0) {
    return (
      <EmptyState icon={CalendarOff} title={`Am ${langerTag(tag)} steht nichts an`}>
        Für diesen Tag ist kein Termin eingetragen. Wiederkehrende Zeiten legst
        du unter Verfügbarkeit an - daraus füllen sich die nächsten Wochen von
        selbst.
      </EmptyState>
    );
  }

  // Nach Uhrzeit bündeln. Die Liste kommt bereits nach Startzeit sortiert
  // herein, deshalb genügt eine Runde.
  const bloecke: { zeit: string; slots: TagesSlot[] }[] = [];
  for (const slot of slots) {
    const letzter = bloecke.at(-1);
    if (letzter && letzter.zeit === slot.startTime) letzter.slots.push(slot);
    else bloecke.push({ zeit: slot.startTime, slots: [slot] });
  }

  return (
    <div className="space-y-3">
      {bloecke.map((block) => (
        <div key={block.zeit} className="admin-panel p-3 sm:p-4">
          <p className="text-sm font-semibold tabular-nums">
            {block.zeit}
            <span className="ml-2 font-normal text-muted">
              {block.slots.length} {block.slots.length === 1 ? "Termin" : "Termine"}
            </span>
          </p>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {block.slots.map((slot) => {
              const voll = slot.belegt >= slot.capacity;
              return (
                <div
                  key={slot.id}
                  className="rounded-lg border border-border bg-surface-raised p-3"
                >
                  {/* Der Name wird gekürzt, die Zahl nicht: Bei
                      "Körperformen Neunkirchen-Seelscheid" rutschte die
                      Belegung sonst in die zweite Zeile, und die Karten
                      einer Reihe standen unterschiedlich hoch. */}
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium" title={slot.studioName}>
                      {slot.studioName}
                    </p>
                    <p
                      className={`shrink-0 text-xs tabular-nums ${voll ? "text-danger" : "text-muted"}`}
                    >
                      {slot.belegt}/{slot.capacity} belegt
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs tabular-nums text-muted">
                    {slot.startTime}&ndash;{slot.endTime} Uhr
                  </p>

                  {slot.gaeste.length === 0 ? (
                    <p className="mt-2 text-xs text-muted">Noch niemand angemeldet.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {slot.gaeste.map((gast) => (
                        <li
                          key={gast.id}
                          className="border-t border-border/60 pt-1.5 text-sm first:border-0 first:pt-0"
                        >
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-medium">{gast.name}</span>
                            {gast.zuZweit && (
                              <span className="inline-flex items-center gap-1 text-xs text-accent">
                                <Users size={12} aria-hidden />
                                zu zweit
                              </span>
                            )}
                            <StatusBadge ton={STATUS_TON[gast.status]}>
                              {STATUS_LABEL[gast.status]}
                            </StatusBadge>
                          </span>
                          {/* Anrufbar statt nur lesbar: Der Trainer steht mit
                              dem Handy in der Hand vor dem Gerät, wenn jemand
                              nicht auftaucht. */}
                          <a
                            href={`tel:${gast.phone.replace(/\s/g, "")}`}
                            className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-accent"
                          >
                            <Phone size={11} aria-hidden />
                            {gast.phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Woche */

/**
 * Standorte als Zeilen, Tage als Spalten.
 *
 * Das ist die Ansicht, für die es den Kalender überhaupt gibt: In der
 * Verfügbarkeitsansicht stapeln sich alle vierzehn Standorte in denselben
 * sieben Spalten, und man sieht gerade nicht mehr, welcher davon eine leere
 * Woche hat.
 *
 * Ab Tablet-Breite eine Tabelle, darunter Tag für Tag untereinander. Eine
 * Tabelle mit acht Spalten auf 360 Pixeln ließe sich nur noch seitwärts
 * schieben, und dabei verschwindet ausgerechnet die Spalte mit dem
 * Standortnamen aus dem Bild.
 */
export function KalenderWoche({
  basis,
  params,
  tage,
  studios,
  belegung,
}: {
  basis: string;
  params: SuchParams;
  tage: Date[];
  studios: { id: string; name: string }[];
  belegung: Map<string, Belegung>;
}) {
  const heute = tagesSchluessel(new Date());
  const holen = (studioId: string, tag: Date) =>
    belegung.get(studioTagSchluessel(studioId, tag)) ?? OHNE_TERMIN;

  // Leerer Modus statt "tag": Der Tag ist die Voreinstellung, und
  // mitParams lässt Standardwerte aus der Adresse fallen. Sonst schleppt
  // jede weitergegebene Adresse ein ?modus=tag mit, das nichts bewirkt.
  const tagesLink = (tag: Date, studioId?: string) =>
    mitParams(basis, params, {
      modus: "",
      datum: tagesSchluessel(tag),
      ...(studioId ? { studio: studioId } : {}),
    });

  // Summe je Tag über alle angezeigten Standorte - die Schlusszeile.
  const summeJeTag = tage.map((tag) =>
    studios.reduce<Belegung>(
      (summe, studio) => {
        const wert = holen(studio.id, tag);
        return {
          termine: summe.termine + wert.termine,
          plaetze: summe.plaetze + wert.plaetze,
          belegt: summe.belegt + wert.belegt,
        };
      },
      { ...OHNE_TERMIN },
    ),
  );

  if (studios.length === 0) {
    return (
      <EmptyState icon={CalendarOff} title="Kein Standort ausgewählt">
        Ohne Standort gibt es keine Zeilen - über „Alle Studios“ oben siehst du
        wieder alle.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="admin-panel hidden overflow-x-auto p-0 md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Belegte Plätze je Standort und Tag. Die Zahlen bedeuten belegte von
            verfügbaren Plätzen.
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-3 py-2.5 text-left font-medium text-muted">
                Standort
              </th>
              {tage.map((tag) => {
                const istHeute = tagesSchluessel(tag) === heute;
                return (
                  <th
                    key={tagesSchluessel(tag)}
                    scope="col"
                    className="px-2 py-2.5 text-center font-medium"
                  >
                    <Link
                      href={tagesLink(tag)}
                      className={`block rounded-md px-1 py-0.5 transition-colors hover:text-accent ${
                        istHeute ? "text-accent" : "text-muted"
                      }`}
                    >
                      <span className="block">{WOCHENTAGE_KURZ[(tag.getDay() + 6) % 7]}</span>
                      <span className="block text-xs font-normal tabular-nums">
                        {kurzesDatum(tag)}
                      </span>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {studios.map((studio) => (
              <tr key={studio.id} className="border-b border-border/60">
                <th
                  scope="row"
                  className="max-w-[14rem] truncate px-3 py-2 text-left font-normal"
                  title={studio.name}
                >
                  {studio.name}
                </th>
                {tage.map((tag) => {
                  const wert = holen(studio.id, tag);
                  return (
                    <td key={tagesSchluessel(tag)} className="px-2 py-2 text-center">
                      {wert.termine === 0 ? (
                        // Ein Gedankenstrich statt "0/0": Kein Termin
                        // eingetragen ist etwas anderes als ein leerer
                        // Termin, und beides sähe sonst gleich aus.
                        <span className="text-muted" aria-label="kein Termin">
                          &ndash;
                        </span>
                      ) : (
                        <Link
                          href={tagesLink(tag, studio.id)}
                          className={`inline-block rounded-md px-2 py-0.5 tabular-nums transition-colors hover:bg-lime/12 ${belegungsTon(wert)}`}
                          title={`${wert.termine} ${wert.termine === 1 ? "Termin" : "Termine"}`}
                        >
                          {wert.belegt}/{wert.plaetze}
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {studios.length > 1 && (
            <tfoot>
              <tr className="border-t border-border">
                <th scope="row" className="px-3 py-2.5 text-left font-semibold">
                  Alle zusammen
                </th>
                {summeJeTag.map((wert, i) => (
                  <td
                    key={tagesSchluessel(tage[i])}
                    className={`px-2 py-2.5 text-center font-semibold tabular-nums ${belegungsTon(wert)}`}
                  >
                    {wert.termine === 0 ? <>&ndash;</> : `${wert.belegt}/${wert.plaetze}`}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Auf dem Handy Tag für Tag - leere Tage bleiben als eine Zeile
          stehen, damit eine Lücke mitten in der Woche sichtbar bleibt. */}
      <div className="space-y-2 md:hidden">
        {tage.map((tag, i) => {
          const key = tagesSchluessel(tag);
          const zeilen = studios
            .map((studio) => ({ studio, wert: holen(studio.id, tag) }))
            .filter((zeile) => zeile.wert.termine > 0);

          return (
            <div key={key} className={`admin-panel p-3 ${key === heute ? "border-lime" : ""}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={tagesLink(tag)} className="text-sm font-semibold hover:text-accent">
                  {langerTag(tag)}
                </Link>
                {zeilen.length > 0 && (
                  <span className={`text-xs tabular-nums ${belegungsTon(summeJeTag[i])}`}>
                    {summeJeTag[i].belegt}/{summeJeTag[i].plaetze} Plätze
                  </span>
                )}
              </div>

              {zeilen.length === 0 ? (
                <p className="mt-1 text-xs text-muted">Kein Termin eingetragen.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {zeilen.map(({ studio, wert }) => (
                    <li key={studio.id} className="text-sm">
                      <Link
                        href={tagesLink(tag, studio.id)}
                        className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-1 hover:text-accent"
                      >
                        <span className="truncate">{studio.name}</span>
                        <span className={`shrink-0 tabular-nums ${belegungsTon(wert)}`}>
                          {wert.belegt}/{wert.plaetze}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Monat */

/**
 * Der Monat als Gitter.
 *
 * Hier stehen bewusst keine Namen und keine Uhrzeiten - dafür ist der Tag
 * da. Der Monat beantwortet eine andere Frage: Wo im Monat ist noch Luft?
 * Deshalb je Tag nur zwei Angaben, die Zahl der Termine und der Anteil der
 * belegten Plätze als Balken.
 */
export function KalenderMonat({
  basis,
  params,
  monat,
  tage,
  belegung,
}: {
  basis: string;
  params: SuchParams;
  /** Irgendein Tag des angezeigten Monats - für "gehört dieser Tag dazu". */
  monat: Date;
  /** Das ganze Gitter, also mit den Randtagen der Nachbarmonate. */
  tage: Date[];
  belegung: Map<string, Belegung>;
}) {
  const heute = tagesSchluessel(new Date());
  const wochen: Date[][] = [];
  for (let i = 0; i < tage.length; i += 7) wochen.push(tage.slice(i, i + 7));

  return (
    <div className="admin-panel overflow-x-auto p-0">
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">
          Der Monat {monat.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}. Je
          Tag stehen die Zahl der Termine und die belegten von den verfügbaren
          Plätzen.
        </caption>
        <thead>
          <tr className="border-b border-border">
            {WOCHENTAGE_KURZ.map((name) => (
              <th
                key={name}
                scope="col"
                className="px-1 py-2 text-center text-xs font-medium text-muted"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wochen.map((woche) => (
            <tr key={tagesSchluessel(woche[0])}>
              {woche.map((tag) => {
                const key = tagesSchluessel(tag);
                const wert = belegung.get(key) ?? OHNE_TERMIN;
                const imMonat = tag.getMonth() === monat.getMonth();
                const istHeute = key === heute;
                const anteil = wert.plaetze > 0 ? wert.belegt / wert.plaetze : 0;

                return (
                  <td key={key} className="border-t border-border/60 p-0 align-top">
                    <Link
                      href={mitParams(basis, params, { modus: "", datum: key })}
                      aria-current={istHeute ? "date" : undefined}
                      className="flex h-20 flex-col gap-1 p-1.5 transition-colors hover:bg-lime/10 sm:h-24 sm:p-2"
                    >
                      {/* Die Randtage der Nachbarmonate treten zurück - aber
                          über die Schriftfarbe, nicht über die Deckkraft.
                          Mit opacity-45 kam die Zahl auf 2,85:1 gegen die
                          Fläche und war damit unter der Vorgabe von 4,5:1;
                          text-muted ist auf genau diese Fläche abgestimmt. */}
                      <span
                        className={`text-xs tabular-nums ${
                          istHeute
                            ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-lime font-bold text-on-lime"
                            : imMonat
                              ? "font-semibold"
                              : "text-muted"
                        }`}
                      >
                        {tag.getDate()}
                      </span>

                      {wert.termine > 0 && (
                        <>
                          <span
                            className={`text-[11px] tabular-nums leading-tight ${
                              imMonat ? belegungsTon(wert) : "text-muted"
                            }`}
                          >
                            {wert.belegt}/{wert.plaetze}
                          </span>
                          {/* Der Balken sitzt am unteren Rand der Zelle, damit
                              alle Balken einer Zeile auf derselben Linie
                              stehen - sonst wandert er mit der Textlänge. */}
                          <span
                            aria-hidden="true"
                            className="mt-auto block h-1 rounded-full bg-border"
                          >
                            <span
                              className="balken block h-1 rounded-full"
                              style={{ width: `${Math.max(anteil * 100, anteil > 0 ? 8 : 0)}%` }}
                            />
                          </span>
                        </>
                      )}
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
