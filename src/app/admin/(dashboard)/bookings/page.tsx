import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateBookingStatus } from "@/lib/actions/admin-bookings";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CalendarCheck, CalendarX } from "lucide-react";
import { AdminPage, EmptyState, StatusBadge } from "@/components/admin/ui";

const statusLabels: Record<string, string> = {
  PENDING: "Offen",
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
};

// Zuordnung Status -> Statusfarbe. Die Töne selbst stehen in globals.css,
// damit "offen" im Adminbereich überall gleich aussieht.
const statusTon = {
  PENDING: "open",
  CONFIRMED: "ok",
  CANCELLED: "off",
} as const;

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

  const offen = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <AdminPage
      title="Buchungsanfragen"
      description={
        offen > 0
          ? `${offen} ${offen === 1 ? "Anfrage wartet" : "Anfragen warten"} auf eine Antwort.`
          : "Keine offene Anfrage."
      }
    >
      {studios.length > 1 && (
        <div className="flex flex-wrap gap-2">
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

      <AdminStagger className="mt-6 space-y-3">
        {bookings.map((booking) => (
          <AdminStaggerItem key={booking.id}>
          <div className="admin-panel p-4 transition-colors hover:border-lime/40 sm:p-5">
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

              <StatusBadge ton={statusTon[booking.status]}>
                {statusLabels[booking.status]}
              </StatusBadge>
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

      {bookings.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={CalendarCheck}
            title={studioFilter ? "Keine Anfragen für dieses Studio" : "Noch keine Buchungsanfragen"}
          >
            {studioFilter
              ? "Für den gewählten Standort liegt nichts vor - über „Alle Studios“ siehst du wieder alle."
              : "Was über die Probetermin-Seite gebucht wird, landet hier. Bestätigen verschickt eine E-Mail an den Gast."}
          </EmptyState>
        </div>
      )}
    </AdminPage>
  );
}
