import { Info, Search, TicketPercent } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge, adminInput } from "@/components/admin/ui";
import { FilterChips } from "@/components/admin/list-nav";
import {
  GutscheinAktionen,
  GutscheinNotiz,
  VorOrtFormular,
} from "@/components/admin/gutschein-formulare";
import { formatDate } from "@/lib/format";
import { param, type SuchParams } from "@/lib/admin-list";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { isVisible } from "@/lib/site-toggles";
import {
  STATUS_TEXT,
  STATUS_TON,
  artText,
  betragText,
  gutscheinCodeNormalisieren,
} from "@/lib/gutschein";
import type { GutscheinStatus } from "@/generated/prisma/enums";

const STATUS_FILTER: { wert: string; label: string }[] = [
  { wert: "", label: "Offen und gültig" },
  { wert: "ANGEFRAGT", label: "Angefragt" },
  { wert: "AUSGESTELLT", label: "Gültig" },
  { wert: "EINGELOEST", label: "Eingelöst" },
  { wert: "STORNIERT", label: "Storniert" },
];

/**
 * Gutscheine - Anfragen von der Website und Verkäufe im Studio.
 *
 * Oben steht das Feld zum Einlösen, weil das am Tresen schnell gehen muss:
 * Code eintippen, Gutschein steht da, ein Klick auf "Eingelöst".
 */
