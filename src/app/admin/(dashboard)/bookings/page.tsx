import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateBookingStatus } from "@/lib/actions/admin-bookings";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CalendarX } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "Offen",
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-500",
  CONFIRMED: "bg-lime/15 text-accent",
  CANCELLED: "bg-red-500/15 text-red-500",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ studio?: string }>;
}) {
  const { studio: studioFilter } = await searchParams;

  const [studios, bookings] = await Promise.all([
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.booking.findMany({
      where: studioFilter ? { slot: { is: { studioId: studioFilter } } } : undefined,
      include: { slot: { include: { studio: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Buchungsanfragen</h1>

      {studios.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/bookings"
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
              !studioFilter ? "border-lime bg-lime/10" : "border-border hover:border-lime/60"
            }`}
          >
            Alle Studios
          </Link>
          {studios.map((studio) => (
            <Link
              key={studio.id}
              href={`/admin/bookings?studio=${studio.id}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
                studioFilter === studio.id
                  ? "border-lime bg-lime/10"
                  : "border-border hover:border-lime/60"
              }`}
            >
              {studio.name}
            </Link>
          ))}
        </div>
      )}

      <AdminStagger className="mt-8 space-y-4">
        {bookings.length === 0 && <p className="text-muted">Noch keine Buchungen vorhanden.</p>}

        {bookings.map((booking) => (
          <AdminStaggerItem key={booking.id}>
          <div className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-lime/40">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{booking.name}</p>
                <p className="text-sm text-muted">
                  {booking.email} &middot; {booking.phone}
                </p>
                <p className="mt-2 text-sm">
                  {booking.slot ? (
                    <>
                      Termin: {formatDate(booking.slot.date)} um {booking.slot.startTime} Uhr
                      {studios.length > 1 && (
                        <span className="text-muted"> &middot; {booking.slot.studio.name}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted">Kein bestimmter Termin - individuell abzustimmen</span>
                  )}
                </p>
                {booking.message && (
                  <p className="mt-2 text-sm text-muted">„{booking.message}“</p>
                )}
              </div>

              <span
                className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[booking.status]}`}
              >
                {statusLabels[booking.status]}
              </span>
            </div>

            {booking.status === "PENDING" && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <form
                  action={async () => {
                    "use server";
                    await updateBookingStatus(booking.id, "CONFIRMED");
                  }}
                >
                  {/* Bestätigen verschickt eine E-Mail an den Gast - dabei
                      darf der Knopf nicht mehrfach auslösen. */}
                  <SubmitButton
                    variant="primary"
                    className="!px-4 !py-2 !text-xs"
                    pendingLabel="Wird bestätigt..."
                    savedLabel="Bestätigt"
                  >
                    Bestätigen
                  </SubmitButton>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await updateBookingStatus(booking.id, "CANCELLED");
                  }}
                >
                  {/* Absagen verschicken derzeit keine E-Mail (siehe
                      updateBookingStatus) - der Hinweis sagt das offen, damit
                      niemand davon ausgeht, der Gast sei informiert. */}
                  <ConfirmButton
                    label="Ablehnen"
                    icon={CalendarX}
                    question={`Anfrage von ${booking.name} ablehnen? Es geht dabei keine E-Mail raus - bitte selbst absagen.`}
                    confirmLabel="Ja, ablehnen"
                    pendingLabel="Wird abgelehnt..."
                  />
                </form>
              </div>
            )}

            {booking.status === "CONFIRMED" && (
              <div className="mt-4">
                <form
                  action={async () => {
                    "use server";
                    await updateBookingStatus(booking.id, "CANCELLED");
                  }}
                >
                  <ConfirmButton
                    label="Stornieren"
                    icon={CalendarX}
                    question={`Bestätigten Termin von ${booking.name} stornieren? Der Platz wird wieder frei, eine Absage-E-Mail geht nicht automatisch raus.`}
                    confirmLabel="Ja, stornieren"
                    pendingLabel="Wird storniert..."
                  />
                </form>
              </div>
            )}
          </div>
          </AdminStaggerItem>
        ))}
      </AdminStagger>
    </div>
  );
}
