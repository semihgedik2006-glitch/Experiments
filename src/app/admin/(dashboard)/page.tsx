import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [pendingBookings, unreadMessages, subscribers, publishedPosts] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.newsletterSubscriber.count(),
    prisma.blogPost.count({ where: { published: true } }),
  ]);

  const cards = [
    { label: "Offene Buchungsanfragen", value: pendingBookings, href: "/admin/bookings" },
    { label: "Ungelesene Nachrichten", value: unreadMessages, href: "/admin/nachrichten" },
    { label: "Newsletter-Abonnenten", value: subscribers, href: "/admin/newsletter" },
    { label: "Veröffentlichte Blogartikel", value: publishedPosts, href: "/admin/blog" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Übersicht</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-lime"
          >
            <p className="text-3xl font-black">{card.value}</p>
            <p className="mt-2 text-sm text-muted">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
