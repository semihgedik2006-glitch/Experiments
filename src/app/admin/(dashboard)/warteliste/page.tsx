import { Hourglass, MailCheck, PhoneCall, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { wartelisteEintragLoeschen } from "@/lib/actions/admin-warteliste";
import { erreichbarkeitText } from "@/lib/erreichbarkeit";
import { formatDate } from "@/lib/format";
import { freiePlaetze } from "@/lib/kapazitaet";
import { AdminPage, AdminSection, EmptyState, StatusBadge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FilterChips } from "@/components/admin/list-nav";
import { param, type SuchParams } from "@/lib/admin-list";

/**
 * Wer auf einen belegten Termin wartet.
 *
 * Bis hierher endete eine Anfrage auf eine ausgebuchte Zeit in der
 * Meldung "leider ausgebucht" - und damit meistens im Abbruch. Dabei ist
 * das jemand, der alles ausgefüllt hat und genau weiß, wann er kann.
 *
 * Jetzt steht er hier. Wird ein Platz frei, geht die Mail automatisch
 * raus; diese Seite ist für den Fall, dass man vorher anrufen will - und
 * dafür, jemanden wieder auszutragen, der sich anders entschieden hat.
 *
 * Vergangene Termine werden nicht mehr angezeigt: Eine Warteliste für
 * gestern ist keine Aufgabe mehr.
 */

function zeitpunkt(datum: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(datum);
}

export default async function AdminWartelistePage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  // Wie überall im Adminbereich: Der Wert aus der Adresszeile zählt nur
  // für die Leitung. Eine Studioleitung sieht ihren Standort, egal was in
  // der Adresse steht.
  const erzwungenesStudio = studioEinschraenkung(admin);
  const studioFilter = erzwungenesStudio ?? param(params, "studio");

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const [studios, eintraege] = await Promise.all([
    prisma.studioLocation.findMany({
      where: erzwungenesStudio ? { id: erzwungenesStudio } : undefined,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.warteliste.findMany({
      where: {
        ...(studioFilter ? { studioId: studioFilter } : {}),
        slot: { date: { gte: heute } },
      },
      include: {
        studio: { select: { name: true } },
        slot: {
          include: {
            bookings: { where: { status: { not: "CANCELLED" } }, select: { zuZweit: true } },
          },
        },
      },
      // Nach Termin sortiert, innerhalb eines Termins in der Reihenfolge
      // des Eintragens - das ist die Reihenfolge, in der auch
      // benachrichtigt wird.
      orderBy: [
        { slot: { date: "asc" } },
        { slot: { startTime: "asc" } },
        { createdAt: "asc" },
        { id: "asc" },
      ],
    }),
  ]);

  const mehrereStudios = admin.istLeitung && studios.length > 1;

  // Nach Termin bündeln, damit die Reihenfolge sichtbar wird: Platz 1, 2,
  // 3. Einzeln untereinander sähe man nicht, wer als Nächster dran ist.
  const gruppen: {
    slotId: string;
    kopf: string;
    studioName: string | null;
    frei: number;
    eintraege: typeof eintraege;
  }[] = [];

  for (const eintrag of eintraege) {
    if (!eintrag.slot) continue;
    let gruppe = gruppen.find((g) => g.slotId === eintrag.slot!.id);
    if (!gruppe) {
      gruppe = {
        slotId: eintrag.slot.id,
        kopf: `${formatDate(eintrag.slot.date)}, ${eintrag.slot.startTime} - ${eintrag.slot.endTime} Uhr`,
        studioName: eintrag.studio?.name ?? null,
        frei: freiePlaetze(eintrag.slot.capacity, eintrag.slot.bookings),
        eintraege: [],
      };
      gruppen.push(gruppe);
    }
    gruppe.eintraege.push(eintrag);
  }

  const offen = eintraege.filter((eintrag) => !eintrag.benachrichtigtAm).length;

  return (
    <AdminPage
      title="Warteliste"
      description="Wer sich auf eine bereits belegte Zeit eingetragen hat. Wird ein Platz frei, geht die Benachrichtigung automatisch raus - der Reihe nach."
    >
      {mehrereStudios && (
        <FilterChips
          basis="/admin/warteliste"
          params={params}
          name="studio"
          optionen={[
            { wert: "", label: "Alle Studios" },
            ...studios.map((studio) => ({ wert: studio.id, label: studio.name })),
          ]}
        />
      )}

      {gruppen.length === 0 ? (
        <EmptyState icon={Hourglass} title="Niemand wartet gerade">
          {studioFilter && mehrereStudios
            ? "Für dieses Studio steht niemand auf der Warteliste - über „Alle Studios“ siehst du wieder alle."
            : "Trägt sich jemand auf eine ausgebuchte Zeit ein, steht er hier. Sobald dort ein Platz frei wird, bekommt er automatisch eine E-Mail."}
        </EmptyState>
      ) : (
        <AdminSection
          title={`${eintraege.length} ${eintraege.length === 1 ? "Eintrag" : "Einträge"}`}
          description={
            offen > 0
              ? `${offen} davon ${offen === 1 ? "wartet" : "warten"} noch auf einen freien Platz.`
              : "Alle wurden bereits benachrichtigt."
          }
          className={mehrereStudios ? "mt-6" : ""}
        >
          <div className="space-y-4">
            {gruppen.map((gruppe) => (
              <div key={gruppe.slotId} className="admin-panel p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{gruppe.kopf}</p>
                  {gruppe.frei > 0 ? (
                    <StatusBadge ton="ok">
                      {gruppe.frei} {gruppe.frei === 1 ? "Platz" : "Plätze"} frei
                    </StatusBadge>
                  ) : (
                    <StatusBadge ton="off">ausgebucht</StatusBadge>
                  )}
                </div>
                {mehrereStudios && gruppe.studioName && (
                  <p className="mt-0.5 text-sm text-muted">{gruppe.studioName}</p>
                )}

                <ol className="mt-3 space-y-3">
                  {gruppe.eintraege.map((eintrag, index) => (
                    <li
                      key={eintrag.id}
                      className="flex flex-wrap items-start justify-between gap-3 border-t border-border/60 pt-3 first:border-0 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          <span className="mr-2 text-muted tabular-nums">{index + 1}.</span>
                          {eintrag.name}
                        </p>
                        <p className="text-sm break-all text-muted">
                          {eintrag.email} &middot; {eintrag.phone}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm">
                          <PhoneCall size={13} className="shrink-0 text-accent" aria-hidden />
                          Erreichbar: {erreichbarkeitText(eintrag.erreichbarkeit)}
                        </p>
                        {eintrag.zuZweit && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-accent">
                            <Users size={13} className="shrink-0" aria-hidden />
                            Kommt zu zweit &ndash; braucht zwei Plätze
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted">
                          Eingetragen am {zeitpunkt(eintrag.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {eintrag.benachrichtigtAm ? (
                          <StatusBadge ton="ok" icon={MailCheck}>
                            benachrichtigt {zeitpunkt(eintrag.benachrichtigtAm)}
                          </StatusBadge>
                        ) : (
                          <StatusBadge ton="open">wartet</StatusBadge>
                        )}
                        <form
                          action={async () => {
                            "use server";
                            await wartelisteEintragLoeschen(eintrag.id);
                          }}
                        >
                          <ConfirmButton
                            variant="link"
                            label="Austragen"
                            question={`${eintrag.name} von der Warteliste nehmen?`}
                            confirmLabel="Ja, austragen"
                            pendingLabel="Wird ausgetragen..."
                          />
                        </form>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </AdminSection>
      )}
    </AdminPage>
  );
}
