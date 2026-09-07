import Link from "next/link";
import { CalendarCheck, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminPage, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    pendingBookings,
    unreadMessages,
    subscribers,
    publishedPosts,
    pendingComments,
    studios,
    upcomingBookings,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.newsletterSubscriber.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.comment.count({ where: { approved: false } }),
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.booking.findMany({
      where: { status: { not: "CANCELLED" }, slot: { is: { date: { gte: startOfToday } } } },
      include: { slot: { include: { studio: true } } },
      orderBy: [{ slot: { date: "asc" } }, { slot: { startTime: "asc" } }],
      take: 5,
    }),
  ]);

  // "Wartet auf mich" zuerst - das sind die Zahlen, wegen derer man hier
  // überhaupt hereinschaut.
  const cards = [
    { label: "Offene Buchungsanfragen", value: pendingBookings, href: "/admin/bookings", warten: true },
    { label: "Ungelesene Nachrichten", value: unreadMessages, href: "/admin/nachrichten", warten: true },
    { label: "Kommentare zur Freigabe", value: pendingComments, href: "/admin/kommentare", warten: true },
    { label: "Newsletter-Abonnenten", value: subscribers, href: "/admin/newsletter", warten: false },
    { label: "Veröffentlichte Blogartikel", value: publishedPosts, href: "/admin/blog", warten: false },
  ];

  return (
    <AdminPage title="Übersicht">
      <AdminStagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <AdminStaggerItem key={card.label}>
            <Link
              href={card.href}
              className={`admin-panel block p-4 transition-colors hover:border-lime ${
                card.warten && card.value > 0 ? "border-lime/50" : ""
              }`}
            >
              <p
                className={`text-2xl font-bold tabular-nums ${
                  card.warten && card.value > 0 ? "text-accent" : ""
                }`}
              >
                {card.value}
              </p>
              <p className="mt-1 text-sm text-muted">{card.label}</p>
            </Link>
          </AdminStaggerItem>
        ))}
      </AdminStagger>

      <Panel className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Nächste Termine</h2>
          <Link
            href="/admin/bookings"
            className="text-xs text-muted transition-colors hover:text-accent"
          >
            Alle Buchungen ansehen
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Aktuell stehen keine bestätigten oder offenen Termine an.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60 text-sm">
            {upcomingBookings.map(
              (booking) =>
                booking.slot && (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span>
                      <span className="font-medium">{formatDate(booking.slot.date)}</span>{" "}
                      {booking.slot.startTime} Uhr &middot; {booking.name}
                      {studios.length > 1 && (
                        <span className="text-muted"> &middot; {booking.slot.studio.name}</span>
                      )}
                    </span>
                    <StatusBadge ton={booking.status === "CONFIRMED" ? "ok" : "open"}>
                      {booking.status === "CONFIRMED" ? "Bestätigt" : "Offen"}
                    </StatusBadge>
                  </li>
                ),
            )}
          </ul>
        )}
      </Panel>

      {studios.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={CalendarClock}
            title="Noch kein Studio angelegt"
            actionHref="/admin/studios"
            actionLabel="Erstes Studio anlegen"
          >
            Ohne Studio gibt es keine Termine und keine Buchungen - das ist der erste
            Schritt.
          </EmptyState>
        </div>
      )}

      {studios.length > 0 && pendingBookings === 0 && unreadMessages === 0 && pendingComments === 0 && (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <CalendarCheck size={15} className="text-accent" />
          Nichts wartet gerade auf dich - alle Anfragen, Nachrichten und Kommentare sind
          bearbeitet.
        </p>
      )}
    </AdminPage>
  );
}
