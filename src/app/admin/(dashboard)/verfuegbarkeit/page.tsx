import { prisma } from "@/lib/prisma";
import { deleteSlot, deleteSlotTemplate } from "@/lib/actions/admin-slots";
import { SlotForm } from "@/components/admin/slot-form";
import { TemplateForm } from "@/components/admin/template-form";
import { formatDate } from "@/lib/format";

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
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Verfügbarkeit</h1>
      <p className="mt-2 text-sm text-muted">
        Wiederkehrende Termine werden automatisch für die nächsten Wochen angelegt - bis du
        sie hier löschst. Einzeltermine eignen sich für Ausnahmen.
      </p>

      <div className="mt-8">
        <h2 className="font-semibold">Wiederkehrende Termine</h2>
        <div className="mt-3">
          <TemplateForm studios={studios} />
        </div>

        <div className="mt-4 space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm"
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
                <button className="text-xs text-red-500 hover:underline">Löschen</button>
              </form>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-muted">Noch kein wiederkehrender Termin angelegt.</p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-semibold">Einzeltermin (Ausnahme)</h2>
        <div className="mt-3">
          <SlotForm studios={studios} />
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <h2 className="mb-3 font-semibold">Alle kommenden Termine</h2>
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
                  {slot.templateId && (
                    <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      wiederkehrend
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await deleteSlot(slot.id);
                    }}
                  >
                    <button className="text-xs text-red-500 hover:underline">Löschen</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {slots.length === 0 && <p className="mt-4 text-muted">Noch keine Termine angelegt.</p>}
      </div>
    </div>
  );
}
