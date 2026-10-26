import Link from "next/link";
import { IdCard, Info, Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { SearchBox } from "@/components/admin/search-box";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  MitgliedBearbeiten,
  MitgliedNeu,
  MitgliederImport,
} from "@/components/admin/mitglied-formulare";
import { mitgliedLoeschen } from "@/lib/actions/admin-mitglieder";
import { formatDate } from "@/lib/format";
import { param, seitenZahl, type SuchParams } from "@/lib/admin-list";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { laufzeitstand } from "@/lib/mitglieder";
import type { Prisma } from "@/generated/prisma/client";

const PRO_SEITE = 40;

/**
 * Die Mitgliederliste.
 *
 * Gefüllt aus dem LogX-Export und ergänzt um das, was dort nicht steht:
 * Vertragsbeginn und Laufzeit. Ohne die beiden gibt es keine
 * Willkommensmails und keine Laufzeit-Erinnerung - deshalb gibt es einen
 * eigenen Filter "Vertragsbeginn fehlt".
 */
export default async function AdminMitgliederPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;
  const erzwungenesStudio = studioEinschraenkung(admin);
  const studioFilter = erzwungenesStudio ?? param(params, "studio");
  const ansicht = param(params, "ansicht");
  const suche = param(params, "q");
  const seite = seitenZahl(params);

  const wo: Prisma.MitgliedWhereInput = {
    ...(studioFilter === "ohne" ? { studioId: null } : studioFilter ? { studioId: studioFilter } : {}),
    aktiv: ansicht !== "ehemalig",
    ...(ansicht === "ohne-beginn" ? { vertragsbeginn: null } : {}),
    ...(ansicht === "werbung" ? { werbungErlaubt: true } : {}),
    ...(suche
      ? {
          OR: [
            { vorname: { contains: suche, mode: "insensitive" } },
            { nachname: { contains: suche, mode: "insensitive" } },
            { email: { contains: suche, mode: "insensitive" } },
            { logxNummer: suche },
          ],
        }
      : {}),
  };

  const [studios, mitglieder, gesamt, ohneBeginn, aktivGesamt] = await Promise.all([
    prisma.studioLocation.findMany({
      where: erzwungenesStudio ? { id: erzwungenesStudio } : undefined,
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.mitglied.findMany({
      where: wo,
      orderBy: [{ nachname: "asc" }, { vorname: "asc" }, { id: "asc" }],
      skip: (seite - 1) * PRO_SEITE,
      take: PRO_SEITE,
      include: { studio: { select: { name: true } } },
    }),
    prisma.mitglied.count({ where: wo }),
    prisma.mitglied.count({
      where: { aktiv: true, vertragsbeginn: null, ...(erzwungenesStudio ? { studioId: erzwungenesStudio } : {}) },
    }),
    prisma.mitglied.count({
      where: { aktiv: true, ...(erzwungenesStudio ? { studioId: erzwungenesStudio } : {}) },
    }),
  ]);

  const heute = new Date();

  return (
    <AdminPage
      title="Mitgliederliste"
      description={
        aktivGesamt === 0
          ? "Noch keine Mitglieder eingetragen - am schnellsten über den Import aus LogX."
          : `${aktivGesamt} aktive Mitglieder${ohneBeginn > 0 ? `, bei ${ohneBeginn} fehlt noch der Vertragsbeginn` : ""}.`
      }
      action={
        <Link
          href="/admin/einwilligung-druck"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime"
        >
          <Printer size={13} aria-hidden /> Einwilligungs-Zettel
        </Link>
      }
    >
      <Panel className="mb-6">
        <p className="flex items-start gap-2.5 text-sm">
          <Info size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span>
            Hier steht nur, was für Mails und Gespräche gebraucht wird: Name, E-Mail, Studio,
            Vertragsbeginn, Laufzeit, Einwilligung. <strong>Keine Trainingsnotizen, keine
            Gesundheitsangaben</strong> - die bleiben in LogX. Werbung geht nur an Mitglieder mit
            Haken bei „Werbung erlaubt“.
          </span>
        </p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminSection
          title="Aus LogX übernehmen"
          description="Neue Mitglieder werden angelegt, bekannte aktualisiert, Ausgetretene als ehemalig markiert. Einmal im Monat reicht."
        >
          <Panel>
            <MitgliederImport
              studios={studios}
              studioId={studioFilter && studioFilter !== "ohne" ? studioFilter : (studios[0]?.id ?? null)}
              istLeitung={admin.istLeitung}
            />
          </Panel>
        </AdminSection>

        <AdminSection
          title="Neues Mitglied"
          description="Bei jedem Vertragsabschluss - mit Vertragsbeginn und Laufzeit vom Anmeldeformular."
        >
          <Panel highlight>
            <MitgliedNeu
              studios={studios}
              studioId={studioFilter && studioFilter !== "ohne" ? studioFilter : (studios[0]?.id ?? null)}
              istLeitung={admin.istLeitung}
            />
          </Panel>
        </AdminSection>
      </div>

      <div className="mt-10 space-y-3">
        {admin.istLeitung && studios.length > 1 && (
          <FilterChips
            basis="/admin/mitglieder"
            params={params}
            name="studio"
            optionen={[
              { wert: "", label: "Alle Studios" },
              ...studios.map((s) => ({ wert: s.id, label: s.name })),
              { wert: "ohne", label: "Ohne Studio" },
            ]}
          />
        )}
        <FilterChips
          basis="/admin/mitglieder"
          params={params}
          name="ansicht"
          optionen={[
            { wert: "", label: "Aktive Mitglieder" },
            { wert: "ohne-beginn", label: `Vertragsbeginn fehlt (${ohneBeginn})` },
            { wert: "werbung", label: "Werbung erlaubt" },
            { wert: "ehemalig", label: "Ehemalige" },
          ]}
        />
        <SearchBox platzhalter="Name, E-Mail oder Kundennummer" klasse="max-w-md" />
      </div>

      <AdminSection title="Liste" className="mt-6">
        {mitglieder.length === 0 ? (
          <EmptyState icon={IdCard} title="Niemand in dieser Ansicht">
            Über den Import oben kommen alle Mitglieder aus LogX auf einmal herein.
          </EmptyState>
        ) : (
          <div className="space-y-2">
            {mitglieder.map((m) => {
              const stand = laufzeitstand(m.vertragsbeginn, m.laufzeitMonate, heute);
              return (
                <Panel key={m.id}>
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold">
                        {m.vorname} {m.nachname}
                      </span>
                      {m.logxNummer && <span className="text-xs text-muted">Nr. {m.logxNummer}</span>}
                      <span className="text-sm text-muted">{m.studio?.name ?? "ohne Studio"}</span>
                      {stand.art === "unbekannt" && m.aktiv && (
                        <StatusBadge ton="open">Vertragsbeginn fehlt</StatusBadge>
                      )}
                      {stand.art === "laeuft" && (
                        <StatusBadge ton="idle">Erstlaufzeit bis {formatDate(stand.ende)}</StatusBadge>
                      )}
                      {stand.art === "gespraech-faellig" && (
                        <StatusBadge ton={m.gespraechAm ? "ok" : "open"}>
                          {m.gespraechAm ? "Gespräch geführt" : `Gespräch fällig - endet ${formatDate(stand.ende)}`}
                        </StatusBadge>
                      )}
                      {stand.art === "monatlich" && <StatusBadge ton="idle">monatlich kündbar</StatusBadge>}
                      {m.werbungErlaubt && <StatusBadge ton="ok">Werbung erlaubt</StatusBadge>}
                      {m.umfrageNote !== null && (
                        <StatusBadge ton={m.umfrageNote <= 3 ? "open" : "ok"}>Umfrage {m.umfrageNote}/5</StatusBadge>
                      )}
                      {!m.email && <StatusBadge ton="off">keine E-Mail</StatusBadge>}
                      {m.mailsAbbestellt && <StatusBadge ton="off">Mails abbestellt</StatusBadge>}
                    </summary>

                    <div className="mt-4 border-t border-border pt-4">
                      <MitgliedBearbeiten
                        daten={{
                          id: m.id,
                          email: m.email,
                          studioId: m.studioId,
                          vertragsbeginn: m.vertragsbeginn ? m.vertragsbeginn.toISOString().slice(0, 10) : "",
                          laufzeitMonate: m.laufzeitMonate,
                          werbungErlaubt: m.werbungErlaubt,
                        }}
                        studios={studios}
                        istLeitung={admin.istLeitung}
                      />
                      {m.werbungErlaubt && m.werbungQuelle && (
                        <p className="mt-2 text-xs text-muted">
                          Einwilligung: {m.werbungQuelle}
                          {m.werbungErlaubtAm ? `, ${formatDate(m.werbungErlaubtAm)}` : ""}
                        </p>
                      )}
                      <form
                        className="mt-3"
                        action={async () => {
                          "use server";
                          await mitgliedLoeschen(m.id);
                        }}
                      >
                        <ConfirmButton
                          variant="link"
                          question={`${m.vorname} ${m.nachname} aus der Liste löschen? In LogX bleibt alles.`}
                        />
                      </form>
                    </div>
                  </details>
                </Panel>
              );
            })}
          </div>
        )}
        <Pagination
          basis="/admin/mitglieder"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Mitglieder"
        />
      </AdminSection>
    </AdminPage>
  );
}
