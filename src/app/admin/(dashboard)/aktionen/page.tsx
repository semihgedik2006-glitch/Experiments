import { ChevronRight, Info, Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { aktionEntfernen } from "@/lib/actions/admin-aktionen";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AktionFormular } from "@/components/admin/aktion-formular";

/**
 * Aktionscodes.
 *
 * Der Zweck ist nicht der Rabatt, sondern die Zuordnung: Ein eigener Code
 * je Anzeige beantwortet die Frage, welche Anzeige tatsächlich Anfragen
 * gebracht hat - nicht Klicks, nicht Reichweite, sondern Anfragen mit
 * Namen und Telefonnummer.
 */

function zustand(aktion: {
  active: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
}): { ton: "ok" | "open" | "off"; text: string } {
  if (!aktion.active) return { ton: "off", text: "inaktiv" };

  const jetzt = new Date();
  if (aktion.validFrom && jetzt < aktion.validFrom) {
    return { ton: "open", text: `ab ${formatDate(aktion.validFrom)}` };
  }
  if (aktion.validUntil) {
    const ende = new Date(aktion.validUntil);
    ende.setHours(23, 59, 59, 999);
    if (jetzt > ende) return { ton: "off", text: "abgelaufen" };
    return { ton: "ok", text: `bis ${formatDate(aktion.validUntil)}` };
  }
  return { ton: "ok", text: "gültig" };
}

export default async function AdminAktionenPage() {
  await verlangeLeitung();

  const aktionen = await prisma.promotion.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }, { id: "desc" }],
  });

  return (
    <AdminPage
      title="Aktionscodes"
      description="Ein eigener Code je Anzeige oder Flyer. Wer ihn im Anfrageformular eingibt, macht die Anfrage der Anzeige zurechenbar."
    >
      <AdminSection title="Neue Aktion anlegen">
        <Panel highlight>
          <AktionFormular />
        </Panel>
      </AdminSection>

      <AdminSection title={`Vorhandene Aktionen (${aktionen.length})`} className="mt-8">
        <div className="space-y-2">
          {aktionen.map((aktion) => {
            const marke = zustand(aktion);
            const anfragen = aktion._count.bookings;

            return (
              <details key={aktion.id} className="admin-panel group overflow-hidden">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-lime/5">
                  <ChevronRight
                    size={16}
                    aria-hidden
                    className="shrink-0 text-muted transition-transform group-open:rotate-90"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{aktion.code}</span>
                    <span className="block truncate text-xs text-muted">{aktion.label}</span>
                  </span>
                  <span className="text-sm tabular-nums">
                    {anfragen} {anfragen === 1 ? "Anfrage" : "Anfragen"}
                  </span>
                  <StatusBadge ton={marke.ton}>{marke.text}</StatusBadge>
                </summary>

                <div className="border-t border-border p-4 sm:p-5">
                  <AktionFormular
                    aktion={{
                      id: aktion.id,
                      code: aktion.code,
                      label: aktion.label,
                      benefit: aktion.benefit,
                      active: aktion.active,
                      validFrom: aktion.validFrom,
                      validUntil: aktion.validUntil,
                    }}
                  />

                  <div className="mt-4 border-t border-border pt-4">
                    {anfragen === 0 ? (
                      <form
                        action={async () => {
                          "use server";
                          await aktionEntfernen(aktion.id);
                        }}
                      >
                        <ConfirmButton
                          question={`Aktion „${aktion.code}“ wirklich entfernen?`}
                          confirmLabel="Ja, entfernen"
                        />
                      </form>
                    ) : (
                      // Löschen würde die Antwort auf die Frage mitnehmen,
                      // wegen der es den Code gibt.
                      <p className="flex items-start gap-2 text-xs text-muted">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        An dieser Aktion hängen {anfragen}{" "}
                        {anfragen === 1 ? "Anfrage" : "Anfragen"}. Zum Beenden nimm den
                        Haken bei &bdquo;Code ist gültig&ldquo; heraus - dann bleibt die
                        Zahl erhalten.
                      </p>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        {aktionen.length === 0 && (
          <EmptyState icon={Ticket} title="Noch keine Aktion angelegt">
            Leg für jede Anzeige einen eigenen Code an - etwa WOCHENSPIEGEL30 und
            INSTA30 für dieselbe Aktion in zwei Kanälen. Dann steht am Monatsende
            in der Auswertung, welcher der beiden die Anfragen gebracht hat.
          </EmptyState>
        )}
      </AdminSection>
    </AdminPage>
  );
}
