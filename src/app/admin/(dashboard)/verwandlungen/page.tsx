import Link from "next/link";
import { Images } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import {
  VerwandlungFormular,
  VerwandlungLoeschen,
  VerwandlungVerbergen,
  type VerwandlungDaten,
} from "@/components/admin/verwandlung-formular";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { ERGEBNIS_HINWEIS, veroeffentlichungsHindernisse } from "@/lib/verwandlung";

/**
 * Vorher-Nachher-Bilder.
 *
 * Eine Liste über alle Standorte statt einer Seite je Studio - anders als
 * bei den Trainerprofilen. Der Grund ist der Umfang: Es sind ein paar
 * Fälle im Jahr, nicht fünfzig je Standort. Eine Auswahlleiste über drei
 * Einträgen wäre Bedienung ohne Nutzen.
 *
 * Eine Studioleitung sieht die Fälle ihres Standorts. Einträge ohne
 * Standort gehören der Marke und bleiben der Leitung vorbehalten.
 */
export default async function AdminVerwandlungenPage() {
  const admin = await verlangeAdmin();
  const erzwungenesStudio = studioEinschraenkung(admin);

  const studios = await prisma.studioLocation.findMany({
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" },
  });

  const eintraege: (VerwandlungDaten & { studio: { name: string } | null })[] =
    await prisma.verwandlung.findMany({
      where: erzwungenesStudio ? { studioId: erzwungenesStudio } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        zeitraum: true,
        kontext: true,
        text: true,
        vorherUrl: true,
        nachherUrl: true,
        studioId: true,
        einwilligungAm: true,
        einwilligungForm: true,
        einwilligungNotiz: true,
        aktiv: true,
        sortOrder: true,
        studio: { select: { name: true } },
      },
    });

  const sichtbar = eintraege.filter((e) => e.aktiv).length;

  return (
    <AdminPage
      title="Vorher-Nachher"
      description={
        <>
          Bildpaare für die Seite{" "}
          <Link
            href="/erfolgsgeschichten"
            className="text-accent underline underline-offset-2"
          >
            Erfolgsgeschichten
          </Link>
          . {sichtbar === 0 ? "Zurzeit erscheint dort keines." : `${sichtbar} davon erscheinen dort.`}
        </>
      }
    >
      {/* Der wichtigste Satz der Seite steht oben und nicht als Fußnote:
          Wer hier etwas anlegt, veröffentlicht das Bild eines Menschen. */}
      <Panel className="mb-6 border-lime/40">
        <h2 className="font-semibold">Bevor ihr ein Bildpaar anlegt</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-foreground">Einwilligung schriftlich einholen.</strong> Ein
            Foto, auf dem jemand erkennbar ist, darf nur mit dessen Zustimmung
            veröffentlicht werden - bei einem Vorher-Nachher-Bild in
            Trainingskleidung erst recht. Darin sollte stehen, wo die Bilder
            erscheinen und dass die Zustimmung jederzeit widerrufen werden kann.
          </li>
          <li>
            <strong className="text-foreground">Widerruf sofort umsetzen.</strong> Meldet sich
            jemand, nehmt das Bild mit „Sofort ausblenden“ aus der Anzeige -
            das dauert einen Klick und muss nicht warten.
          </li>
          <li>
            <strong className="text-foreground">Zeitraum und Zusammenhang ehrlich angeben.</strong>{" "}
            Ein Bildpaar behauptet etwas, ohne einen Satz zu sagen. Was daneben
            steht, entscheidet, ob das eine Aussage oder ein Versprechen ist.
          </li>
          <li>
            Unter den Bildern steht auf der Website fest: „{ERGEBNIS_HINWEIS}“
          </li>
        </ul>
      </Panel>

      <AdminSection title="Vorhandene Bildpaare">
        {eintraege.length === 0 ? (
          <EmptyState icon={Images} title="Noch kein Bildpaar">
            Ein einziges ehrliches Bildpaar wirkt stärker als zehn Zitate. Es
            braucht nur zwei Fotos - und die Einwilligung der Person darauf.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {eintraege.map((eintrag) => {
              const hindernisse = veroeffentlichungsHindernisse(eintrag);

              return (
                <Panel key={eintrag.id}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{eintrag.name}</span>
                      {eintrag.studio && (
                        <span className="text-sm text-muted">{eintrag.studio.name}</span>
                      )}
                      {eintrag.aktiv ? (
                        <StatusBadge ton="ok">erscheint</StatusBadge>
                      ) : (
                        <StatusBadge ton="off">nicht veröffentlicht</StatusBadge>
                      )}
                    </span>
                    <span className="flex items-center gap-4">
                      {eintrag.aktiv && (
                        <VerwandlungVerbergen id={eintrag.id} name={eintrag.name} />
                      )}
                      <VerwandlungLoeschen id={eintrag.id} name={eintrag.name} />
                    </span>
                  </div>

                  {/* Nicht nur "erscheint nicht", sondern warum. Ohne den
                      Grund klickt jemand das Häkchen immer wieder an und
                      versteht nicht, warum es nach dem Speichern wieder
                      aus ist. */}
                  {hindernisse.length > 0 && (
                    <div className="mb-4 rounded-lg border border-border bg-surface p-3 text-sm">
                      <p className="font-medium text-danger">
                        Kann so nicht veröffentlicht werden:
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
                        {hindernisse.map((grund) => (
                          <li key={grund}>{grund}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {eintrag.einwilligungAm && (
                    <p className="mb-4 text-sm text-muted">
                      Einwilligung seit{" "}
                      {eintrag.einwilligungAm.toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {eintrag.einwilligungForm && `, ${eintrag.einwilligungForm}`}
                      {eintrag.einwilligungNotiz && ` (${eintrag.einwilligungNotiz})`}
                    </p>
                  )}

                  <VerwandlungFormular studios={studios} eintrag={eintrag} />
                </Panel>
              );
            })}
          </div>
        )}
      </AdminSection>

      <AdminSection title="Neues Bildpaar" className="mt-8">
        <Panel highlight>
          <VerwandlungFormular studios={studios} studioFest={erzwungenesStudio} />
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
