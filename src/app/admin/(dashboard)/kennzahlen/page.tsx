import { Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, Panel, adminInput } from "@/components/admin/ui";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FilterChips } from "@/components/admin/list-nav";
import { kennzahlSpeichern } from "@/lib/actions/admin-kennzahlen";
import { param, type SuchParams } from "@/lib/admin-list";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import {
  KENNZAHL_FELDER,
  letzteMonate,
  monatAlsText,
  monatAusText,
  monatName,
  quote,
  schnitt,
  type KennzahlFeld,
} from "@/lib/kennzahlen";

const MONATE = 6;

function zahl(wert: number | null, nachkomma = 0): string {
  if (wert === null) return "-";
  return wert.toLocaleString("de-DE", { maximumFractionDigits: nachkomma, minimumFractionDigits: nachkomma });
}

/**
 * Kennzahlen - messen, vergleichen, verbessern.
 *
 * Oben wird eingetragen, unten verglichen: das Teststudio gegen den
 * Durchschnitt der übrigen. Der Durchschnitt je Studio und nicht die Summe,
 * damit ein Studio mit 100 Mitgliedern gegen 13 andere nicht wie ein
 * Zwerg aussieht.
 *
 * Die Kündigungsquote ist die eigentliche Zahl: Kündigungen geteilt durch
 * Mitglieder. Ein großes Studio hat mehr Kündigungen als ein kleines,
 * ohne dass es etwas schlechter macht.
 */
