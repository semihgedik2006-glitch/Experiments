import Link from "next/link";
import { UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { FilterChips } from "@/components/admin/list-nav";
import {
  TrainerFormular,
  TrainerLoeschen,
  type TrainerDaten,
} from "@/components/admin/trainer-formular";
import { param, type SuchParams } from "@/lib/admin-list";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";

/**
 * Trainerprofile.
 *
 * Eine Seite je Standort statt einer langen Liste über alle: Die Profile
 * gehören zu einem Studio, und bei vierzehn Standorten wären das schnell
 * fünfzig Karten untereinander, in denen niemand mehr etwas findet.
 *
 * Eine Studioleitung sieht und pflegt genau ihren Standort - Trainer
 * einzutragen ist alltägliche Arbeit am Standort und keine Entscheidung
 * für die Marke.
 */
export default async function AdminTrainerPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;

  const erzwungenesStudio = studioEinschraenkung(admin);

  const studios = await prisma.studioLocation.findMany({
    where: erzwungenesStudio ? { id: erzwungenesStudio } : undefined,
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });

  // Ohne Auswahl der erste Standort - eine Seite, die erst nach einem
  // Klick etwas zeigt, sieht beim Öffnen kaputt aus.
  const gewaehlt = erzwungenesStudio ?? param(params, "studio");
  const studio = studios.find((s) => s.id === gewaehlt) ?? studios[0];

  const trainer: TrainerDaten[] = studio
    ? await prisma.trainer.findMany({
        where: { studioId: studio.id },
        // Zweites Sortierkriterium: Bei gleicher Reihenfolge darf die
        // Datenbank die Karten sonst zwischen zwei Aufrufen tauschen.
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          rolle: true,
          qualifikation: true,
          text: true,
          fotoUrl: true,
          aktiv: true,
          sortOrder: true,
        },
      })
    : [];

  const sichtbar = trainer.filter((t) => t.aktiv).length;

  if (!studio) {
    return (
      <AdminPage title="Trainer">
        <EmptyState icon={UserRound} title="Kein Standort vorhanden">
          Trainerprofile hängen an einem Studio. Leg zuerst einen Standort an.
        </EmptyState>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Trainer"
      description={
        <>
          Wer im Studio betreut. Die Profile erscheinen auf der Standortseite{" "}
          <Link
            href={`/studio/${studio.slug}`}
            className="text-accent underline underline-offset-2"
          >
            /studio/{studio.slug}
          </Link>
          .
        </>
      }
    >
      {admin.istLeitung && studios.length > 1 && (
        <FilterChips
          basis="/admin/trainer"
          params={params}
          name="studio"
          optionen={studios.map((s) => ({ wert: s.id, label: s.name }))}
          klasse="mb-6"
        />
      )}

      {/* Der Hinweis steht oben, weil er die Wirkung der ganzen Seite
          betrifft: Ohne ein einziges sichtbares Profil erscheint der
          Abschnitt auf der Standortseite gar nicht. */}
      {trainer.length > 0 && sichtbar === 0 && (
        <p className="mb-6 text-sm text-danger">
          Kein Profil ist auf „zeigen“ gestellt - der Abschnitt erscheint auf der
          Standortseite deshalb nicht.
        </p>
      )}

      <AdminSection title={`Profile für ${studio.name}`}>
        {trainer.length === 0 ? (
          <EmptyState icon={UserRound} title="Noch kein Profil">
            Ein Gesicht mit zwei Sätzen senkt die Hemmschwelle vor dem ersten
            Termin spürbar. Leg unten das erste an.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {trainer.map((eintrag) => (
              <Panel key={eintrag.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{eintrag.name}</span>
                    {!eintrag.aktiv && <StatusBadge ton="off">ausgeblendet</StatusBadge>}
                  </span>
                  <TrainerLoeschen id={eintrag.id} name={eintrag.name} />
                </div>
                <TrainerFormular studioId={studio.id} trainer={eintrag} />
              </Panel>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection title="Neues Profil" className="mt-8">
        <Panel highlight>
          <TrainerFormular studioId={studio.id} />
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
