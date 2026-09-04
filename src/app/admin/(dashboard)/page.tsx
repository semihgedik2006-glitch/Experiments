import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";

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

  const cards = [
    { label: "Offene Buchungsanfragen", value: pendingBookings, href: "/admin/bookings" },
    { label: "Ungelesene Nachrichten", value: unreadMessages, href: "/admin/nachrichten" },
    { label: "Kommentare zur Freigabe", value: pendingComments, href: "/admin/kommentare" },
    { label: "Newsletter-Abonnenten", value: subscribers, href: "/admin/newsletter" },
    { label: "Veröffentlichte Blogartikel", value: publishedPosts, href: "/admin/blog" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Übersicht</h1>
      <AdminStagger className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <AdminStaggerItem key={card.label}>
            <Link
              href={card.href}
              className="block rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-lime hover:shadow-lg hover:shadow-lime/5"
            >
              <p className="text-3xl font-black">{card.value}</p>
              <p className="mt-2 text-sm text-muted">{card.label}</p>
            </Link>
          </AdminStaggerItem>
        ))}
      </AdminStagger>

      <AdminStagger className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Nächste Termine</h2>
          <Link href="/admin/bookings" className="text-xs text-muted transition-colors hover:text-accent">
            Alle Buchungen ansehen
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Aktuell stehen keine bestätigten oder offenen Termine an.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcomingBookings.map((booking) => booking.slot && (
              <AdminStaggerItem key={booking.id}>
                <li className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-sm last:border-0 last:pb-0">
                  <span>
                    <span className="font-medium">{formatDate(booking.slot.date)}</span>{" "}
                    {booking.slot.startTime} Uhr &middot; {booking.name}
                    {studios.length > 1 && (
                      <span className="text-muted"> &middot; {booking.slot.studio.name}</span>
                    )}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      booking.status === "CONFIRMED" ? "bg-lime/15 text-accent" : "bg-yellow-500/15 text-yellow-500"
                    }`}
                  >
                    {booking.status === "CONFIRMED" ? "Bestätigt" : "Offen"}
                  </span>
                </li>
              </AdminStaggerItem>
            ))}
          </ul>
        )}
      </AdminStagger>
    </div>
  );
}
