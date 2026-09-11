import { Gift, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { FilterChips } from "@/components/admin/list-nav";
import {
  EmpfehlungFormular,
  EmpfehlungLoeschen,
  PraemieKnopf,
  type EmpfehlungDaten,
} from "@/components/admin/empfehlung-formular";
import { formatDate } from "@/lib/format";
import { param, type SuchParams } from "@/lib/admin-list";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { STATUS_LABEL, STATUS_TON } from "@/lib/buchung-status";

/**
 * Wer wen geworben hat.
 *
 * Eine Studioleitung sieht und pflegt die Codes ihres Standorts: Sie
 * kennt die Mitglieder, und sie zahlt die Prämie aus.
 *
 * Je Code steht darunter, wer damit angefragt hat - mit Status und einem
 * Knopf "Prämie gutgeschrieben". Am einzelnen Vorgang und nicht am Code,
 * weil ein Code mehrfach wirbt und jede geworbene Person eine eigene
 * Prämie ist.
 */
export default async function AdminEmpfehlungenPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  const erzwungenesStudio = studioEinschraenkung(admin);
  const studioFilter = erzwungenesStudio ?? param(params, "studio");

  const [studios, empfehlungen] = await Promise.all([
    prisma.studioLocation.findMany({
      where: erzwungenesStudio ? { id: erzwungenesStudio } : undefined,
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.empfehlung.findMany({
      where: studioFilter ? { studioId: studioFilter } : undefined,
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei
      // Abfragen unterschiedlich anordnen.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        bookings: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            praemieGutgeschrieben: true,
          },
        },
      },
    }),
  ]);

  const offeneP = empfehlungen.reduce(
    (summe, eintrag) =>
      summe +
      eintrag.bookings.filter((b) => b.status === "CONFIRMED" && !b.praemieGutgeschrieben).length,
    0,
  );

  return (
    <AdminPage
      title="Empfehlungen"
      description={
        offeneP > 0
          ? `${offeneP} bestätigte ${offeneP === 1 ? "Empfehlung wartet" : "Empfehlungen warten"} auf eine Prämie.`
          : "Wer bei euch trainiert, bekommt einen Code und gibt ihn weiter."
      }
    >
      {/* Der rechtliche Hinweis steht oben und nicht im Kleingedruckten:
          Er beantwortet die Frage, die als Erstes kommt - "können wir das
          nicht per Mail rausschicken?". */}
      <Panel className="mb-6">
        <p className="flex items-start gap-2.5 text-sm">
          <Info size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span>
            Der Code wird <strong>vom Mitglied selbst</strong> weitergegeben -
            im Gespräch, per Nachricht, wie auch immer es ohnehin redet. Die
            Website verschickt bewusst keine „Empfiehl uns weiter“-Mails an
            Adressen, die uns niemand gegeben hat: Das wäre unerlaubte Werbung,
            und zwar auf unsere Rechnung, nicht auf die des Mitglieds.
          </span>
        </p>
      </Panel>

      {admin.istLeitung && studios.length > 1 && (
        <FilterChips
          basis="/admin/empfehlungen"
          params={params}
          name="studio"
          optionen={[
            { wert: "", label: "Alle Studios" },
            ...studios.map((studio) => ({ wert: studio.id, label: studio.name })),
          ]}
          klasse="mb-6"
        />
      )}

      <AdminSection title="Codes">
        {empfehlungen.length === 0 ? (
          <EmptyState icon={Gift} title="Noch kein Code vergeben">
            Leg für ein Mitglied einen Code an und gib ihn ihm mit. Trägt jemand
            ihn im Anfrageformular ein, erscheint die Anfrage hier - und ihr wisst,
            wem die Prämie zusteht.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {empfehlungen.map((eintrag) => {
              const daten: EmpfehlungDaten = eintrag;
              const bestaetigt = eintrag.bookings.filter((b) => b.status === "CONFIRMED").length;

              return (
                <Panel key={eintrag.id}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{eintrag.name}</span>
                      <code className="rounded bg-lime/12 px-2 py-0.5 text-sm font-semibold text-accent">
                        {eintrag.code}
                      </code>
                      <span className="text-sm text-muted">
                        {eintrag.bookings.length === 0
                          ? "noch niemand geworben"
                          : `${eintrag.bookings.length} geworben, davon ${bestaetigt} bestätigt`}
                      </span>
                      {!eintrag.aktiv && <StatusBadge ton="off">gilt nicht mehr</StatusBadge>}
                    </span>
                    <EmpfehlungLoeschen id={eintrag.id} name={eintrag.name} />
                  </div>

                  {eintrag.bookings.length > 0 && (
                    <div className="mb-4 overflow-x-auto rounded-lg border border-border">
                      <table className="w-full min-w-[30rem] text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="px-3 py-2 font-medium">Geworben</th>
                            <th className="px-3 py-2 font-medium">Angefragt am</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                            <th className="px-3 py-2 font-medium">Prämie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eintrag.bookings.map((buchung) => (
                            <tr key={buchung.id} className="border-b border-border/60 last:border-0">
                              <td className="px-3 py-2">{buchung.name}</td>
                              <td className="px-3 py-2 text-muted">
                                {formatDate(buchung.createdAt)}
                              </td>
                              <td className="px-3 py-2">
                                <StatusBadge ton={STATUS_TON[buchung.status]}>
                                  {STATUS_LABEL[buchung.status]}
                                </StatusBadge>
                              </td>
                              <td className="px-3 py-2">
                                {/* Der Knopf erscheint erst bei einer
                                    bestätigten Anfrage: Eine Prämie für
                                    jemanden, der nie da war, ist keine. */}
                                {buchung.status === "CONFIRMED" ? (
                                  <span className="flex flex-wrap items-center gap-2">
                                    {buchung.praemieGutgeschrieben && (
                                      <StatusBadge ton="ok">gutgeschrieben</StatusBadge>
                                    )}
                                    <PraemieKnopf
                                      bookingId={buchung.id}
                                      gutgeschrieben={buchung.praemieGutgeschrieben}
                                    />
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted">
                                    erst nach der Bestätigung
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <EmpfehlungFormular
                    studioId={eintrag.studioId}
                    eintrag={daten}
                    studios={studios}
                    istLeitung={admin.istLeitung}
                  />
                </Panel>
              );
            })}
          </div>
        )}
      </AdminSection>

      <AdminSection title="Neuer Code" className="mt-8">
        <Panel highlight>
          <EmpfehlungFormular
            studioId={studioFilter || studios[0]?.id || null}
            studios={studios}
            istLeitung={admin.istLeitung}
          />
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
