import { prisma } from "@/lib/prisma";
import { deleteSlot, deleteSlotTemplate } from "@/lib/actions/admin-slots";
import { SlotForm } from "@/components/admin/slot-form";
import { TemplateForm } from "@/components/admin/template-form";
import { formatDate } from "@/lib/format";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { CalendarClock } from "lucide-react";

const weekdayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export default async function AdminSlotsPage() {
  const [studios, templates, slots] = await Promise.all([
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.slotTemplate.findMany({
      include: { studio: true },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }),
    prisma.availabilitySlot.findMany({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      include: { bookings: { where: { status: { not: "CANCELLED" } } }, studio: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

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
      <AdminSection title="Wiederkehrende Termine">
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
                {studios.length > 1 && <span className="text-muted"> &middot; {template.studio.name}</span>}
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
            <p className="text-sm text-muted">Noch kein wiederkehrender Termin angelegt.</p>
          )}
        </div>
      </AdminSection>

      <AdminSection title="Einzeltermin (Ausnahme)" className="mt-8">
        <SlotForm studios={studios} />
      </AdminSection>

      <AdminSection title="Alle kommenden Termine" className="mt-8">
        {/* Auf dem Handy als Kartenliste, ab Tablet als Tabelle. Eine
            sechsspaltige Tabelle auf 360 Pixeln lässt sich nur noch seitlich
            wegschieben - und der Löschknopf steht dabei außerhalb des Bildes. */}
        {slots.length > 0 && (
        <div className="space-y-2 sm:hidden">
          {slots.map((slot) => (
            <div key={slot.id} className="admin-panel p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{formatDate(slot.date)}</span>
                {slot.templateId && <StatusBadge ton="idle">wiederkehrend</StatusBadge>}
              </div>
              <p className="mt-1 text-muted">
                {slot.startTime} - {slot.endTime} Uhr &middot; belegt {slot.bookings.length} von{" "}
                {slot.capacity}
                {studios.length > 1 && <> &middot; {slot.studio.name}</>}
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

        {slots.length > 0 && (
        <Panel className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              {studios.length > 1 && <th className="py-2 pr-4">Studio</th>}
              <th className="py-2 pr-4">Datum</th>
              <th className="py-2 pr-4">Uhrzeit</th>
              <th className="py-2 pr-4">Belegung</th>
              <th className="py-2 pr-4" />
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id} className="border-b border-border/60">
                {studios.length > 1 && <td className="py-3 pr-4">{slot.studio.name}</td>}
                <td className="py-3 pr-4">{formatDate(slot.date)}</td>
                <td className="py-3 pr-4">
                  {slot.startTime} - {slot.endTime}
                </td>
                <td className="py-3 pr-4">
                  {slot.bookings.length} / {slot.capacity}
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

        {slots.length === 0 && (
          <EmptyState icon={CalendarClock} title="Noch keine Termine für die kommenden Tage">
            Ohne freie Termine kann auf der Probetermin-Seite niemand eine Uhrzeit
            auswählen - die Anfrage kommt dann ohne festen Termin herein. Leg oben eine
            wiederkehrende Zeit an, dann füllen sich die nächsten Wochen von selbst.
          </EmptyState>
        )}
      </AdminSection>
    </AdminPage>
  );
}
