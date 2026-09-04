import { prisma } from "@/lib/prisma";
import { createStudio, updateStudio, deleteStudio } from "@/lib/actions/admin-studios";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";

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

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Studios</h1>
      <p className="mt-2 text-sm text-muted">
        Diese Standorte erscheinen auf der Studio-Seite, der Startseite und der
        Kontaktseite. Kleinere Zahl bei &bdquo;Position&ldquo; = weiter oben; das oberste
        Studio wird im Impressum als Hauptsitz verwendet.
      </p>

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