export default async function AdminGutscheinePage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;
  const erzwungenesStudio = studioEinschraenkung(admin);
  const studioFilter = erzwungenesStudio ?? param(params, "studio");
  const status = param(params, "status") as GutscheinStatus | "";
  const gesucht = param(params, "code");

  const wo = studioFilter ? { studioId: studioFilter } : {};

  const [studios, gutscheine, treffer, offen, seiteAn] = await Promise.all([
    prisma.studioLocation.findMany({
      where: erzwungenesStudio ? { id: erzwungenesStudio } : undefined,
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.gutschein.findMany({
      where: {
        ...wo,
        status: status ? status : { in: ["ANGEFRAGT", "AUSGESTELLT"] },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 200,
      include: { studio: { select: { name: true } } },
    }),
    gesucht
      ? prisma.gutschein.findFirst({
          where: { ...wo, code: gutscheinCodeNormalisieren(gesucht) },
          include: { studio: { select: { name: true } } },
        })
      : null,
    prisma.gutschein.count({ where: { ...wo, status: "ANGEFRAGT" } }),
    isVisible("gutscheine"),
  ]);

  return (
    <AdminPage
      title="Gutscheine"
      description={
        offen > 0
          ? `${offen} ${offen === 1 ? "Anfrage wartet" : "Anfragen warten"} auf einen Anruf.`
          : "Wertgutscheine und das Startpaket als Geschenk - bezahlt wird im Studio."
      }
    >
      {!seiteAn && (
        <Panel className="mb-6">
          <p className="flex items-start gap-2.5 text-sm">
            <Info size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <span>
              Die Seite <strong>„Gutschein verschenken“</strong> ist noch ausgeschaltet - online
              kann niemand anfragen. Verkäufe im Studio lassen sich trotzdem hier erfassen.
              Einschalten unter{" "}
              <Link href="/admin/sichtbarkeit" className="text-accent underline">
                Sichtbarkeit
              </Link>
              .
            </span>
          </p>
        </Panel>
      )}

      <AdminSection title="Einlösen">
        <Panel>
          <form className="flex flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-xs text-muted">Code vom Gutschein</span>
              <input
                type="text"
                name="code"
                defaultValue={gesucht}
                placeholder="KF-XXXX-XXXX"
                autoCapitalize="characters"
                className={`${adminInput} uppercase placeholder:normal-case`}
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime"
            >
              <Search size={13} aria-hidden /> Suchen
            </button>
          </form>
          {gesucht && !treffer && (
            <p className="mt-3 text-sm text-danger">Kein Gutschein mit diesem Code gefunden.</p>
          )}
          {treffer && (
            <div className="mt-4 rounded-xl border border-lime p-4">
              <GutscheinZeile gutschein={treffer} />
            </div>
          )}
        </Panel>
      </AdminSection>

      <div className="mt-8">
        {admin.istLeitung && studios.length > 1 && (
          <FilterChips
            basis="/admin/gutscheine"
            params={params}
            name="studio"
            optionen={[
              { wert: "", label: "Alle Studios" },
              ...studios.map((s) => ({ wert: s.id, label: s.name })),
            ]}
            klasse="mb-3"
          />
        )}
        <FilterChips
          basis="/admin/gutscheine"
          params={params}
          name="status"
          optionen={STATUS_FILTER}
          klasse="mb-6"
        />
      </div>

      <AdminSection title="Liste">
        {gutscheine.length === 0 ? (
          <EmptyState icon={TicketPercent} title="Keine Gutscheine in dieser Ansicht">
            Online-Anfragen erscheinen hier automatisch. Gutscheine, die im Studio verkauft
            werden, tragt ihr unten ein - dann stimmt auch die Zahl in den Kennzahlen.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {gutscheine.map((g) => (
              <Panel key={g.id}>
                <GutscheinZeile gutschein={g} />
                <div className="mt-3">
                  <GutscheinNotiz id={g.id} notiz={g.notiz} />
                </div>
              </Panel>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection
        title="Im Studio verkauft"
        description="Bar oder per Karte bezahlt? Hier eintragen - der Gutschein ist sofort gültig und kann gedruckt werden."
        className="mt-8"
      >
        <Panel highlight>
          <VorOrtFormular
            studios={studios}
            studioId={studioFilter || studios[0]?.id || null}
            istLeitung={admin.istLeitung}
          />
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}

function GutscheinZeile({
  gutschein: g,
}: {
  gutschein: {
    id: string;
    code: string;
    art: string;
    betrag: number;
    status: GutscheinStatus;
    kaeuferName: string;
    kaeuferEmail: string | null;
    kaeuferTelefon: string | null;
    fuer: string | null;
    vorOrt: boolean;
    createdAt: Date;
    gueltigBis: Date | null;
    eingeloestAm: Date | null;
    studio: { name: string } | null;
  };
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-lime/12 px-2 py-0.5 text-sm font-semibold text-accent">{g.code}</code>
        <span className="font-semibold">{artText(g.art, g.betrag)}</span>
        <span className="text-sm text-muted">{betragText(g.art, g.betrag)}</span>
        <StatusBadge ton={STATUS_TON[g.status]}>{STATUS_TEXT[g.status]}</StatusBadge>
        {g.vorOrt && <StatusBadge ton="idle">im Studio verkauft</StatusBadge>}
      </div>
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="inline text-muted">Käufer: </dt>
          <dd className="inline">
            {g.kaeuferName}
            {g.kaeuferTelefon && (
              <>
                {" · "}
                <a href={`tel:${g.kaeuferTelefon.replace(/\s/g, "")}`} className="text-accent">
                  {g.kaeuferTelefon}
                </a>
              </>
            )}
            {g.kaeuferEmail && ` · ${g.kaeuferEmail}`}
          </dd>
        </div>
        {g.fuer && (
          <div>
            <dt className="inline text-muted">Für: </dt>
            <dd className="inline">{g.fuer}</dd>
          </div>
        )}
        <div>
          <dt className="inline text-muted">Studio: </dt>
          <dd className="inline">{g.studio?.name ?? "-"}</dd>
        </div>
        <div>
          <dt className="inline text-muted">
            {g.status === "EINGELOEST" ? "Eingelöst: " : g.gueltigBis ? "Gültig bis: " : "Angefragt: "}
          </dt>
          <dd className="inline">
            {formatDate(
              g.status === "EINGELOEST" && g.eingeloestAm
                ? g.eingeloestAm
                : (g.gueltigBis ?? g.createdAt),
            )}
          </dd>
        </div>
      </dl>
      <GutscheinAktionen id={g.id} status={g.status} />
    </div>
  );
}
