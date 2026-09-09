import Link from "next/link";
import { CalendarCheck, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { TrendKarte } from "@/components/admin/trend";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";

export default async function AdminDashboardPage() {
  const admin = await verlangeAdmin();
  const nurStudio = studioEinschraenkung(admin);

  // Alle Zahlen dieser Seite gelten für den Bereich, den dieser Zugang
  // sehen darf. Eine Studioleitung soll nicht an der Übersicht ablesen
  // können, wie viele Anfragen die anderen dreizehn Standorte hatten.
  const buchungBereich = nurStudio ? { slot: { is: { studioId: nurStudio } } } : {};

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Zwei gleich lange Zeiträume: die letzten sieben Tage und die sieben
  // davor. Sieben Tage, damit der Vergleich nicht am Wochentag hängt -
  // montags und samstags kommen unterschiedlich viele Anfragen.
  const jetzt = new Date();
  const vorEinerWoche = new Date(jetzt.getTime() - 7 * 24 * 60 * 60 * 1000);
  const vorZweiWochen = new Date(jetzt.getTime() - 14 * 24 * 60 * 60 * 1000);

  const letzteWoche = { gte: vorEinerWoche };
  const vorwoche = { gte: vorZweiWochen, lt: vorEinerWoche };

  const [
    pendingBookings,
    unreadMessages,
    pendingComments,
    studios,
    upcomingBookings,
    buchungenJetzt,
    buchungenVorher,
    nachrichtenJetzt,
    nachrichtenVorher,
    abosJetzt,
    abosVorher,
    kommentareJetzt,
    kommentareVorher,
  ] = await Promise.all([
    prisma.booking.count({ where: { ...buchungBereich, status: "PENDING" } }),
    // Nachrichten und Kommentare haben keinen Standortbezug - sie
    // gehören zur Marke und zählen deshalb nur für die Leitung.
    admin.istLeitung ? prisma.contactMessage.count({ where: { read: false } }) : Promise.resolve(0),
    admin.istLeitung ? prisma.comment.count({ where: { approved: false } }) : Promise.resolve(0),
    prisma.studioLocation.findMany({
      where: nurStudio ? { id: nurStudio } : undefined,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        status: { not: "CANCELLED" },
        slot: { is: { date: { gte: startOfToday }, ...(nurStudio ? { studioId: nurStudio } : {}) } },
      },
      include: { slot: { include: { studio: true } } },
      orderBy: [{ slot: { date: "asc" } }, { slot: { startTime: "asc" } }, { id: "asc" }],
      take: 5,
    }),
    prisma.booking.count({ where: { ...buchungBereich, createdAt: letzteWoche } }),
    prisma.booking.count({ where: { ...buchungBereich, createdAt: vorwoche } }),
    admin.istLeitung ? prisma.contactMessage.count({ where: { createdAt: letzteWoche } }) : Promise.resolve(0),
    admin.istLeitung ? prisma.contactMessage.count({ where: { createdAt: vorwoche } }) : Promise.resolve(0),
    admin.istLeitung ? prisma.newsletterSubscriber.count({ where: { createdAt: letzteWoche } }) : Promise.resolve(0),
    admin.istLeitung ? prisma.newsletterSubscriber.count({ where: { createdAt: vorwoche } }) : Promise.resolve(0),
    admin.istLeitung ? prisma.comment.count({ where: { createdAt: letzteWoche } }) : Promise.resolve(0),
    admin.istLeitung ? prisma.comment.count({ where: { createdAt: vorwoche } }) : Promise.resolve(0),
  ]);

  const wartet = [
    { label: "Offene Buchungsanfragen", value: pendingBookings, href: "/admin/bookings?status=PENDING" },
    ...(admin.istLeitung
      ? [
          { label: "Ungelesene Nachrichten", value: unreadMessages, href: "/admin/nachrichten?gelesen=neu" },
          { label: "Kommentare zur Freigabe", value: pendingComments, href: "/admin/kommentare?freigabe=offen" },
        ]
      : []),
  ];
  const nichtsOffen = wartet.every((eintrag) => eintrag.value === 0);

  return (
    <AdminPage
      title="Übersicht"
      description={admin.studioName ? `Alle Zahlen gelten für ${admin.studioName}.` : undefined}
    >
      <AdminSection
        title="Wartet auf dich"
        description={
          nichtsOffen
            ? "Nichts offen - alle Anfragen, Nachrichten und Kommentare sind bearbeitet."
            : "Diese Punkte sind noch nicht bearbeitet."
        }
      >
        <AdminStagger className={`grid gap-3 ${wartet.length > 1 ? "sm:grid-cols-3" : ""}`}>
          {wartet.map((karte) => (
            <AdminStaggerItem key={karte.label}>
              <Link
                href={karte.href}
                className={`admin-panel block p-4 transition-colors hover:border-lime ${
                  karte.value > 0 ? "border-lime/50" : ""
                }`}
              >
                <p
                  className={`text-2xl font-bold tabular-nums ${karte.value > 0 ? "text-accent" : "text-muted"}`}
                >
                  {karte.value}
                </p>
                <p className="mt-1 text-sm text-muted">{karte.label}</p>
              </Link>
            </AdminStaggerItem>
          ))}
        </AdminStagger>
      </AdminSection>

      <AdminSection
        title="Entwicklung"
        description="Die letzten sieben Tage im Vergleich zu den sieben davor."
        className="mt-8"
      >
        <AdminStagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStaggerItem>
            <TrendKarte
              label="Buchungsanfragen"
              jetzt={buchungenJetzt}
              vorher={buchungenVorher}
              einheit="Anfragen"
              href="/admin/bookings"
            />
          </AdminStaggerItem>
          {admin.istLeitung && (
          <AdminStaggerItem>
            <TrendKarte
              label="Kontaktnachrichten"
              jetzt={nachrichtenJetzt}
              vorher={nachrichtenVorher}
              einheit="Nachrichten"
              href="/admin/nachrichten"
            />
          </AdminStaggerItem>
          )}
          {admin.istLeitung && (
          <AdminStaggerItem>
            <TrendKarte
              label="Newsletter-Anmeldungen"
              jetzt={abosJetzt}
              vorher={abosVorher}
              einheit="Anmeldungen"
              href="/admin/newsletter"
            />
          </AdminStaggerItem>
          )}
          {admin.istLeitung && (
          <AdminStaggerItem>
            <TrendKarte
              label="Blog-Kommentare"
              jetzt={kommentareJetzt}
              vorher={kommentareVorher}
              einheit="Kommentare"
              href="/admin/kommentare"
            />
          </AdminStaggerItem>
          )}
        </AdminStagger>
      </AdminSection>

      <AdminSection title="Nächste Termine" className="mt-8">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">Die fünf nächsten bestätigten und offenen Termine.</p>
            <Link
              href="/admin/verfuegbarkeit"
              className="text-xs text-muted transition-colors hover:text-accent"
            >
              Zur Wochenansicht
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
      </AdminSection>

      {studios.length === 0 && (
        <div className="mt-8">
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

      {studios.length > 0 && nichtsOffen && (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          <CalendarCheck size={15} className="text-accent" />
          Alles abgearbeitet.
        </p>
      )}
    </AdminPage>
  );
}
