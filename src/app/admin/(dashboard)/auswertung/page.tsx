import { BarChart3, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { letzteWochen, wocheVon } from "@/lib/auswertung";
import { AdminPage, AdminSection, EmptyState, Panel } from "@/components/admin/ui";
import { Kennzahl, Rangbalken, Wochenbalken } from "@/components/admin/balken";
import { FilterChips } from "@/components/admin/list-nav";
import { param, type SuchParams } from "@/lib/admin-list";

/**
 * Auswertung: Wie viele Anfragen kommen, wann und wo.
 *
 * Bewusst nur Anfragen und ihr Ausgang - nicht Umsatz, nicht Besucher.
 * Das sind die Zahlen, die diese Website selbst erzeugt und deshalb auch
 * belegen kann.
 *
 * Eine Studioleitung sieht ihren Standort, die Leitung alle. Der Vergleich
 * zwischen Standorten bleibt damit bei der Leitung - das ist keine
 * technische Notwendigkeit, sondern dieselbe Linie wie überall sonst.
 */

/**
 * Der Markenname steht vor jedem der vierzehn Standorte und unterscheidet
 * damit keinen von einem anderen - er kostet nur die Breite, die der
 * eigentliche Ort bräuchte. Die Überschrift sagt ohnehin schon, wessen
 * Standorte hier stehen. Heißt ein Standort einmal anders, bleibt sein
 * Name unangetastet.
 */
function ohneMarke(name: string): string {
  return name.replace(/^Körperformen\s+/, "");
}

const ZEITRAEUME = [
  { wert: "8", wochen: 8, label: "8 Wochen" },
  { wert: "12", wochen: 12, label: "12 Wochen" },
  { wert: "26", wochen: 26, label: "26 Wochen" },
] as const;

export default async function AdminAuswertungPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  const gewaehlt =
    ZEITRAEUME.find((z) => z.wert === param(params, "zeitraum")) ?? ZEITRAEUME[1];
  const wochen = letzteWochen(gewaehlt.wochen);

  const nurStudio = studioEinschraenkung(admin);

  const [anfragen, studios] = await Promise.all([
    prisma.booking.findMany({
      where: {
        createdAt: { gte: wochen[0].von },
        ...(nurStudio ? { slot: { is: { studioId: nurStudio } } } : {}),
      },
      // Nur, was gezählt wird. Namen und Telefonnummern haben in einer
      // Auswertung nichts zu suchen.
      select: { createdAt: true, status: true, slot: { select: { studioId: true } } },
    }),
    prisma.studioLocation.findMany({
      where: nurStudio ? { id: nurStudio } : undefined,
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const proWoche = wochen.map(() => 0);
  const proStudio = new Map<string, number>();
  const proStudioWoche = new Map<string, number[]>();
  let ohneStandort = 0;
  let bestaetigt = 0;
  let offen = 0;

  for (const anfrage of anfragen) {
    const index = wocheVon(anfrage.createdAt, wochen);
    if (index >= 0) proWoche[index] += 1;

    if (anfrage.status === "CONFIRMED") bestaetigt += 1;
    if (anfrage.status === "PENDING") offen += 1;

    // Eine Anfrage ohne festen Termin hängt an keinem Standort - sie ist
    // über das Formular ohne Terminauswahl gekommen. Sie zählt in die
    // Wochen, aber nicht auf ein Studio.
    const studioId = anfrage.slot?.studioId;
    if (!studioId) {
      ohneStandort += 1;
      continue;
    }

    proStudio.set(studioId, (proStudio.get(studioId) ?? 0) + 1);
    if (index >= 0) {
      const reihe = proStudioWoche.get(studioId) ?? wochen.map(() => 0);
      reihe[index] += 1;
      proStudioWoche.set(studioId, reihe);
    }
  }

  const gesamt = anfragen.length;
  const schnitt = gesamt / wochen.length;
  const anteilBestaetigt = gesamt > 0 ? Math.round((bestaetigt / gesamt) * 100) : 0;

  const rangliste = [
    ...studios.map((studio) => ({
      schluessel: studio.id,
      name: ohneMarke(studio.name),
      wert: proStudio.get(studio.id) ?? 0,
    })),
    // Am Ende und gedämpft: Das ist kein Standort, sondern eine Restmenge.
    ...(admin.istLeitung && ohneStandort > 0
      ? [{ schluessel: "ohne", name: "ohne festen Termin", wert: ohneStandort, matt: true }]
      : []),
  ].sort((a, b) => b.wert - a.wert);

  // Die Kurzdaten enden schon auf einen Punkt ("13.9."). Ein Satzpunkt
  // dahinter ergäbe "13.9.." - deshalb steht am Ende keiner.
  const zeitraumText = `${wochen[0].zeitraum.split(" - ")[0]} bis ${wochen[wochen.length - 1].zeitraum.split(" - ")[1]}`;

  return (
    <AdminPage
      title="Auswertung"
      description={
        admin.studioName
          ? `Anfragen für ${admin.studioName}, ${zeitraumText}`
          : `Anfragen über alle Standorte, ${zeitraumText}`
      }
    >
      <FilterChips
        basis="/admin/auswertung"
        params={params}
        name="zeitraum"
        optionen={ZEITRAEUME.map((z) => ({ wert: z.wert, label: z.label }))}
      />

      {gesamt === 0 ? (
        <div className="mt-6">
          <EmptyState icon={BarChart3} title="In diesem Zeitraum kam keine Anfrage">
            Sobald über die Probetermin-Seite gebucht wird, entsteht hier die
            Verlaufskurve. Für einen längeren Zeitraum oben umschalten.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kennzahl wert={gesamt} label="Anfragen" hinweis={`in ${wochen.length} Wochen`} />
            <Kennzahl
              wert={schnitt.toFixed(1).replace(".", ",")}
              label="je Woche"
              hinweis="Durchschnitt im Zeitraum"
            />
            <Kennzahl
              wert={bestaetigt}
              label="bestätigt"
              hinweis={`${anteilBestaetigt} % der Anfragen`}
            />
            <Kennzahl
              wert={offen}
              label="noch offen"
              hinweis={offen > 0 ? "wartet auf eine Antwort" : "nichts liegen geblieben"}
            />
          </div>

          <AdminSection
            title="Anfragen je Kalenderwoche"
            description="Die laufende Woche ganz rechts ist noch nicht voll - sie liegt fast immer niedriger als die davor."
            className="mt-8"
          >
            <Panel>
              <Wochenbalken wochen={wochen.map((w, i) => ({ ...w, wert: proWoche[i] }))} />
              <p aria-hidden="true" className="mt-2 text-center text-[10px] text-muted">
                Kalenderwoche
              </p>

              <details className="mt-4 border-t border-border pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-foreground">
                  Zahlen dazu
                </summary>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted">
                        <th scope="col" className="py-1.5 pr-4 font-medium">Woche</th>
                        <th scope="col" className="py-1.5 pr-4 font-medium">Zeitraum</th>
                        <th scope="col" className="py-1.5 text-right font-medium">Anfragen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wochen.map((woche, i) => (
                        <tr key={`${woche.kw}-${woche.zeitraum}`} className="border-b border-border/50">
                          <th scope="row" className="py-1.5 pr-4 text-left font-normal">
                            KW {woche.kw}
                          </th>
                          <td className="py-1.5 pr-4 text-muted">{woche.zeitraum}</td>
                          <td className="py-1.5 text-right tabular-nums">{proWoche[i]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </Panel>
          </AdminSection>

          {admin.istLeitung && rangliste.length > 0 && (
            <AdminSection title="Anfragen je Standort" className="mt-8">
              <Panel>
                <Rangbalken
                  beschriftung={`Anfragen je Standort, ${zeitraumText}`}
                  eintraege={rangliste}
                />

                {ohneStandort > 0 && (
                  <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-xs text-muted">
                    <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
                    {ohneStandort === 1
                      ? "Eine Anfrage kam ohne Auswahl eines festen Termins herein und lässt sich deshalb keinem Standort zuordnen."
                      : `${ohneStandort} Anfragen kamen ohne Auswahl eines festen Termins herein und lassen sich deshalb keinem Standort zuordnen.`}{" "}
                    Wer sie annimmt, entscheidet ihr beim Zurückrufen.
                  </p>
                )}

                {studios.length > 1 && (
                  <details className="mt-4 border-t border-border pt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-foreground">
                      Woche für Woche je Standort
                    </summary>
                    {/* Vierzehn Standorte über zwölf Wochen sind vierzehn
                        Linien in einem Bild - das liest niemand. Als Tabelle
                        stehen dieselben Zahlen da, wo man sie nachschlagen
                        kann. */}
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs text-muted">
                            <th scope="col" className="py-1.5 pr-3 text-left font-medium">
                              Standort
                            </th>
                            {wochen.map((woche) => (
                              <th
                                key={`${woche.kw}-${woche.zeitraum}`}
                                scope="col"
                                title={woche.zeitraum}
                                className="px-1.5 py-1.5 text-right font-medium tabular-nums"
                              >
                                {woche.kw}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {studios.map((studio) => {
                            const reihe = proStudioWoche.get(studio.id) ?? wochen.map(() => 0);
                            return (
                              <tr key={studio.id} className="border-b border-border/50">
                                <th
                                  scope="row"
                                  className="py-1.5 pr-3 text-left font-normal whitespace-nowrap"
                                >
                                  {ohneMarke(studio.name)}
                                </th>
                                {reihe.map((wert, i) => (
                                  <td
                                    key={wochen[i].kw + wochen[i].zeitraum}
                                    className={`px-1.5 py-1.5 text-right tabular-nums ${
                                      wert === 0 ? "text-muted" : ""
                                    }`}
                                  >
                                    {wert}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </Panel>
            </AdminSection>
          )}
        </>
      )}
    </AdminPage>
  );
}
