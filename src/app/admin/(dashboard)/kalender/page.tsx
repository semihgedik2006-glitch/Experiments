import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/ui";
import { FilterChips } from "@/components/admin/list-nav";
import {
  KalenderMonat,
  KalenderNav,
  KalenderTag,
  KalenderWoche,
  type TagesSlot,
} from "@/components/admin/kalender-ansichten";
import { mitParams, param, type SuchParams } from "@/lib/admin-list";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { belegtePlaetze } from "@/lib/kapazitaet";
import {
  belegungSammeln,
  modusAusText,
  studioTagSchluessel,
  type Belegung,
} from "@/lib/kalender";
import {
  datumAusText,
  monatePlus,
  monatsAnfang,
  monatsGitter,
  monatsTitel,
  montagDerWoche,
  tagePlus,
  tagesSchluessel,
  vollerTag,
  wochenTage,
  wochenTitel,
} from "@/lib/woche";

const BASIS = "/admin/kalender";

/**
 * Der Kalender über alle Standorte - Tag, Woche, Monat.
 *
 * Was die drei Ansichten jeweils beantworten, steht in src/lib/kalender.ts.
 *
 * Alle drei stehen in der Adresse: ?modus=woche&datum=2026-09-07&studio=...
 * Damit lässt sich ein bestimmter Tag weiterschicken, der Zurück-Knopf tut
 * das Erwartete, und die Seite bleibt eine Server-Komponente - geladen wird
 * nur der Zeitraum, der gerade angezeigt wird, und nicht der ganze Monat,
 * während man einen Tag ansieht.
 *
 * Ein Datum in der Adresse ist immer der Ankertag: In der Wochenansicht
 * zeigt es die Woche, in der es liegt, in der Monatsansicht den Monat. So
 * bleibt beim Umschalten der Ansicht der Zeitraum erhalten, statt auf heute
 * zurückzuspringen.
 */