export default async function KennzahlenPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const admin = await verlangeAdmin();
  const params = await searchParams;
  const eingeschraenkt = studioEinschraenkung(admin);

  const studios = await prisma.studioLocation.findMany({
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" },
  });
  const eigene = eingeschraenkt ? studios.filter((s) => s.id === eingeschraenkt) : studios;

  // Vorschlag zum Eintragen: der Vormonat - Monatszahlen gibt es erst,
  // wenn der Monat vorbei ist.
  const heute = new Date();
  const vormonat = new Date(Date.UTC(heute.getUTCFullYear(), heute.getUTCMonth() - 1, 1));
  const monat = monatAusText(param(params, "monat")) ?? vormonat;
  const eintragStudio = eingeschraenkt ?? (param(params, "studio") || eigene[0]?.id || "");

  const teststudio =
    param(params, "test") || studios.find((s) => /hürth/i.test(s.name))?.id || studios[0]?.id || "";

  const monate = letzteMonate(MONATE, heute);
  const [vorhanden, zahlen, gutscheine, umfragen] = await Promise.all([
    prisma.kennzahl.findUnique({
      where: { studioId_monat: { studioId: eintragStudio, monat } },
    }),
    prisma.kennzahl.findMany({ where: { monat: { gte: monate[0] } } }),
    prisma.gutschein.findMany({
      where: { ausgestelltAm: { gte: monate[0] } },
      select: { studioId: true, ausgestelltAm: true },
    }),
    prisma.mitglied.findMany({
      where: { umfrageAm: { gte: monate[0] } },
      select: { studioId: true, umfrageAm: true, umfrageNote: true },
    }),
  ]);

  const imMonat = (datum: Date | null, m: Date) =>
    !!datum && datum.getUTCFullYear() === m.getUTCFullYear() && datum.getUTCMonth() === m.getUTCMonth();

  const andere = studios.filter((s) => s.id !== teststudio).map((s) => s.id);

  /** Wert des Teststudios und Schnitt der übrigen für ein Feld und einen Monat. */
  function vergleich(feld: KennzahlFeld, m: Date) {
    const imMonatZahlen = zahlen.filter((z) => z.monat.getTime() === m.getTime());
    const test = imMonatZahlen.find((z) => z.studioId === teststudio)?.[feld] ?? null;
    const rest = schnitt(imMonatZahlen.filter((z) => andere.includes(z.studioId)).map((z) => z[feld]));
    return { test, rest };
  }

  function quoteVergleich(m: Date) {
    const imMonatZahlen = zahlen.filter((z) => z.monat.getTime() === m.getTime());
    const t = imMonatZahlen.find((z) => z.studioId === teststudio);
    return {
      test: t ? quote(t.kuendigungen, t.mitglieder) : null,
      rest: schnitt(
        imMonatZahlen
          .filter((z) => andere.includes(z.studioId))
          .map((z) => quote(z.kuendigungen, z.mitglieder)),
      ),
    };
  }

  function gutscheinVergleich(m: Date) {
    const im = gutscheine.filter((g) => imMonat(g.ausgestelltAm, m));
    const test = im.filter((g) => g.studioId === teststudio).length;
    const rest = andere.length ? im.filter((g) => g.studioId && andere.includes(g.studioId)).length / andere.length : null;
    return { test, rest };
  }

  function umfrageVergleich(m: Date) {
    const im = umfragen.filter((u) => imMonat(u.umfrageAm, m));
    return {
      test: schnitt(im.filter((u) => u.studioId === teststudio).map((u) => u.umfrageNote)),
      rest: schnitt(im.filter((u) => u.studioId && andere.includes(u.studioId)).map((u) => u.umfrageNote)),
    };
  }

  // Das Teststudio hat ganze Zahlen, der Durchschnitt der anderen nicht -
  // deshalb zwei Angaben zu den Nachkommastellen.
  const zeilen: {
    label: string;
    werte: (m: Date) => { test: number | null; rest: number | null };
    nachkommaTest: number;
    einheit?: string;
  }[] = [
    { label: "Kündigungsquote", werte: quoteVergleich, nachkommaTest: 1, einheit: "%" },
    ...KENNZAHL_FELDER.map(({ feld, label }) => ({
      label,
      werte: (m: Date) => vergleich(feld, m),
      nachkommaTest: 0,
    })),
    { label: "Gutscheine verkauft", werte: gutscheinVergleich, nachkommaTest: 0 },
    { label: "Umfrage Ø (1-5)", werte: umfrageVergleich, nachkommaTest: 1 },
  ];

  const testName = studios.find((s) => s.id === teststudio)?.name ?? "Teststudio";

  return (
    <AdminPage
      title="Kennzahlen"
      description="Messen, vergleichen, verbessern: das Teststudio gegen den Durchschnitt der anderen."
    >
      <Panel className="mb-6">
        <p className="flex items-start gap-2.5 text-sm">
          <Info size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span>
            Mitglieder, Zugänge und Kündigungen stehen in LogX unter{" "}
            <strong>Statistik → Kennzahlen</strong> (Monatsansicht). Pausen, Gespräche und
            Zusatzverkäufe kommen von der Strichliste. Gutscheine und Umfragenoten rechnet die
            Website selbst. Ein leeres Feld heißt „nicht erfasst“ - nicht null.
          </span>
        </p>
      </Panel>

      <AdminSection title="Zahlen eintragen">
        <Panel highlight>
          <form className="mb-4 flex flex-wrap items-end gap-3">
            {!eingeschraenkt && eigene.length > 1 && (
              <label className="block">
                <span className="mb-1 block text-xs text-muted">Studio</span>
                <select name="studio" defaultValue={eintragStudio} className={adminInput}>
                  {eigene.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-xs text-muted">Monat</span>
              <input type="month" name="monat" defaultValue={monatAlsText(monat)} className={adminInput} />
            </label>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime"
            >
              Öffnen
            </button>
          </form>

          <AdminForm action={kennzahlSpeichern} className="space-y-3">
            <input type="hidden" name="studioId" value={eintragStudio} />
            <input type="hidden" name="monat" value={monatAlsText(monat)} />
            <div className="grid gap-3 sm:grid-cols-3">
              {KENNZAHL_FELDER.map(({ feld, label, quelle, hinweis }) => (
                <label key={feld} className="block">
                  <span className="mb-1 block text-xs text-muted">
                    {label} <span className="opacity-70">({quelle}{hinweis ? `, ${hinweis}` : ""})</span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    name={feld}
                    defaultValue={vorhanden?.[feld] ?? ""}
                    className={adminInput}
                  />
                </label>
              ))}
            </div>
            <SubmitButton variant="primary">
              Speichern für {studios.find((s) => s.id === eintragStudio)?.name} · {monatName(monat)}
            </SubmitButton>
          </AdminForm>
        </Panel>
      </AdminSection>

      <AdminSection
        title={`Vergleich: ${testName} gegen die anderen`}
        description="Links der Wert des Teststudios, rechts der Durchschnitt je Studio der übrigen."
        className="mt-8"
      >
        {admin.istLeitung && studios.length > 1 && (
          <FilterChips
            basis="/admin/kennzahlen"
            params={params}
            name="test"
            optionen={studios.map((s) => ({ wert: s.id, label: s.name }))}
            klasse="mb-4"
          />
        )}
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4 font-medium">Kennzahl</th>
                {monate.map((m) => (
                  <th key={m.toISOString()} className="py-2 pr-4 text-right font-medium">
                    {monatName(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zeilen.map((zeile) => (
                <tr key={zeile.label} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 font-medium">{zeile.label}</td>
                  {monate.map((m) => {
                    const { test, rest } = zeile.werte(m);
                    return (
                      <td key={m.toISOString()} className="py-2 pr-4 text-right tabular-nums">
                        <span className="font-semibold text-accent">
                          {zahl(test, zeile.nachkommaTest)}
                          {test !== null && zeile.einheit}
                        </span>
                        <span className="text-muted">
                          {" "}
                          | {zahl(rest, 1)}
                          {rest !== null && zeile.einheit}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <p className="mt-3 text-xs text-muted">
          Ein Monat allein sagt wenig. Aussagekräftig wird es, wenn das Teststudio über drei Monate
          hinweg anders läuft als der Rest - und vorher nicht.
        </p>
      </AdminSection>
    </AdminPage>
  );
}
