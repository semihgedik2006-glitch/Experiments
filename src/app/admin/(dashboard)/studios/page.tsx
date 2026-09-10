import { prisma } from "@/lib/prisma";
import { createStudio, updateStudio, deleteStudio } from "@/lib/actions/admin-studios";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AlertTriangle, Building2, ChevronRight } from "lucide-react";
import { StudioImport } from "@/components/admin/studio-import";
import { OpeningHoursImport } from "@/components/admin/opening-hours-import";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, EmptyState, StatusBadge, adminInput } from "@/components/admin/ui";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";

const inputClass = adminInput;

function StudioFields({
  defaults,
}: {
  defaults?: {
    slug: string;
    name: string;
    street: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    mapEmbedUrl: string;
    openingHours: string;
    whatsapp: string | null;
    googleReviewUrl: string | null;
    intro: string | null;
    anfahrt: string | null;
    latitude: number | null;
    longitude: number | null;
    sortOrder: number;
  };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input type="text" name="name" required placeholder="Studio-Name (z.B. Körperformen Hürth)" defaultValue={defaults?.name} className={`${inputClass} sm:col-span-2`} />

      {/* Nur beim Ändern: Beim Anlegen entsteht die Adresse aus dem Namen.
          Ein leeres Feld beim Anlegen auszufüllen wäre eine Aufgabe, die
          sich der Rechner selbst stellen kann. */}
      {defaults && (
        <label className="block sm:col-span-2">
          <span className="text-xs text-muted">
            Adresse der Standortseite &ndash; koerperformen.de/studio/
            <strong>{defaults.slug}</strong>
          </span>
          <input
            type="text"
            name="slug"
            defaultValue={defaults.slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={`${inputClass} mt-1`}
          />
          {/* Eine geänderte Adresse ist eine neue Seite. Wer das nicht
              weiß, verliert damit die Platzierung bei Google und alle
              Verweise, die schon irgendwo stehen. */}
          <span className="mt-1 block text-xs text-muted">
            Nur kleine Buchstaben, Ziffern und Bindestriche. Änderst du das, sind
            alle bisherigen Verweise auf diese Seite tot &ndash; auch der Eintrag
            bei Google. Also nur ändern, solange die Seite neu ist.
          </span>
        </label>
      )}
      <input type="text" name="street" required placeholder="Straße + Hausnummer" defaultValue={defaults?.street} className={inputClass} />
      <div className="grid grid-cols-[110px_1fr] gap-3">
        <input type="text" name="postalCode" required placeholder="PLZ" defaultValue={defaults?.postalCode} className={inputClass} />
        <input type="text" name="city" required placeholder="Stadt" defaultValue={defaults?.city} className={inputClass} />
      </div>
      <input type="tel" name="phone" placeholder="Telefon" defaultValue={defaults?.phone} className={inputClass} />
      <input type="email" name="email" placeholder="E-Mail" defaultValue={defaults?.email} className={inputClass} />

      {/* Getrennt vom Telefonfeld: Nicht jede Festnetznummer ist auch bei
          WhatsApp erreichbar, und ein Knopf, der in einem Konto landet,
          das niemand liest, ist schlimmer als keiner. Leer lassen heißt:
          kein WhatsApp-Knopf auf der Standortseite. */}
      <label className="block">
        <span className="text-xs text-muted">WhatsApp-Nummer (optional)</span>
        <input
          type="tel"
          name="whatsapp"
          defaultValue={defaults?.whatsapp ?? ""}
          placeholder="z.B. 0157 85090199"
          className={`${inputClass} mt-1`}
        />
      </label>

      <label className="block">
        <span className="text-xs text-muted">Google-Bewertungslink (optional)</span>
        <input
          type="url"
          name="googleReviewUrl"
          defaultValue={defaults?.googleReviewUrl ?? ""}
          placeholder="https://g.page/r/..."
          className={`${inputClass} mt-1`}
        />
        {/* Ohne diesen Link unterbleibt die Bitte um eine Bewertung. Eine
            Mail, die jemanden auf die Suche nach dem richtigen Profil
            schickt, bringt keine Bewertung. */}
        <span className="mt-1 block text-xs text-muted">
          Im Google-Unternehmensprofil unter &bdquo;Rezensionen&ldquo; &rarr;
          &bdquo;Mehr Rezensionen erhalten&ldquo;. Ohne diesen Link geht einen Tag
          nach dem Termin keine Bitte um eine Bewertung raus.
        </span>
      </label>
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

      {/* Die beiden Textfelder sind der eigentliche Wert der Standortseite.
          Ohne sie unterscheiden sich die vierzehn Seiten nur in Adresse und
          Öffnungszeiten - und fast gleiche Seiten wertet Google ab. */}
      <label className="block sm:col-span-2">
        <span className="text-xs text-muted">
          Text über diesen Standort &ndash; steht oben auf der Standortseite und im
          Suchergebnis
        </span>
        <textarea
          name="intro"
          rows={3}
          maxLength={600}
          defaultValue={defaults?.intro ?? ""}
          placeholder="Zwei, drei Sätze, die nur hier stimmen: Was zeichnet dieses Studio aus, wer trainiert hier, was gibt es in der Nähe?"
          className={`${inputClass} mt-1`}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-xs text-muted">
          Anfahrt &ndash; Parkplätze, Haltestelle, wo genau der Eingang ist
        </span>
        <textarea
          name="anfahrt"
          rows={3}
          maxLength={800}
          defaultValue={defaults?.anfahrt ?? ""}
          placeholder="z.B.: Direkt an der Haltestelle Nippes/Sebastianstraße. Parkplätze im Hof hinter dem Haus, Einfahrt neben der Bäckerei."
          className={`${inputClass} mt-1`}
        />
      </label>
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
          className={`${adminInput} ml-1 w-24`}
        />
      </label>
    </div>
  );
}

export default async function AdminStudiosPage() {
  const admin = await verlangeAdmin();
  const nurStudio = studioEinschraenkung(admin);

  const studios = await prisma.studioLocation.findMany({
    where: nurStudio ? { id: nurStudio } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  const ohneKoordinaten = studios.filter(
    (studio) => studio.latitude === null || studio.longitude === null,
  );

  return (
    <AdminPage
      title={admin.istLeitung ? "Studios" : "Dein Studio"}
      description={
        admin.istLeitung ? (
          <>
            Diese Standorte erscheinen auf der Studio-Seite, der Startseite und der
            Kontaktseite. Kleinere Zahl bei &bdquo;Position&ldquo; = weiter oben; das
            oberste Studio wird im Impressum als Hauptsitz verwendet.
          </>
        ) : (
          <>
            Adresse, Telefonnummer und Öffnungszeiten deines Standorts. Was du hier
            änderst, steht sofort auf der Website. Neue Standorte anlegen oder löschen
            kann nur die Leitung.
          </>
        )
      }
    >
      {/* Ganz oben, weil eine einzige Lücke die Standortabfrage für alle
          Studios abschaltet. Bisher stand der Hinweis nur beim betroffenen
          Studio - man musste also jedes einzeln aufklappen, um zu sehen,
          warum bei der Buchung immer dasselbe Studio zuerst erscheint. */}
      {ohneKoordinaten.length > 0 && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 sm:p-5">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={17} />
            {ohneKoordinaten.length === 1
              ? "Einem Studio fehlen die Koordinaten"
              : `${ohneKoordinaten.length} Studios fehlen die Koordinaten`}
          </p>
          <p className="mt-2 text-sm">
            <strong>{ohneKoordinaten.map((studio) => studio.name).join(", ")}</strong>
          </p>
          <p className="mt-2 text-sm text-muted">
            Diese Studios stehen bei der Terminbuchung immer am Ende der Liste, egal
            wie nah sie tatsächlich liegen. Außerdem entfällt die Auszeichnung
            &bdquo;Am nächsten&ldquo; für alle Studios - denn solange eines unverortet ist,
            könnte ausgerechnet dieses das nächste sein. Trage die Koordinaten unten
            nach oder lösche das Studio.
          </p>
        </div>
      )}

      {admin.istLeitung && (
        <>
          <div className="mt-6">
            <StudioImport />
          </div>

          <div className="mt-6">
            <OpeningHoursImport studios={studios.map((studio) => studio.name)} />
          </div>

          <AdminForm
            action={createStudio}
            resetOnSuccess
            className="admin-panel mt-6 border-lime/40 p-4 sm:p-5"
          >
            <h2 className="text-base font-semibold">Neues Studio hinzufügen</h2>
            <div className="mt-4">
              <StudioFields />
            </div>
            <div className="mt-4">
              <SubmitButton variant="primary" pendingLabel="Wird angelegt..." savedLabel="Angelegt">
                Studio anlegen
              </SubmitButton>
            </div>
          </AdminForm>
        </>
      )}

      {/* Eingeklappte Zeilen statt vierzehn offener Formulare untereinander.
          Bewusst das eingebaute <details> und kein eigener Aufklappmechanismus:
          Es braucht kein JavaScript, lässt sich mit der Tastatur bedienen und
          wird von der Sprachausgabe als aufklappbar angesagt. In die
          zugeklappte Zeile ist das gehoben, was man beim Durchsehen sucht -
          Name, Adresse, Position und ob Koordinaten oder E-Mail fehlen. */}
      <AdminStagger className="mt-6 space-y-2">
        {studios.map((studio) => {
          const fehlenKoordinaten = studio.latitude === null || studio.longitude === null;

          return (
            <AdminStaggerItem key={studio.id}>
              <details className="admin-panel group overflow-hidden" open={!admin.istLeitung}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-lime/5">
                  <ChevronRight
                    size={16}
                    aria-hidden
                    className="shrink-0 text-muted transition-transform group-open:rotate-90"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{studio.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {studio.street}, {studio.postalCode} {studio.city}
                    </span>
                  </span>
                  {fehlenKoordinaten && (
                    <StatusBadge ton="open">Koordinaten fehlen</StatusBadge>
                  )}
                  {!studio.email && <StatusBadge ton="idle">keine E-Mail</StatusBadge>}
                  <span className="text-xs text-muted">Pos. {studio.sortOrder}</span>
                </summary>

                <div className="border-t border-border p-4 sm:p-5">
                  <AdminForm action={updateStudio}>
                    <input type="hidden" name="id" value={studio.id} />
                    <StudioFields defaults={studio} />
                    <div className="mt-4">
                      <SubmitButton pendingLabel="Wird gespeichert...">Speichern</SubmitButton>
                    </div>
                  </AdminForm>
                  {admin.istLeitung && (
                    <form
                      action={async () => {
                        "use server";
                        await deleteStudio(studio.id);
                      }}
                      className="mt-2"
                    >
                      <ConfirmButton
                        question={`„${studio.name}“ wirklich löschen?`}
                        confirmLabel="Ja, Studio löschen"
                      />
                    </form>
                  )}
                </div>
              </details>
            </AdminStaggerItem>
          );
        })}
      </AdminStagger>

      {studios.length === 0 && (
        <div className="mt-6">
          {admin.istLeitung ? (
            <EmptyState icon={Building2} title="Noch kein Studio angelegt">
              Ohne Standort zeigt die Website keine Adresse, keine Öffnungszeiten und
              keine Termine an. Leg oben das erste Studio an - oder trag mehrere auf
              einmal über das Einfügefeld ein.
            </EmptyState>
          ) : (
            <EmptyState icon={Building2} title="Diesem Zugang ist kein Studio zugeordnet">
              Bitte wende dich an die Leitung - sie kann den Zugang unter
              &bdquo;Zugänge&ldquo; einem Standort zuweisen.
            </EmptyState>
          )}
        </div>
      )}
    </AdminPage>
  );
}