export default async function AdminKalenderPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  // Wie überall im Adminbereich: Eine Studioleitung sieht ihren Standort.
  // Der Wert aus der Adresszeile zählt nur für die Leitung - sonst genügte
  // ?studio=..., um in einen fremden Standort zu sehen.
  const erzwungenesStudio = studioEinschraenkung(admin);
  const studioFilter = erzwungenesStudio ?? param(params, "studio");

  const modus = modusAusText(param(params, "modus"));
  const datum = datumAusText(param(params, "datum"));

  const montag = montagDerWoche(datum);
  const monatsErster = monatsAnfang(datum);
  const gitter = monatsGitter(datum);

  // Geladen wird genau der sichtbare Zeitraum. Beim Monat gehören die
  // angeschnittenen Randwochen dazu - sie stehen im Gitter und sollen dort
  // nicht grundlos leer aussehen.
  const von = modus === "tag" ? datum : modus === "woche" ? montag : gitter[0];
  const bis =
    modus === "tag"
      ? tagePlus(datum, 1)
      : modus === "woche"
        ? tagePlus(montag, 7)
        : tagePlus(gitter[gitter.length - 1], 1);

  const zeitraum = {
    ...(studioFilter ? { studioId: studioFilter } : {}),
    date: { gte: von, lt: bis },
  };

  const [studios, tagesSlots, uebersichtsSlots, ohneZeit] = await Promise.all([
    prisma.studioLocation.findMany({
      where: erzwungenesStudio ? { id: erzwungenesStudio } : undefined,
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),

    // Die Tagesansicht braucht Namen und Telefonnummern, die beiden anderen
    // nur Zahlen. Deshalb zwei Abfragen statt einer großen: Einen ganzen
    // Monat samt aller Gästedaten zu laden, um daraus 30 Zahlen zu bilden,
    // wäre die teuerste Art, eine Übersicht zu bauen.
    modus === "tag"
      ? prisma.availabilitySlot.findMany({
          where: zeitraum,
          select: {
            id: true,
            startTime: true,
            endTime: true,
            capacity: true,
            studio: { select: { name: true } },
            bookings: {
              // Abgesagte belegen keinen Platz und stehen deshalb auch nicht
              // in der Liste - wer sie sucht, findet sie unter Buchungen.
              where: { status: { not: "CANCELLED" } },
              select: { id: true, name: true, phone: true, status: true, zuZweit: true },
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            },
          },
          // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
          // Datenbank Einträge mit gleicher Startzeit zwischen zwei Aufrufen
          // unterschiedlich anordnen.
          orderBy: [{ startTime: "asc" }, { id: "asc" }],
        })
      : Promise.resolve([]),

    modus === "tag"
      ? Promise.resolve([])
      : prisma.availabilitySlot.findMany({
          where: zeitraum,
          select: {
            studioId: true,
            date: true,
            capacity: true,
            bookings: {
              where: { status: { not: "CANCELLED" } },
              select: { zuZweit: true },
            },
          },
        }),

    // Anfragen ohne feste Zeit tauchen in keinem Kalender auf - sie haben
    // keine. Sie stillschweigend wegzulassen wäre die gefährlichere
    // Variante: Der Kalender sähe leer aus, während jemand auf Rückruf
    // wartet.
    prisma.booking.count({
      where: {
        ...(studioFilter ? { studioId: studioFilter } : {}),
        slotId: null,
        status: "PENDING",
      },
    }),
  ]);

  // Zeilen der Wochenansicht: Hat die Leitung einen Standort ausgewählt,
  // bleibt genau dieser übrig.
  const zeilen = studioFilter ? studios.filter((studio) => studio.id === studioFilter) : studios;

  const tagesDaten: TagesSlot[] = tagesSlots.map((slot) => ({
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    belegt: belegtePlaetze(slot.bookings),
    studioName: slot.studio.name,
    gaeste: slot.bookings,
  }));

  const wochenBelegung: Map<string, Belegung> = belegungSammeln(uebersichtsSlots, (slot) =>
    studioTagSchluessel(slot.studioId, slot.date),
  );
  const monatsBelegung: Map<string, Belegung> = belegungSammeln(uebersichtsSlots, (slot) =>
    tagesSchluessel(slot.date),
  );

  // Für die Blätter-Schaltflächen: je Ansicht ein Schritt.
  const nav = {
    tag: {
      titel: vollerTag(datum),
      zurueck: tagePlus(datum, -1),
      vor: tagePlus(datum, 1),
      zurueckLabel: "Tag zurück",
      vorLabel: "Tag vor",
      heuteLabel: "Heute",
    },
    woche: {
      titel: wochenTitel(montag),
      zurueck: tagePlus(montag, -7),
      vor: tagePlus(montag, 7),
      zurueckLabel: "Woche zurück",
      vorLabel: "Woche vor",
      heuteLabel: "Diese Woche",
    },
    monat: {
      titel: monatsTitel(monatsErster),
      zurueck: monatePlus(monatsErster, -1),
      vor: monatePlus(monatsErster, 1),
      zurueckLabel: "Monat zurück",
      vorLabel: "Monat vor",
      heuteLabel: "Dieser Monat",
    },
  }[modus];

  return (
    <AdminPage
      title="Kalender"
      description="Termine aller Standorte an einem Ort - der Tag zum Danebenlegen, die Woche für die Auslastung, der Monat für den Überblick."
    >
      <div className="space-y-3">
        {admin.istLeitung && studios.length > 1 && (
          <FilterChips
            basis={BASIS}
            params={params}
            name="studio"
            optionen={[
              { wert: "", label: "Alle Studios" },
              ...studios.map((studio) => ({ wert: studio.id, label: studio.name })),
            ]}
          />
        )}

        <FilterChips
          basis={BASIS}
          params={params}
          name="modus"
          optionen={[
            { wert: "", label: "Tag" },
            { wert: "woche", label: "Woche" },
            { wert: "monat", label: "Monat" },
          ]}
        />
      </div>

      <div className="mt-6">
        {/* „Heute“ löscht das Datum aus der Adresse, statt das heutige
            einzutragen: Ein Lesezeichen auf diese Seite soll morgen morgen
            zeigen und nicht den Tag, an dem es angelegt wurde. */}
        <KalenderNav
          titel={nav.titel}
          zurueckHref={mitParams(BASIS, params, { datum: tagesSchluessel(nav.zurueck) })}
          zurueckLabel={nav.zurueckLabel}
          vorHref={mitParams(BASIS, params, { datum: tagesSchluessel(nav.vor) })}
          vorLabel={nav.vorLabel}
          heuteHref={mitParams(BASIS, params, { datum: undefined })}
          heuteLabel={nav.heuteLabel}
        />

        {modus === "tag" && <KalenderTag tag={datum} slots={tagesDaten} />}
        {modus === "woche" && (
          <KalenderWoche
            basis={BASIS}
            params={params}
            tage={wochenTage(montag)}
            studios={zeilen}
            belegung={wochenBelegung}
          />
        )}
        {modus === "monat" && (
          <KalenderMonat
            basis={BASIS}
            params={params}
            monat={monatsErster}
            tage={gitter}
            belegung={monatsBelegung}
          />
        )}

        {ohneZeit > 0 && (
          <p className="mt-4 text-xs text-muted">
            {ohneZeit === 1
              ? "Eine offene Anfrage hat keine feste Zeit und steht deshalb in keinem Kalender."
              : `${ohneZeit} offene Anfragen haben keine feste Zeit und stehen deshalb in keinem Kalender.`}{" "}
            <Link
              href={`/admin/bookings?status=PENDING${
                admin.istLeitung && studioFilter ? `&studio=${studioFilter}` : ""
              }`}
              className="text-accent underline underline-offset-2"
            >
              Bei den Buchungen ansehen
            </Link>
          </p>
        )}
      </div>
    </AdminPage>
  );
}
