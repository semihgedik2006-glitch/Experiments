"use client";

import { useActionState } from "react";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { importStudios, type ImportResult } from "@/lib/actions/admin-studios";

const beispiel = `Körperformen Hürth; Krankenhausstr. 111; 50354; Hürth; +49 2233 9667181; info@koerperformen.com; 50.8800; 6.8817
Körperformen Köln; Hohe Str. 100; 50667; Köln; +49 221 1234567; koeln@koerperformen.com; 50.9375; 6.9603`;

/**
 * Sammel-Import für viele Standorte auf einmal.
 *
 * Bewusst schlicht gehalten: eine Zeile je Studio, Felder mit Semikolon
 * getrennt. Das lässt sich aus einer Tabelle heraus zusammenstellen und
 * spart bei der Ersteinrichtung vierzehn einzelne Formulare.
 */
export function StudioImport() {
  const [result, action, pending] = useActionState<ImportResult | null, FormData>(
    importStudios,
    null,
  );

  return (
    <form action={action} className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Upload size={17} className="text-accent" />
        Mehrere Studios auf einmal anlegen
      </h2>
      <p className="mt-2 text-sm text-muted">
        Eine Zeile je Studio, die Felder durch Semikolon getrennt:
      </p>
      <p className="mt-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs">
        Name; Straße Hausnr; PLZ; Ort; Telefon; E-Mail; Breitengrad; Längengrad
      </p>
      <p className="mt-2 text-xs text-muted">
        Die Koordinaten bekommst du in Google Maps mit einem Rechtsklick auf den
        Standort - die beiden Zahlen einfach kopieren. Ohne sie wird die Zeile
        übersprungen, weil ein Studio ohne Koordinaten die Standortabfrage bei
        der Terminbuchung für alle Studios abschaltet. Die Karte muss nicht
        hinterlegt werden; sie entsteht aus der Anschrift.
      </p>

      <textarea
        name="rows"
        rows={8}
        required
        defaultValue=""
        placeholder={beispiel}
        className="mt-4 w-full rounded-lg border border-border bg-transparent px-4 py-3 font-mono text-xs outline-none focus:border-lime"
      />

      <label className="mt-4 block text-sm">
        Öffnungszeiten für alle importierten Studios
        <textarea
          name="openingHours"
          rows={3}
          defaultValue={"Montag - Freitag: 08:00 - 21:00 Uhr\nSamstag: 10:00 - 16:00 Uhr\nSonntag: geschlossen"}
          className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
        />
        <span className="mt-1 block text-xs text-muted">
          Lassen sich anschließend je Studio einzeln anpassen.
        </span>
      </label>

      <button
        disabled={pending}
        className="mt-4 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Wird angelegt..." : "Studios anlegen"}
      </button>

      {result && (
        <div className="mt-4 space-y-2 text-sm">
          {result.added > 0 && (
            <p className="flex items-center gap-2 text-accent">
              <CheckCircle2 size={16} />
              {result.added === 1 ? "Ein Studio angelegt." : `${result.added} Studios angelegt.`}
            </p>
          )}
          {result.skipped.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="flex items-center gap-2 font-medium">
                <AlertTriangle size={16} />
                {result.skipped.length === 1
                  ? "Eine Zeile wurde übersprungen:"
                  : `${result.skipped.length} Zeilen wurden übersprungen:`}
              </p>
              <ul className="mt-1.5 list-inside list-disc text-xs text-muted">
                {result.skipped.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          )}
          {result.added === 0 && result.skipped.length === 0 && (
            <p className="text-muted">Keine Zeilen gefunden.</p>
          )}
        </div>
      )}
    </form>
  );
}
