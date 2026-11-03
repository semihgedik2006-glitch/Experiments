"use client";

import { useActionState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { adminInput } from "@/components/admin/ui";
import {
  mitgliedAendern,
  mitgliedAnlegen,
  mitgliederImportieren,
  type ImportErgebnis,
} from "@/lib/actions/admin-mitglieder";

type Studio = { id: string; name: string };

export type MitgliedDaten = {
  id: string;
  email: string | null;
  studioId: string | null;
  /** "2026-11-02" oder "" */
  vertragsbeginn: string;
  laufzeitMonate: number | null;
  werbungErlaubt: boolean;
};

function StudioWahl({
  studios,
  studioId,
  istLeitung,
  leerErlaubt,
}: {
  studios: Studio[];
  studioId: string | null;
  istLeitung: boolean;
  leerErlaubt: boolean;
}) {
  if (!istLeitung || studios.length <= 1) {
    return <input type="hidden" name="studioId" value={studioId ?? studios[0]?.id ?? ""} />;
  }
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">Studio</span>
      <select name="studioId" defaultValue={studioId ?? ""} className={adminInput}>
        {leerErlaubt && <option value="">Noch keinem Studio zugeordnet</option>}
        {studios.map((studio) => (
          <option key={studio.id} value={studio.id}>
            {studio.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function VertragsFelder({ daten }: { daten?: MitgliedDaten }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs text-muted">Vertragsbeginn</span>
        <input
          type="date"
          name="vertragsbeginn"
          defaultValue={daten?.vertragsbeginn ?? ""}
          className={adminInput}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">Erstlaufzeit</span>
        <select
          name="laufzeitMonate"
          defaultValue={String(daten?.laufzeitMonate ?? "")}
          className={adminInput}
        >
          <option value="">unbekannt</option>
          <option value="24">24 Monate</option>
          <option value="12">12 Monate</option>
        </select>
      </label>
    </div>
  );
}

function WerbungFeld({ an }: { an?: boolean }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" name="werbungErlaubt" defaultChecked={an ?? false} className="mt-1 accent-lime" />
      <span>
        Werbung per E-Mail erlaubt (Angebote, Umfrage, Jubiläum)
        <span className="block text-xs text-muted">
          Nur ankreuzen, wenn eine Einwilligung vorliegt (unterschriebener Zettel oder
          Anmeldeformular mit Kästchen).
        </span>
      </span>
    </label>
  );
}

/** Ein neues Mitglied - bei Vertragsabschluss, zusätzlich zu LogX. */
export function MitgliedNeu({
  studios,
  studioId,
  istLeitung,
}: {
  studios: Studio[];
  studioId: string | null;
  istLeitung: boolean;
}) {
  return (
    <AdminForm action={mitgliedAnlegen} resetOnSuccess className="space-y-3">
      <StudioWahl studios={studios} studioId={studioId} istLeitung={istLeitung} leerErlaubt={false} />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Vorname</span>
          <input type="text" name="vorname" required className={adminInput} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Nachname</span>
          <input type="text" name="nachname" required className={adminInput} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Kundennummer in LogX</span>
          <input type="text" name="logxNummer" inputMode="numeric" className={adminInput} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-muted">E-Mail</span>
        <input type="email" name="email" className={adminInput} />
      </label>
      <VertragsFelder />
      <WerbungFeld />
      <SubmitButton variant="primary" savedLabel="Eingetragen">
        Mitglied eintragen
      </SubmitButton>
    </AdminForm>
  );
}

export function MitgliedBearbeiten({
  daten,
  studios,
  istLeitung,
}: {
  daten: MitgliedDaten;
  studios: Studio[];
  istLeitung: boolean;
}) {
  return (
    <AdminForm action={mitgliedAendern} className="space-y-3">
      <input type="hidden" name="id" value={daten.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">E-Mail</span>
          <input type="email" name="email" defaultValue={daten.email ?? ""} className={adminInput} />
        </label>
        <StudioWahl studios={studios} studioId={daten.studioId} istLeitung={istLeitung} leerErlaubt />
      </div>
      <VertragsFelder daten={daten} />
      <WerbungFeld an={daten.werbungErlaubt} />
      <SubmitButton>Speichern</SubmitButton>
    </AdminForm>
  );
}

/**
 * Der Import der LogX-Adressliste.
 *
 * Mit Rückmeldung, was passiert ist - und was bewusst nicht übernommen
 * wurde. Gerade das Zweite beruhigt: Die Trainingsnotizen stehen in
 * derselben Datei, und wer sie hochlädt, will wissen, dass sie nicht auf
 * der Website landen.
 */
export function MitgliederImport({
  studios,
  studioId,
  istLeitung,
}: {
  studios: Studio[];
  studioId: string | null;
  istLeitung: boolean;
}) {
  const [ergebnis, aktion, laeuft] = useActionState<ImportErgebnis | undefined, FormData>(
    mitgliederImportieren,
    undefined,
  );

  return (
    <form action={aktion} className="space-y-3">
      <StudioWahl studios={studios} studioId={studioId} istLeitung={istLeitung} leerErlaubt />
      <label className="block">
        <span className="mb-1 block text-xs text-muted">
          Datei aus LogX: Einstellungen → Funktionen → Export → „Adressen im Excel-Format“ (oder CSV)
        </span>
        <input
          type="file"
          name="datei"
          accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          required
          className={`${adminInput} file:mr-3 file:rounded-full file:border-0 file:bg-lime/15 file:px-3 file:py-1 file:text-xs file:font-semibold`}
        />
      </label>
      <button
        type="submit"
        disabled={laeuft}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime disabled:opacity-60"
      >
        {laeuft ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <FileSpreadsheet size={14} aria-hidden />}
        {laeuft ? "Wird eingelesen..." : "Datei einlesen"}
      </button>

      {ergebnis && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm ${ergebnis.ok ? "border-lime/50" : "border-danger/50 text-danger"}`}
        >
          <p className="font-semibold">{ergebnis.meldung}</p>
          {ergebnis.details && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
              {ergebnis.details.map((zeile) => (
                <li key={zeile}>{zeile}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
