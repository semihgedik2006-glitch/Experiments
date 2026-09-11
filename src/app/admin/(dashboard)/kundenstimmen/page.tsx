import Link from "next/link";
import { Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import {
  StimmeFormular,
  StimmeLoeschen,
  type StimmeDaten,
} from "@/components/admin/stimme-formular";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";

/**
 * Kundenstimmen.
 *
 * Vorher standen hier sechs erfundene Menschen im Quelltext - als
 * Platzhalter fürs Layout gedacht, aber auf der Startseite sichtbar.
 * Erfundene Bewertungen sind unzulässig, und zwar unabhängig davon, wie
 * gut sie gemeint sind.
 *
 * Eine Liste über alle Standorte statt einer Seite je Studio: Es sind
 * ein paar Stimmen, keine fünfzig je Standort.
 */
export default async function AdminKundenstimmenPage() {
  const admin = await verlangeAdmin();
  const erzwungenesStudio = studioEinschraenkung(admin);

  const studios = await prisma.studioLocation.findMany({
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" },
  });

  const stimmen: (StimmeDaten & { studio: { name: string } | null })[] =
    await prisma.kundenstimme.findMany({
      where: erzwungenesStudio ? { studioId: erzwungenesStudio } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        text: true,
        ziel: true,
        monate: true,
        studioId: true,
        einwilligungAm: true,
        einwilligungNotiz: true,
        aktiv: true,
        sortOrder: true,
        studio: { select: { name: true } },
      },
    });

  const sichtbar = stimmen.filter((s) => s.aktiv).length;

  return (
    <AdminPage
      title="Kundenstimmen"
      description={
        <>
          Echte Zitate von Mitgliedern. Sie erscheinen auf der{" "}
          <Link href="/" className="text-accent underline underline-offset-2">
            Startseite
          </Link>{" "}
          (die ersten drei) und auf{" "}
          <Link
            href="/erfolgsgeschichten"
            className="text-accent underline underline-offset-2"
          >
            Erfolgsgeschichten
          </Link>
          .
        </>
      }
    >
      <Panel className="mb-6 border-lime/40">
        <h2 className="font-semibold">Nur echte Zitate</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Eine erfundene Bewertung ist keine Kleinigkeit, sondern nach{" "}
          <strong className="text-foreground">§ 5b Abs. 3 UWG</strong> unzulässig -
          auch die freundlich gemeinte, auch die, die ungefähr stimmt. Nehmt nur,
          was jemand euch tatsächlich geschrieben oder gesagt hat, und fragt kurz
          nach, ob es mit Vornamen auf die Website darf. Diese Zustimmung tragt ihr
          unten ein.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Solange hier nichts freigegeben ist, erscheint der Bereich auf beiden
          Seiten schlicht nicht. Eine leere Stelle ist besser als eine erfundene.
        </p>
      </Panel>

      {stimmen.length > 0 && sichtbar === 0 && (
        <p className="mb-6 text-sm text-danger">
          Keine Stimme steht auf „zeigen“ - der Bereich erscheint auf der Website
          deshalb nicht.
        </p>
      )}

      <AdminSection title="Vorhandene Stimmen">
        {stimmen.length === 0 ? (
          <EmptyState icon={Quote} title="Noch keine Kundenstimme">
            Zwei Sätze von jemandem, der tatsächlich bei euch trainiert, wirken
            mehr als jede Selbstbeschreibung. Fragt beim nächsten Termin.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {stimmen.map((stimme) => (
              <Panel key={stimme.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{stimme.name}</span>
                    {stimme.studio && (
                      <span className="text-sm text-muted">{stimme.studio.name}</span>
                    )}
                    {stimme.aktiv ? (
                      <StatusBadge ton="ok">erscheint</StatusBadge>
                    ) : (
                      <StatusBadge ton="off">ausgeblendet</StatusBadge>
                    )}
                    {!stimme.einwilligungAm && (
                      <StatusBadge ton="open">Zustimmung nicht vermerkt</StatusBadge>
                    )}
                  </span>
                  <StimmeLoeschen id={stimme.id} name={stimme.name} />
                </div>
                <StimmeFormular studios={studios} stimme={stimme} />
              </Panel>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection title="Neue Stimme" className="mt-8">
        <Panel highlight>
          <StimmeFormular studios={studios} studioFest={erzwungenesStudio} />
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
