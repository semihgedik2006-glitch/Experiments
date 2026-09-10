import { BarChart3, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { letzteWochen, wocheVon } from "@/lib/auswertung";
import { ERREICHBARKEITEN } from "@/lib/erreichbarkeit";
import { ZIELE } from "@/lib/ziel";
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
        ...(nurStudio ? { studioId: nurStudio } : {}),
      },
      // Nur, was gezählt wird. Namen und Telefonnummern haben in einer
      // Auswertung nichts zu suchen.
      select: {
        createdAt: true,
        status: true,
        studioId: true,
        erreichbarkeit: true,
        ziel: true,
        herkunftSeite: true,
        herkunftKampagne: true,
        herkunftQuelle: true,
        promotion: { select: { code: true, label: true } },
      },
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
  const proErreichbarkeit = new Map<string, number>();
  const proZiel = new Map<string, number>();
  const proQuelle = new Map<string, number>();
  const proAktion = new Map<string, number>();
  let ohneStandort = 0;
  let ohneErreichbarkeit = 0;
  let ohneZiel = 0;
  let bestaetigt = 0;
  let offen = 0;

  for (const anfrage of anfragen) {
    const index = wocheVon(anfrage.createdAt, wochen);
    if (index >= 0) proWoche[index] += 1;

    if (anfrage.status === "CONFIRMED") bestaetigt += 1;
    if (anfrage.status === "PENDING") offen += 1;

    if (anfrage.erreichbarkeit) {
      proErreichbarkeit.set(
        anfrage.erreichbarkeit,
        (proErreichbarkeit.get(anfrage.erreichbarkeit) ?? 0) + 1,
      );
    } else {
      // Anfragen aus der Zeit vor dem Pflichtfeld. Sie werden mitgezählt
      // und ausgewiesen, statt stillschweigend zu fehlen - sonst sähe die
      // Verteilung genauer aus, als sie ist.
      ohneErreichbarkeit += 1;
    }

    // Das Ziel ist freiwillig - "nicht angegeben" ist deshalb keine Lücke,
    // sondern ein gültiges Ergebnis und wird als solches ausgewiesen.
    if (anfrage.ziel) {
      proZiel.set(anfrage.ziel, (proZiel.get(anfrage.ziel) ?? 0) + 1);
    } else {
      ohneZiel += 1;
    }

    // Woher jemand kam. Vorrang hat, was ihr selbst benannt habt: der
    // Aktionscode, dann die Kampagnenkennung aus der beworbenen Adresse,
    // dann die verweisende Seite. Sonst wüsste man bei einer Anzeige mit
    // eigenem Code nur, dass jemand "über instagram.com" kam - und nicht,
    // welche der drei Anzeigen es war.
    const quelle = anfrage.promotion
      ? `Code ${anfrage.promotion.code}`
      : anfrage.herkunftKampagne
        ? `Kampagne ${anfrage.herkunftKampagne}`
        : (anfrage.herkunftQuelle ?? "nicht bekannt");
    proQuelle.set(quelle, (proQuelle.get(quelle) ?? 0) + 1);

    if (anfrage.promotion) {
      const name = `${anfrage.promotion.code} - ${anfrage.promotion.label}`;
      proAktion.set(name, (proAktion.get(name) ?? 0) + 1);
    }

    // Ohne Standort sind nur noch Anfragen von vor der Umstellung: Seither
    // wird der oben gewählte Standort mitgeschickt, auch ohne feste Zeit.
    const studioId = anfrage.studioId;
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

  // Bewusst NICHT nach Größe sortiert: Vormittag, Mittag, Nachmittag und
  // Abend sind eine Reihenfolge. Nach Menge umgestellt verlöre die
  // Darstellung genau die Information, wegen der man sie ansieht - nämlich
  // zu welcher Tageszeit die Leute ans Telefon gehen.
  const erreichbarkeiten = [
    ...ERREICHBARKEITEN.map((option) => ({
      schluessel: option.wert,
      name: option.spanne ? `${option.kurz} (${option.spanne})` : option.kurz,
      wert: proErreichbarkeit.get(option.wert) ?? 0,
    })),
    ...(ohneErreichbarkeit > 0
      ? [{ schluessel: "ohne", name: "nicht angegeben", wert: ohneErreichbarkeit, matt: true }]
      : []),
  ];

  // Hier ist die Reihenfolge NICHT vorgegeben - anders als bei den
  // Tageszeiten gibt es unter den Zielen keine natürliche Abfolge. Deshalb
  // nach Menge sortiert: Die Frage lautet "womit kommen die Leute zu uns",
  // und darauf antwortet eine Rangfolge.
  const ziele = [
    ...ZIELE.map((option) => ({
      schluessel: option.wert,
      name: option.label,
      wert: proZiel.get(option.wert) ?? 0,
    })).sort((a, b) => b.wert - a.wert),
    ...(ohneZiel > 0
      ? [{ schluessel: "ohne", name: "nicht angegeben", wert: ohneZiel, matt: true }]
      : []),
  ];

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
      ? [{ schluessel: "ohne", name: "ohne Standort", wert: ohneStandort, matt: true }]
      : []),
  ].sort((a, b) => b.wert - a.wert);

  // Die Kurzdaten enden schon auf einen Punkt ("13.9."). Ein Satzpunkt
  // dahinter ergäbe "13.9.." - deshalb steht am Ende keiner.
  // Herkunft nach Menge sortiert - anders als bei den Tageszeiten gibt es
  // hier keine natürliche Reihenfolge, und die Frage lautet ausdrücklich
  // "was bringt am meisten".
  const herkunft = [...proQuelle.entries()]
    .map(([name, wert]) => ({
      schluessel: name,
      name,
      wert,
      matt: name === "nicht bekannt" || name === "direkt",
    }))
    .sort((a, b) => b.wert - a.wert);

  const aktionen = [...proAktion.entries()]
    .map(([name, wert]) => ({ schluessel: name, name, wert }))
    .sort((a, b) => b.wert - a.wert);

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

          <AdminSection
            title="Woher die Anfragen kamen"
            description="Aktionscode zuerst, dann die Kennung aus der beworbenen Adresse, sonst die verweisende Seite."
            className="mt-8"
          >
            <Panel>
              <Rangbalken
                beschriftung={`Herkunft der Anfragen, ${zeitraumText}`}
                eintraege={herkunft}
              />

              {/* Ohne diesen Absatz liest man die Zahlen genauer, als sie
                  sind. Das gehört daneben, nicht in eine Fußnote. */}
              <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-xs text-muted">
                <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
                Gemessen wird ohne Cookies und ohne Drittanbieter - aus der
                aufgerufenen Adresse und dem Verweis des Browsers. Deshalb ist
                &bdquo;direkt&ldquo; eine Sammelkiste: Adresse selbst eingetippt,
                aus einer App heraus geöffnet, oder der Browser hat den Verweis
                unterdrückt. Belastbar wird die Zuordnung erst über eigene
                Aktionscodes und Kampagnenkennungen in euren Anzeigen.
              </p>
            </Panel>
          </AdminSection>

          {aktionen.length > 0 && (
            <AdminSection
              title="Anfragen je Aktionscode"
              description="Nur Anfragen, bei denen ein gültiger Code eingegeben wurde."
              className="mt-8"
            >
              <Panel>
                <Rangbalken
                  beschriftung={`Anfragen je Aktionscode, ${zeitraumText}`}
                  eintraege={aktionen}
                />
              </Panel>
            </AdminSection>
          )}

          <AdminSection
            title="Wann Interessenten erreichbar sind"
            description="Die Angabe aus dem Anfrageformular. Sie sagt, wann Rückrufe ankommen - und wann die Leitung am Telefon eingeplant sein sollte."
            className="mt-8"
          >
            <Panel>
              <Rangbalken
                beschriftung={`Angegebene telefonische Erreichbarkeit, ${zeitraumText}`}
                eintraege={erreichbarkeiten}
              />
            </Panel>
          </AdminSection>

          <AdminSection
            title="Womit Interessenten zu euch kommen"
            description="Die freiwillige Angabe aus dem Anfrageformular. Sie sagt, worüber im ersten Gespräch geredet werden sollte - und womit sich werben lässt."
            className="mt-8"
          >
            <Panel>
              <Rangbalken
                beschriftung={`Angegebenes Ziel, ${zeitraumText}`}
                eintraege={ziele}
              />
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
                      ? "Eine Anfrage stammt aus der Zeit, bevor der Standort mitgeschickt wurde, und lässt sich deshalb keinem Studio zuordnen."
                      : `${ohneStandort} Anfragen stammen aus der Zeit, bevor der Standort mitgeschickt wurde, und lassen sich deshalb keinem Studio zuordnen.`}{" "}
                    Neue Anfragen tragen ihn immer.
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
