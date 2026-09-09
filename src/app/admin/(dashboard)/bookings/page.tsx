import { prisma } from "@/lib/prisma";
import { notizSpeichern, updateBookingStatus } from "@/lib/actions/admin-bookings";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CalendarCheck, Download, SearchX } from "lucide-react";
import { AdminPage, EmptyState, StatusBadge, adminInput } from "@/components/admin/ui";
import { SearchBox } from "@/components/admin/search-box";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, param, seitenZahl, suchFilter, type SuchParams } from "@/lib/admin-list";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingStatus } from "@/generated/prisma/enums";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";

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

const gueltigeStatus = ["PENDING", "CONFIRMED", "CANCELLED"] as const;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  // Eine Studioleitung sieht nur den eigenen Standort. Der Wert aus der
  // Adresszeile wird dabei nicht berücksichtigt - sonst genügte
  // ?studio=... um in einen fremden Standort zu sehen.
  const nurStudio = studioEinschraenkung(admin);
  const studioFilter = nurStudio ?? param(params, "studio");
  const begriff = param(params, "q");
  const statusRoh = param(params, "status");
  // Nur bekannte Werte durchlassen - sonst ergibt ?status=XYZ eine leere
  // Liste, ohne dass erkennbar wäre warum.
  const status = (gueltigeStatus as readonly string[]).includes(statusRoh)
    ? (statusRoh as BookingStatus)
    : "";
  const seite = seitenZahl(params);

  const where: Prisma.BookingWhereInput = {
    ...(studioFilter ? { slot: { is: { studioId: studioFilter } } } : {}),
    ...(status ? { status } : {}),
    ...(suchFilter(begriff, ["name", "email", "phone", "message"]) ?? {}),
  };

  // Die Zahlen für die Filterreihe zählen innerhalb der übrigen Auswahl -
  // steht die Suche auf "Meier", zeigt "Offen 2" die offenen Anfragen von
  // Meier, nicht alle offenen überhaupt.
  const ohneStatus: Prisma.BookingWhereInput = { ...where };
  delete ohneStatus.status;

  const [studios, gesamt, bookings, zaehler] = await Promise.all([
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: { slot: { include: { studio: true } } },
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei Abfragen
      // unterschiedlich anordnen. Beim Blättern kann dann ein Eintrag auf
      // beiden Seiten stehen und ein anderer gar nicht.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
    }),
    prisma.booking.groupBy({ by: ["status"], where: ohneStatus, _count: true }),
  ]);

  const anzahl = (s: BookingStatus) =>
    zaehler.find((eintrag) => eintrag.status === s)?._count ?? 0;
  const alle = zaehler.reduce((summe, eintrag) => summe + eintrag._count, 0);

  const gefiltert = Boolean(begriff || status || (admin.istLeitung && studioFilter));

  return (
    <AdminPage
      title="Buchungsanfragen"
      action={
        <a
          href="/api/admin/tabelle/buchungen"
          download
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-lime"
        >
          <Download size={14} aria-hidden />
          Als Tabelle
        </a>
      }
      description={
        anzahl("PENDING") > 0
          ? `${anzahl("PENDING")} ${anzahl("PENDING") === 1 ? "Anfrage wartet" : "Anfragen warten"} auf eine Antwort.`
          : "Keine offene Anfrage."
      }
    >
      <div className="space-y-3">
        <SearchBox platzhalter="Name, E-Mail, Telefon oder Nachricht" klasse="max-w-md" />

        <FilterChips
          basis="/admin/bookings"
          params={params}
          name="status"
          optionen={[
            { wert: "", label: "Alle", anzahl: alle },
            { wert: "PENDING", label: "Offen", anzahl: anzahl("PENDING") },
            { wert: "CONFIRMED", label: "Bestätigt", anzahl: anzahl("CONFIRMED") },
            { wert: "CANCELLED", label: "Storniert", anzahl: anzahl("CANCELLED") },
          ]}
        />

        {/* Die Auswahl entfällt für eine Studioleitung - es gibt nichts
            zu wählen. */}
        {admin.istLeitung && studios.length > 1 && (
          <FilterChips
            basis="/admin/bookings"
            params={params}
            name="studio"
            optionen={[
              { wert: "", label: "Alle Studios" },
              ...studios.map((studio) => ({ wert: studio.id, label: studio.name })),
            ]}
          />
        )}
      </div>

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
                    icon="termin"
                    question={`Anfrage von ${booking.name} ablehnen? Es geht dabei keine E-Mail raus - bitte selbst absagen.`}
                    confirmLabel="Ja, ablehnen"
                    pendingLabel="Wird abgelehnt..."
                  />
                </form>
              </div>
            )}

            {/* Interner Vermerk - nur hier sichtbar, nie in einer E-Mail.
                Bewusst offen statt hinter einem Knopf: Ein Vermerk, den man
                erst aufklappen muss, wird beim Durchsehen übersehen. */}
            <AdminForm action={notizSpeichern} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={booking.id} />
              <label className="min-w-48 flex-1">
                <span className="text-xs text-muted">Interner Vermerk</span>
                <input
                  type="text"
                  name="internalNote"
                  defaultValue={booking.internalNote ?? ""}
                  maxLength={500}
                  placeholder="z.B. ruft morgen zurück"
                  className={`${adminInput} mt-1`}
                />
              </label>
              <SubmitButton pendingLabel="Wird gespeichert...">Notiz sichern</SubmitButton>
            </AdminForm>

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
                    icon="termin"
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

      {bookings.length > 0 && (
        <Pagination
          basis="/admin/bookings"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Anfragen"
        />
      )}

      {bookings.length === 0 && (
        <div className="mt-6">
          {gefiltert ? (
            <EmptyState icon={SearchX} title="Keine Anfrage passt zu dieser Auswahl">
              {begriff
                ? `Zu „${begriff}“ wurde nichts gefunden. Gesucht wird in Name, E-Mail, Telefonnummer und Nachricht.`
                : "Für die gewählten Filter liegt nichts vor - setz sie über „Alle“ zurück."}
            </EmptyState>
          ) : (
            <EmptyState icon={CalendarCheck} title="Noch keine Buchungsanfragen">
              Was über die Probetermin-Seite gebucht wird, landet hier. Bestätigen
              verschickt eine E-Mail an den Gast.
            </EmptyState>
          )}
        </div>
      )}
    </AdminPage>
  );
}
