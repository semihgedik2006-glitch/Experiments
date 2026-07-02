import { prisma } from "@/lib/prisma";
import { deleteSlot } from "@/lib/actions/admin-slots";
import { SlotForm } from "@/components/admin/slot-form";
import { formatDate } from "@/lib/format";

export default async function AdminSlotsPage() {
  const slots = await prisma.availabilitySlot.findMany({
    include: { bookings: { where: { status: { not: "CANCELLED" } } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Verfügbarkeit</h1>
      <p className="mt-2 text-sm text-muted">
        Lege Zeitfenster für Probetermine an, die auf der Buchungsseite auswählbar sind.
      </p>

      <div className="mt-6">
        <SlotForm />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="py-2 pr-4">Datum</th>
              <th className="py-2 pr-4">Uhrzeit</th>
              <th className="py-2 pr-4">Belegung</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id} className="border-b border-border/60">
                <td className="py-3 pr-4">{formatDate(slot.date)}</td>
                <td className="py-3 pr-4">
                  {slot.startTime} - {slot.endTime}
                </td>
                <td className="py-3 pr-4">
                  {slot.bookings.length} / {slot.capacity}
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
