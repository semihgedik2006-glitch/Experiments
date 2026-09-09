import { ChevronRight, ShieldAlert, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { zugangEntfernen } from "@/lib/actions/admin-team";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ZugangFormular } from "@/components/admin/zugang-formular";

export default async function AdminTeamPage() {
  const ich = await verlangeLeitung();

  const [zugaenge, studios] = await Promise.all([
    prisma.adminUser.findMany({
      include: { studio: { select: { id: true, name: true } } },
      orderBy: [{ role: "asc" }, { email: "asc" }],
    }),
    prisma.studioLocation.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const leitungen = zugaenge.filter((z) => z.role === "LEITUNG").length;

  return (
    <AdminPage
      title="Zugänge"
      description="Wer sich anmelden darf und was er sieht. Eine Studioleitung sieht nur ihren Standort - dessen Buchungen, Termine und Studiodaten."
    >
      {studios.length === 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
          Es ist noch kein Studio angelegt. Ein Zugang für eine Studioleitung braucht
          einen Standort - leg zuerst unter &bdquo;Studios&ldquo; einen an.
        </div>
      )}

      <AdminSection title="Neuen Zugang anlegen">
        <Panel className="border-lime/40">
          <ZugangFormular studios={studios} />
        </Panel>
      </AdminSection>

      <AdminSection title={`Vorhandene Zugänge (${zugaenge.length})`} className="mt-8">
        <div className="space-y-2">
          {zugaenge.map((zugang) => {
            const istIch = zugang.id === ich.id;
            const istLeitung = zugang.role === "LEITUNG";
            // Die letzte Leitung und der eigene Zugang dürfen nicht weg -
            // sonst kommt niemand mehr an diesen Bereich heran.
            const loeschbar = !istIch && !(istLeitung && leitungen <= 1);

            return (
              <details key={zugang.id} className="admin-panel group overflow-hidden">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-lime/5">
                  <ChevronRight
                    size={16}
                    aria-hidden
                    className="shrink-0 text-muted transition-transform group-open:rotate-90"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {zugang.name || zugang.email}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {zugang.name ? `${zugang.email} · ` : ""}
                      seit {formatDate(zugang.createdAt)}
                    </span>
                  </span>
                  {istIch && <StatusBadge ton="idle">das bist du</StatusBadge>}
                  <StatusBadge ton={istLeitung ? "ok" : "open"}>
                    {istLeitung ? "Leitung" : (zugang.studio?.name ?? "ohne Standort")}
                  </StatusBadge>
                </summary>

                <div className="border-t border-border p-4 sm:p-5">
                  <ZugangFormular
                    studios={studios}
                    zugang={{
                      id: zugang.id,
                      email: zugang.email,
                      name: zugang.name,
                      istLeitung,
                      studioId: zugang.studioId,
                    }}
                  />

                  <div className="mt-4 border-t border-border pt-4">
                    {loeschbar ? (
                      <form
                        action={async () => {
                          "use server";
                          await zugangEntfernen(zugang.id);
                        }}
                      >
                        <ConfirmButton
                          question={`Zugang für ${zugang.email} wirklich entfernen? Diese Person kann sich danach nicht mehr anmelden.`}
                          confirmLabel="Ja, Zugang entfernen"
                        />
                      </form>
                    ) : (
                      <p className="flex items-start gap-2 text-xs text-muted">
                        <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                        {istIch
                          ? "Den eigenen Zugang kannst du nicht entfernen."
                          : "Das ist die letzte Leitung. Lege zuerst eine weitere an."}
                      </p>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        {zugaenge.length === 0 && (
          <EmptyState icon={Users} title="Kein Zugang vorhanden">
            Das sollte nicht vorkommen - du bist gerade angemeldet.
          </EmptyState>
        )}
      </AdminSection>
    </AdminPage>
  );
}
