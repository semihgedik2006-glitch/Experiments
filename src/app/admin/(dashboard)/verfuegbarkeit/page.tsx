import { prisma } from "@/lib/prisma";
import { deleteSlot, deleteSlotTemplate } from "@/lib/actions/admin-slots";
import { SlotForm } from "@/components/admin/slot-form";
import { TemplateForm } from "@/components/admin/template-form";
import { formatDate } from "@/lib/format";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { CalendarClock } from "lucide-react";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { WochenAnsicht, type WochenSlot } from "@/components/admin/wochen-ansicht";
import { PRO_SEITE, param, seitenZahl, type SuchParams } from "@/lib/admin-list";
import { montagAusText, tagePlus } from "@/lib/woche";
import { belegtePlaetze } from "@/lib/kapazitaet";
import type { Prisma } from "@/generated/prisma/client";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";

const weekdayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export default async function AdminSlotsPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  // Siehe Buchungen: Der Wert aus der Adresszeile zählt nur für die Leitung.
  const erzwungenesStudio = studioEinschraenkung(admin);
  const studioFilter = erzwungenesStudio ?? param(params, "studio");
  const alsListe = param(params, "ansicht") === "liste";
  const seite = seitenZahl(params);
  const montag = montagAusText(param(params, "woche"));

  const nurStudio = studioFilter ? { studioId: studioFilter } : {};

  // Die Wochenansicht zeigt genau eine Woche - dafür wird auch nur diese
  // geladen. Die Liste zeigt weiterhin alles ab heute, seitenweise.
  const wochenWhere: Prisma.AvailabilitySlotWhereInput = {
    ...nurStudio,
    date: { gte: montag, lt: tagePlus(montag, 7) },
  };
  const listenWhere: Prisma.AvailabilitySlotWhereInput = {
    ...nurStudio,
    date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  };

  const [studios, templates, wochenSlots, listenAnzahl, listenSlots] = await Promise.all([
    // Auch die Auswahlliste in den Formularen darf nur enthalten, was
    // dieser Zugang sehen darf - sonst stünden dort die Namen aller
    // vierzehn Standorte, und man könnte einen fremden auswählen. Die
    // Aktion würde das zwar abweisen, aber die Liste selbst verrät schon
    // zu viel.
    prisma.studioLocation.findMany({
      where: erzwungenesStudio ? { id: erzwungenesStudio } : undefined,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.slotTemplate.findMany({
      where: studioFilter ? { studioId: studioFilter } : undefined,
      include: { studio: true },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }),
    prisma.availabilitySlot.findMany({
      where: wochenWhere,
      include: { bookings: { where: { status: { not: "CANCELLED" } } }, studio: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }, { id: "asc" }],
    }),
    alsListe ? prisma.availabilitySlot.count({ where: listenWhere }) : Promise.resolve(0),
    alsListe
      ? prisma.availabilitySlot.findMany({
          where: listenWhere,
          include: { bookings: { where: { status: { not: "CANCELLED" } } }, studio: true },
          // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
          // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei
          // Abfragen unterschiedlich anordnen.
          orderBy: [{ date: "asc" }, { startTime: "asc" }, { id: "asc" }],
          take: PRO_SEITE,
          skip: (seite - 1) * PRO_SEITE,
        })
      : Promise.resolve([]),
  ]);

  const wochenDaten: WochenSlot[] = wochenSlots.map((slot) => ({
    id: slot.id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    // Plätze, nicht Buchungen: Eine Anfrage "wir kommen zu zweit" belegt
    // zwei. Vorher stand hier 1/2 belegt, während der Termin tatsächlich
    // voll war.
    belegt: belegtePlaetze(slot.bookings),
    buchungen: slot.bookings.length,
    templateId: slot.templateId,
    studioName: slot.studio.name,
  }));

  const mehrereStudios = admin.istLeitung && studios.length > 1;

  return (
    <AdminPage
      title="Verfügbarkeit"
      description={
        <>
          Wiederkehrende Termine werden automatisch für die nächsten Wochen angelegt -
          bis du sie hier löschst. Einzeltermine eignen sich für Ausnahmen.
        </>
      }
    >
      <div className="space-y-3">
        {admin.istLeitung && studios.length > 1 && (
          <FilterChips
            basis="/admin/verfuegbarkeit"
            params={params}
            name="studio"
            optionen={[
              { wert: "", label: "Alle Studios" },
              ...studios.map((studio) => ({ wert: studio.id, label: studio.name })),
            ]}
          />
        )}

        <FilterChips
          basis="/admin/verfuegbarkeit"
          params={params}
          name="ansicht"
          optionen={[
            { wert: "", label: "Wochenansicht" },
            { wert: "liste", label: "Alle kommenden Termine" },
          ]}
        />
      </div>

      <div className="mt-6">
        {alsListe ? (
          <AdminSection title="Alle kommenden Termine">
            {/* Auf dem Handy als Kartenliste, ab Tablet als Tabelle. Eine
                sechsspaltige Tabelle auf 360 Pixeln lässt sich nur noch
                seitlich wegschieben - und der Löschknopf steht dabei
                außerhalb des Bildes. */}
            {listenSlots.length > 0 && (
              <div className="space-y-2 sm:hidden">
                {listenSlots.map((slot) => (
                  <div key={slot.id} className="admin-panel p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{formatDate(slot.date)}</span>
                      {slot.templateId && <StatusBadge ton="idle">wiederkehrend</StatusBadge>}
                    </div>
                    <p className="mt-1 text-muted">
                      {slot.startTime} - {slot.endTime} Uhr &middot; belegt{" "}
                      {belegtePlaetze(slot.bookings)} von {slot.capacity}
                      {mehrereStudios && <> &middot; {slot.studio.name}</>}
                    </p>
                    <form
                      action={async () => {
                        "use server";
                        await deleteSlot(slot.id);
                      }}
                      className="mt-2"
                    >
                      <ConfirmButton
                        variant="link"
                        question={
                          slot.bookings.length > 0
                            ? `Termin mit ${slot.bookings.length} Buchung${slot.bookings.length === 1 ? "" : "en"} löschen?`
                            : "Diesen Termin löschen?"
                        }
                      />
                    </form>
                  </div>
                ))}
              </div>
            )}

            {listenSlots.length > 0 && (
              <Panel className="hidden overflow-x-auto sm:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      {mehrereStudios && <th className="py-2 pr-4">Studio</th>}
                      <th className="py-2 pr-4">Datum</th>
                      <th className="py-2 pr-4">Uhrzeit</th>
                      <th className="py-2 pr-4">Belegung</th>
                      <th className="py-2 pr-4" />
                      <th className="py-2 pr-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {listenSlots.map((slot) => (
                      <tr key={slot.id} className="border-b border-border/60">
                        {mehrereStudios && <td className="py-3 pr-4">{slot.studio.name}</td>}
                        <td className="py-3 pr-4">{formatDate(slot.date)}</td>
                        <td className="py-3 pr-4">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="py-3 pr-4">
                          {belegtePlaetze(slot.bookings)} / {slot.capacity}
                        </td>
                        <td className="py-3 pr-4">
                          {slot.templateId && <StatusBadge ton="idle">wiederkehrend</StatusBadge>}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <form
                            action={async () => {
                              "use server";
                              await deleteSlot(slot.id);
                            }}
                          >
                            <ConfirmButton
                              variant="link"
                              question={
                                slot.bookings.length > 0
                                  ? `Termin mit ${slot.bookings.length} Buchung${slot.bookings.length === 1 ? "" : "en"} löschen?`
                                  : "Diesen Termin löschen?"
                              }
                            />
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            )}

            {listenSlots.length > 0 && (
              <Pagination
                basis="/admin/verfuegbarkeit"
                params={params}
                seite={seite}
                proSeite={PRO_SEITE}
                gesamt={listenAnzahl}
                einheit="Termine"
              />
            )}

            {listenSlots.length === 0 && (
              <EmptyState icon={CalendarClock} title="Keine Termine für die kommenden Tage">
                {studioFilter
                  ? "Für dieses Studio steht nichts an - über „Alle Studios“ siehst du wieder alle."
                  : "Ohne freie Termine kann auf der Probetermin-Seite niemand eine Uhrzeit auswählen - die Anfrage kommt dann ohne festen Termin herein. Leg unten eine wiederkehrende Zeit an, dann füllen sich die nächsten Wochen von selbst."}
              </EmptyState>
            )}
          </AdminSection>
        ) : (
          <>
            {/* Ohne Filter stapeln sich bei vierzehn Standorten alle Termine
                in denselben sieben Spalten - dann sieht man gerade das nicht
                mehr, wofür die Ansicht da ist. */}
            {mehrereStudios && !studioFilter && (
              <p className="mb-3 text-sm text-muted">
                Die Woche zeigt gerade alle Studios übereinander. Für Lücken und
                Dopplungen eines einzelnen Standorts oben ein Studio auswählen.
              </p>
            )}
            <WochenAnsicht
              basis="/admin/verfuegbarkeit"
              params={params}
              montag={montag}
              slots={wochenDaten}
              mehrereStudios={mehrereStudios}
            />
          </>
        )}
      </div>

      <AdminSection title="Wiederkehrende Termine" className="mt-10">
        <TemplateForm studios={studios} />

        <div className="mt-4 space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="admin-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span>
                <span className="font-medium">Jeden {weekdayNames[template.weekday]}</span>{" "}
                {template.startTime} - {template.endTime} Uhr
                {mehrereStudios && <span className="text-muted"> &middot; {template.studio.name}</span>}
                <span className="text-muted"> &middot; Kapazität {template.capacity}</span>
              </span>
              <form
                action={async () => {
                  "use server";
                  await deleteSlotTemplate(template.id);
                }}
              >
                {/* Löschen zieht die daraus erzeugten künftigen Termine mit,
                    soweit sie unbelegt sind (deleteUnbookedFutureSlotsForTemplate).
                    Bereits gebuchte bleiben stehen - das steht so in der
                    Rückfrage, damit niemand von Absagen ausgeht. */}
                <ConfirmButton
                  variant="link"
                  question="Löschen? Künftige unbelegte Termine dieser Reihe verschwinden mit, bereits gebuchte bleiben bestehen."
                  confirmLabel="Ja, löschen"
                />
              </form>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-muted">
              {studioFilter
                ? "Für dieses Studio ist kein wiederkehrender Termin angelegt."
                : "Noch kein wiederkehrender Termin angelegt."}
            </p>
          )}
        </div>
      </AdminSection>

      <AdminSection title="Einzeltermin (Ausnahme)" className="mt-8">
        <SlotForm studios={studios} />
      </AdminSection>
    </AdminPage>
  );
}
