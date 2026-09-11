import Link from "next/link";
import { Euro, Info, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import {
  AngebotFormular,
  AngebotLoeschen,
  TarifFormular,
  TarifLoeschen,
  TextFormular,
  type AngebotDaten,
  type TarifDaten,
} from "@/components/admin/preis-formulare";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { getTexte, textDefinitionen } from "@/lib/site-texte";
import { symbolFuer } from "@/lib/zusatzangebote";

/**
 * Preise und Zusatzangebote.
 *
 * Beides für die Marke und damit nur für die Leitung: Ein Standort, der
 * eigene Beiträge nennt, wäre keine Preisübersicht mehr, sondern
 * vierzehn - und die Frage "was kostet das bei euch" hätte vierzehn
 * Antworten.
 *
 * Der wichtigste Satz dieser Seite steht oben: Solange kein Tarif
 * eingetragen ist, bleibt die Preisseite genau so, wie sie ist. Das
 * verhindert, dass jemand hier etwas anlegt, um "mal zu sehen was
 * passiert" - und es dann ungewollt veröffentlicht.
 */
export default async function AdminPreisePage() {
  await verlangeLeitung();

  const [tarife, angebote, studios, texte] = await Promise.all([
    prisma.tarif.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.zusatzangebot.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.studioLocation.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    getTexte(),
  ]);

  const sichtbareTarife = tarife.filter((t) => t.aktiv);
  const preisText = textDefinitionen.find((eintrag) => eintrag.key === "preis-hinweis")!;

  const tarifDaten: TarifDaten[] = tarife;
  const angebotDaten: AngebotDaten[] = angebote;

  return (
    <AdminPage
      title="Preise und Zusatzangebote"
      description={
        <>
          Was auf der{" "}
          <Link href="/preise" className="text-accent underline underline-offset-2">
            Preisseite
          </Link>{" "}
          steht. Zusatzangebote erscheinen zusätzlich auf den Standortseiten.
        </>
      }
    >
      <Panel className="mb-6">
        <p className="flex items-start gap-2.5 text-sm">
          <Info size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span>
            {sichtbareTarife.length === 0 ? (
              <>
                <span className="font-semibold">Es stehen gerade keine Preise auf der Seite.</span>{" "}
                Die Preisseite erklärt weiterhin, warum dort keine Preisliste steht - das
                ist eine Haltung und keine Lücke. Sobald hier ein Tarif auf „zeigen“
                steht, erscheint oben auf der Preisseite die Übersicht.
              </>
            ) : (
              <>
                <span className="font-semibold">
                  {sichtbareTarife.length}{" "}
                  {sichtbareTarife.length === 1 ? "Tarif steht" : "Tarife stehen"} öffentlich
                  auf der Preisseite.
                </span>{" "}
                Der Abschnitt „Warum hier keine Preisliste steht“ bleibt darunter stehen -
                er beantwortet die nächste Frage, nicht dieselbe.
              </>
            )}
          </span>
        </p>
      </Panel>

      <AdminSection title="Tarife">
        {tarife.length === 0 ? (
          <EmptyState icon={Euro} title="Noch kein Tarif">
            Solange hier nichts steht, bleibt die Preisseite unverändert. Leg unten
            einen an, wenn ihr Preise nennen wollt.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {tarifDaten.map((tarif) => (
              <Panel key={tarif.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{tarif.name}</span>
                    {tarif.preis && <span className="text-sm text-muted">{tarif.preis}</span>}
                    {tarif.empfohlen && <StatusBadge ton="ok">Empfehlung</StatusBadge>}
                    {!tarif.aktiv && <StatusBadge ton="off">ausgeblendet</StatusBadge>}
                  </span>
                  <TarifLoeschen id={tarif.id} name={tarif.name} />
                </div>
                <TarifFormular tarif={tarif} />
              </Panel>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection title="Neuer Tarif" className="mt-8">
        <Panel highlight>
          <TarifFormular />
        </Panel>
      </AdminSection>

      {/* Der Pflichthinweis steht direkt unter den Tarifen und nicht in
          einer eigenen Ecke: Er gehört zu ihnen, und wer Preise einträgt,
          soll ihn im selben Arbeitsgang sehen. */}
      <AdminSection
        title={preisText.label}
        description={preisText.beschreibung}
        className="mt-10"
      >
        <Panel>
          <TextFormular
            schluessel={preisText.key}
            wert={texte["preis-hinweis"]}
            zeilen={preisText.zeilen}
          />
        </Panel>
      </AdminSection>

      <AdminSection
        title="Zusatzangebote"
        description="Ernährungsberatung, Messungen, persönliche Betreuung - alles, was es zusätzlich zum Training gibt. Erscheint auf der Preisseite und auf den Standortseiten, an denen es angeboten wird."
        className="mt-12"
      >
        {angebote.length === 0 ? (
          <EmptyState icon={Sparkles} title="Noch kein Zusatzangebot">
            Ernährungsberatung und Messungen werden auf der Preisseite bisher nur
            als Halbsatz erwähnt. Wer gezielt danach sucht, findet sie dort nicht.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {angebotDaten.map((angebot) => {
              const Symbol = symbolFuer(angebot.symbol);
              const orte =
                angebot.nurStudios.length === 0
                  ? "an allen Standorten"
                  : `an ${angebot.nurStudios.length} von ${studios.length} Standorten`;

              return (
                <Panel key={angebot.id}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex flex-wrap items-center gap-2">
                      <Symbol size={16} className="text-accent" aria-hidden />
                      <span className="font-semibold">{angebot.name}</span>
                      <span className="text-sm text-muted">{orte}</span>
                      {!angebot.aktiv && <StatusBadge ton="off">ausgeblendet</StatusBadge>}
                    </span>
                    <AngebotLoeschen id={angebot.id} name={angebot.name} />
                  </div>
                  <AngebotFormular angebot={angebot} studios={studios} />
                </Panel>
              );
            })}
          </div>
        )}
      </AdminSection>

      <AdminSection title="Neues Zusatzangebot" className="mt-8">
        <Panel highlight>
          <AngebotFormular studios={studios} />
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
