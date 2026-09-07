import { prisma } from "@/lib/prisma";
import { createStudio, updateStudio, deleteStudio } from "@/lib/actions/admin-studios";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AlertTriangle } from "lucide-react";
import { StudioImport } from "@/components/admin/studio-import";
import { OpeningHoursImport } from "@/components/admin/opening-hours-import";

const inputClass =
  "w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime";

function StudioFields({
  defaults,
}: {
  defaults?: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    mapEmbedUrl: string;
    openingHours: string;
    latitude: number | null;
    longitude: number | null;
    sortOrder: number;
  };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input type="text" name="name" required placeholder="Studio-Name (z.B. Körperformen Hürth)" defaultValue={defaults?.name} className={`${inputClass} sm:col-span-2`} />
      <input type="text" name="street" required placeholder="Straße + Hausnummer" defaultValue={defaults?.street} className={inputClass} />
      <div className="grid grid-cols-[110px_1fr] gap-3">
        <input type="text" name="postalCode" required placeholder="PLZ" defaultValue={defaults?.postalCode} className={inputClass} />
        <input type="text" name="city" required placeholder="Stadt" defaultValue={defaults?.city} className={inputClass} />
      </div>
      <input type="tel" name="phone" placeholder="Telefon" defaultValue={defaults?.phone} className={inputClass} />
      <input type="email" name="email" placeholder="E-Mail" defaultValue={defaults?.email} className={inputClass} />
      <input
        type="url"
        name="mapEmbedUrl"
        placeholder="Google-Maps-Embed-URL (Teilen → Karte einbetten → src=...)"
        defaultValue={defaults?.mapEmbedUrl}
        className={`${inputClass} sm:col-span-2`}
      />
      <textarea
        name="openingHours"
        rows={3}
        placeholder={"Öffnungszeiten, z.B.:\nMontag - Freitag: 08:00 - 21:00 Uhr\nSamstag: 10:00 - 16:00 Uhr"}
        defaultValue={defaults?.openingHours}
        className={`${inputClass} sm:col-span-2`}
      />
      <div className="sm:col-span-2">
        <p className="mb-1.5 text-xs text-muted">
          Koordinaten (für &bdquo;nächstes Studio&ldquo; bei der Probetermin-Buchung) - in
          Google Maps mit Rechtsklick auf den Standort die Zahlen kopieren, z.B. 50.8800, 6.8817
        </p>
        {/* Ohne Koordinaten kann ein Studio bei der Standortabfrage nicht
            berücksichtigt werden. Das blieb vorher unbemerkt: Das Studio
            wurde stillschweigend übersprungen, und ein weiter entferntes
            bekam die Auszeichnung "Am nächsten". */}
        {defaults && (defaults.latitude === null || defaults.longitude === null) && (
          <p className="mb-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">
            Für dieses Studio fehlen die Koordinaten. Solange sie fehlen, schaltet sich
            die Standortabfrage bei der Probetermin-Buchung für alle Studios ab - denn
            welches am nächsten liegt, lässt sich dann nicht bestimmen.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="any"
            name="latitude"
            placeholder="Breitengrad (z.B. 50.8800)"
            defaultValue={defaults?.latitude ?? undefined}
            className={inputClass}
          />
          <input
            type="number"
            step="any"
            name="longitude"
            placeholder="Längengrad (z.B. 6.8817)"
            defaultValue={defaults?.longitude ?? undefined}
            className={inputClass}
          />
        </div>
      </div>
      <label className="text-xs text-muted">
        Position{" "}
        <input
          type="number"
          name="sortOrder"
          defaultValue={defaults?.sortOrder ?? 0}
          className="ml-1 w-24 rounded-lg border border-border bg-transparent px-2 py-1 text-sm outline-none focus:border-lime"
        />
      </label>
    </div>
  );
}

export default async function AdminStudiosPage() {
  const studios = await prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } });
  const ohneKoordinaten = studios.filter(
    (studio) => studio.latitude === null || studio.longitude === null,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Studios</h1>
      <p className="mt-2 text-sm text-muted">
        Diese Standorte erscheinen auf der Studio-Seite, der Startseite und der
        Kontaktseite. Kleinere Zahl bei &bdquo;Position&ldquo; = weiter oben; das oberste
        Studio wird im Impressum als Hauptsitz verwendet.
      </p>

      {/* Ganz oben, weil eine einzige Lücke die Standortabfrage für alle
          Studios abschaltet. Bisher stand der Hinweis nur beim betroffenen
          Studio - man musste also jedes einzeln aufklappen, um zu sehen,
          warum bei der Buchung immer dasselbe Studio zuerst erscheint. */}
      {ohneKoordinaten.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-500/50 bg-amber-500/10 p-5">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={17} />
            Die Standortabfrage ist derzeit abgeschaltet
          </p>
          <p className="mt-2 text-sm">
            {ohneKoordinaten.length === 1
              ? "Einem Studio fehlen die Koordinaten:"
              : `${ohneKoordinaten.length} Studios fehlen die Koordinaten:`}{" "}
            <strong>{ohneKoordinaten.map((studio) => studio.name).join(", ")}</strong>
          </p>
          <p className="mt-2 text-sm text-muted">
            Solange auch nur eines fehlt, lässt sich nicht bestimmen, welches am
            nächsten liegt - bei der Terminbuchung erscheinen die Studios dann in der
            Reihenfolge des Feldes &bdquo;Position&ldquo; statt nach Entfernung. Trage die
            fehlenden Koordinaten unten nach oder lösche das Studio.
          </p>
        </div>
      )}

      <div className="mt-8">
        <StudioImport />
      </div>

      <div className="mt-8">
        <OpeningHoursImport studios={studios.map((studio) => studio.name)} />
      </div>

      <form action={createStudio} className="mt-8 rounded-2xl border border-lime/40 bg-surface p-6">
        <h2 className="font-semibold">Neues Studio hinzufügen</h2>
        <div className="mt-4">
          <StudioFields />
        </div>
        <button className="mt-4 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90">
          Studio anlegen
        </button>
      </form>

      <AdminStagger className="mt-8 space-y-4">
        {studios.map((studio) => (
          <AdminStaggerItem key={studio.id}>
            <div className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-lime/30">
              <form action={updateStudio}>
                <input type="hidden" name="id" value={studio.id} />
                <StudioFields defaults={studio} />
                <button className="mt-4 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime">
                  Speichern
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await deleteStudio(studio.id);
                }}
                className="mt-2"
              >
                <button className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-500">
                  Löschen
                </button>
              </form>
            </div>
          </AdminStaggerItem>
        ))}
        {studios.length === 0 && (
          <p className="text-muted">Noch kein Studio angelegt - lege oben das erste an.</p>
        )}
      </AdminStagger>
    </div>
  );
}
