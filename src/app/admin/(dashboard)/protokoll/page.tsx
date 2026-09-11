import { History, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, param, seitenZahl, type SuchParams } from "@/lib/admin-list";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import {
  ART_TEXT,
  ART_TON,
  BEREICHE,
  PROTOKOLL_TAGE,
  artAusText,
} from "@/lib/protokoll";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Wer hat wann was geändert.
 *
 * Eine Studioleitung sieht die Vorgänge ihres Standorts - und zusätzlich
 * die ohne Standortbezug NICHT: Wer den Newsletter verschickt oder einen
 * Zugang anlegt, entscheidet für die Marke, und das geht einen einzelnen
 * Standort nichts an.
 *
 * Was nicht drinsteht: das Lesen. Wer eine Liste öffnet, ändert nichts -
 * und ein Protokoll, in dem jeder Seitenaufruf steht, begräbt genau die
 * Einträge, für die es gedacht ist.
 */
function zeitpunkt(datum: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(datum);
}

export default async function AdminProtokollPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  const nurStudio = studioEinschraenkung(admin);
  const bereichRoh = param(params, "bereich");
  // Nur bekannte Bereiche durchlassen - sonst ergibt ?bereich=XYZ eine
  // leere Liste, ohne dass erkennbar wäre warum.
  const bereich = (BEREICHE as readonly string[]).includes(bereichRoh) ? bereichRoh : "";
  const art = artAusText(param(params, "art"));
  const seite = seitenZahl(params);

  const where: Prisma.ProtokollWhereInput = {
    ...(nurStudio ? { studioId: nurStudio } : {}),
    ...(bereich ? { bereich } : {}),
    ...(art ? { art } : {}),
  };

  // Die Zahlen an der Filterreihe zählen innerhalb der übrigen Auswahl.
  const ohneBereich: Prisma.ProtokollWhereInput = { ...where };
  delete ohneBereich.bereich;

  const [gesamt, eintraege, jeBereich] = await Promise.all([
    prisma.protokoll.count({ where }),
    prisma.protokoll.findMany({
      where,
      // Zweites Sortierkriterium: Zwei Einträge aus demselben Vorgang
      // haben denselben Zeitstempel bis auf die Millisekunde.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
    }),
    prisma.protokoll.groupBy({ by: ["bereich"], where: ohneBereich, _count: true }),
  ]);

  const anzahl = (name: string) =>
    jeBereich.find((eintrag) => eintrag.bereich === name)?._count ?? 0;
  const alle = jeBereich.reduce((summe, eintrag) => summe + eintrag._count, 0);

  // Nur Bereiche anbieten, in denen auch etwas steht. Ein Filterknopf,
  // der auf eine leere Liste führt, ist kein Angebot.
  const vorhandeneBereiche = BEREICHE.filter((name) => anzahl(name) > 0);

  const gefiltert = Boolean(bereich || art);

  return (
    <AdminPage
      title="Änderungsprotokoll"
      description={
        admin.istLeitung
          ? `Wer hat wann was geändert. Einträge werden ${PROTOKOLL_TAGE} Tage aufgehoben und danach automatisch gelöscht.`
          : `Vorgänge an deinem Standort. Einträge werden ${PROTOKOLL_TAGE} Tage aufgehoben.`
      }
    >
      {alle > 0 && (
        <div className="space-y-3">
          {vorhandeneBereiche.length > 1 && (
            <FilterChips
              basis="/admin/protokoll"
              params={params}
              name="bereich"
              optionen={[
                { wert: "", label: "Alles", anzahl: alle },
                ...vorhandeneBereiche.map((name) => ({
                  wert: name,
                  label: name,
                  anzahl: anzahl(name),
                })),
              ]}
            />
          )}

          <FilterChips
            basis="/admin/protokoll"
            params={params}
            name="art"
            optionen={[
              { wert: "", label: "Alle Vorgänge" },
              { wert: "ANGELEGT", label: "Angelegt" },
              { wert: "GEAENDERT", label: "Geändert" },
              { wert: "GELOESCHT", label: "Gelöscht" },
              { wert: "STATUS", label: "Status" },
              { wert: "VERSENDET", label: "Versendet" },
            ]}
          />
        </div>
      )}

      {eintraege.length > 0 && (
        <Panel className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4 font-medium">Wann</th>
                <th className="py-2 pr-4 font-medium">Wer</th>
                <th className="py-2 pr-4 font-medium">Was</th>
                <th className="py-2 pr-4 font-medium">Worum</th>
              </tr>
            </thead>
            <tbody>
              {eintraege.map((eintrag) => (
                <tr key={eintrag.id} className="border-b border-border/60 align-top">
                  <td className="whitespace-nowrap py-3 pr-4 tabular-nums text-muted">
                    {zeitpunkt(eintrag.createdAt)}
                  </td>
                  <td className="py-3 pr-4">{eintrag.wer}</td>
                  <td className="py-3 pr-4">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge ton={ART_TON[eintrag.art]}>
                        {ART_TEXT[eintrag.art]}
                      </StatusBadge>
                      <span className="text-muted">{eintrag.bereich}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {eintrag.betreff}
                    {eintrag.detail && (
                      <span className="block text-xs text-muted">{eintrag.detail}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {eintraege.length > 0 && (
        <Pagination
          basis="/admin/protokoll"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Einträge"
        />
      )}

      {eintraege.length === 0 && gefiltert && (
        <EmptyState icon={SearchX} title="Nichts passt zu dieser Auswahl">
          Zu dieser Kombination steht nichts im Protokoll.
        </EmptyState>
      )}

      {eintraege.length === 0 && !gefiltert && (
        <EmptyState icon={History} title="Noch nichts protokolliert">
          Sobald jemand eine Buchung bestätigt, einen Termin löscht oder einen
          Zugang ändert, steht es hier - mit Namen und Uhrzeit. Das Öffnen von
          Listen wird bewusst nicht festgehalten: Wer liest, ändert nichts.
        </EmptyState>
      )}
    </AdminPage>
  );
}
