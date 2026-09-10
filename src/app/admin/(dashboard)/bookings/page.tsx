import { prisma } from "@/lib/prisma";
import { notizSpeichern, updateBookingStatus } from "@/lib/actions/admin-bookings";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CalendarCheck, Download, PhoneCall, SearchX, Ticket, Users } from "lucide-react";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";
import { zielText } from "@/lib/ziel";
import { AdminPage, EmptyState, StatusBadge, adminInput } from "@/components/admin/ui";
import { SearchBox } from "@/components/admin/search-box";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, param, seitenZahl, suchFilter, type SuchParams } from "@/lib/admin-list";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingStatus } from "@/generated/prisma/enums";
import { STATUS_LABEL, STATUS_TON, statusAusText } from "@/lib/buchung-status";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { AntwortKnopf } from "@/components/admin/antwort-knopf";

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
  const status = statusAusText(param(params, "status"));
  const seite = seitenZahl(params);

  const where: Prisma.BookingWhereInput = {
    // Der Standort steht seit der Umstellung direkt an der Anfrage, nicht
    // mehr nur am Termin. Anfragen ohne feste Zeit sind damit ebenfalls
    // einem Studio zugeordnet - vorher sah sie nur die Leitung.
    ...(studioFilter ? { studioId: studioFilter } : {}),
    ...(status ? { status } : {}),
    ...(suchFilter(begriff, ["name", "email", "phone", "message", "terminWunsch"]) ?? {}),
  };

  // Die Zahlen für die Filterreihe zählen innerhalb der übrigen Auswahl -
  // steht die Suche auf "Meier", zeigt "Offen 2" die offenen Anfragen von
  // Meier, nicht alle offenen überhaupt.
  const ohneStatus: Prisma.BookingWhereInput = { ...where };
  delete ohneStatus.status;

  const [studios, gesamt, bookings, zaehler, vorlagen] = await Promise.all([
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        slot: true,
        studio: { select: { name: true } },
        promotion: { select: { code: true, label: true } },
      },
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei Abfragen
      // unterschiedlich anordnen. Beim Blättern kann dann ein Eintrag auf
      // beiden Seiten stehen und ein anderer gar nicht.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
    }),
    prisma.booking.groupBy({ by: ["status"], where: ohneStatus, _count: true }),
    // Nur die eingeschalteten, und nur die Felder, die der Knopf braucht.
    prisma.antwortvorlage.findMany({
      where: { aktiv: true },
      select: { id: true, titel: true, betreff: true, text: true },
      orderBy: [{ sortOrder: "asc" }, { titel: "asc" }],
    }),
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
                {/* Direkt unter der Telefonnummer: Wer anruft, liest hier
                    ab, ob jetzt der richtige Zeitpunkt dafür ist. */}
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <PhoneCall size={13} className="shrink-0 text-accent" aria-hidden />
                  Erreichbar: {erreichbarkeitText(booking.erreichbarkeit)}
                </p>
                <p className="mt-2 text-sm">
                  {booking.slot ? (
                    <>
                      Termin: {formatDate(booking.slot.date)} um {booking.slot.startTime} Uhr
                    </>
                  ) : (
                    <span className="text-muted">Kein bestimmter Termin - individuell abzustimmen</span>
                  )}
                  {studios.length > 1 && booking.studio && (
                    <span className="text-muted"> &middot; {booking.studio.name}</span>
                  )}
                </p>
                {/* Zu zweit ist eine Angabe über Plätze, nicht über
                    Vorlieben: Zwei Personen brauchen zwei Geräte und zwei
                    Westen. Wer das erst an der Tür erfährt, muss jemanden
                    wegschicken. */}
                {booking.zuZweit && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-accent">
                    <Users size={13} className="shrink-0" aria-hidden />
                    Kommt zu zweit &ndash; zwei Plätze
                  </p>
                )}
                {/* Das Ziel entscheidet, worüber im ersten Gespräch
                    geredet wird - deshalb steht es weit oben und nicht
                    unten bei der Nachricht. */}
                {booking.ziel && (
                  <p className="mt-1 text-sm">
                    <span className="text-muted">Ziel: </span>
                    {zielText(booking.ziel)}
                  </p>
                )}
                {/* Die Wunschzeit wird nicht mehr abgefragt. An älteren
                    Anfragen steht dort echter Text - der bleibt sichtbar,
                    solange es diese Anfragen gibt. */}
                {booking.terminWunsch && (
                  <p className="mt-1 text-sm">
                    <span className="text-muted">Wunsch: </span>
                    {booking.terminWunsch}
                  </p>
                )}
                {booking.message && (
                  <p className="mt-2 text-sm text-muted">„{booking.message}“</p>
                )}

                {/* Herkunft: nur, wenn etwas davon bekannt ist. Eine Zeile
                    mit lauter "nicht bekannt" wäre reiner Platzverbrauch. */}
                {(booking.promotion ||
                  booking.herkunftKampagne ||
                  booking.herkunftQuelle ||
                  booking.herkunftSeite) && (
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    {booking.promotion && (
                      <span className="inline-flex items-center gap-1 font-semibold text-accent">
                        <Ticket size={12} aria-hidden />
                        {booking.promotion.code}
                        <span className="font-normal text-muted">
                          ({booking.promotion.label})
                        </span>
                      </span>
                    )}
                    {booking.herkunftKampagne && <span>Kampagne: {booking.herkunftKampagne}</span>}
                    {booking.herkunftQuelle && <span>über {booking.herkunftQuelle}</span>}
                    {booking.herkunftSeite && <span>von {booking.herkunftSeite}</span>}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <StatusBadge ton={STATUS_TON[booking.status]}>
                  {STATUS_LABEL[booking.status]}
                </StatusBadge>
                {/* Antworten auch hier: Nicht jede Anfrage wird am Telefon
                    erledigt, und wer dreimal nicht drangeht, bekommt sonst
                    gar nichts. */}
                <AntwortKnopf
                  email={booking.email}
                  vorlagen={vorlagen}
                  werte={{
                    name: booking.name,
                    studio: booking.studio?.name ?? null,
                    termin: booking.slot
                      ? `${formatDate(booking.slot.date)} um ${booking.slot.startTime} Uhr`
                      : null,
                  }}
                />
              </div>
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
                ? `Zu „${begriff}“ wurde nichts gefunden. Gesucht wird in Name, E-Mail, Telefonnummer, Terminwunsch und Nachricht.`
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
