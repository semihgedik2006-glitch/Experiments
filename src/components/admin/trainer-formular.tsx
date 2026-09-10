import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { adminInput } from "@/components/admin/ui";
import { trainerAendern, trainerAnlegen, trainerLoeschen } from "@/lib/actions/admin-trainer";
import { TrainerBild } from "@/components/studio/trainer-bild";

export type TrainerDaten = {
  id: string;
  name: string;
  rolle: string | null;
  qualifikation: string | null;
  text: string | null;
  fotoUrl: string | null;
  aktiv: boolean;
  sortOrder: number;
};

/**
 * Ein Trainerprofil anlegen oder ändern.
 *
 * Dasselbe Formular für beides: Ein getrenntes Anlege- und
 * Bearbeitungsformular sind zwei Stellen, an denen ein neues Feld vergessen
 * werden kann - und genau das passiert dann auch.
 *
 * Das Foto steht als Adresse da und wird nicht hochgeladen. Das ist
 * dieselbe Lösung wie beim Titelbild eines Blogbeitrags: Solange es keine
 * Dateiablage gibt, wäre ein Hochladeknopf ein Versprechen, das die Seite
 * nicht halten kann.
 */
export function TrainerFormular({
  studioId,
  trainer,
}: {
  studioId: string;
  /** Ohne Angabe ist es ein Anlege-Formular. */
  trainer?: TrainerDaten;
}) {
  const neu = !trainer;

  return (
    <AdminForm
      action={neu ? trainerAnlegen : trainerAendern}
      resetOnSuccess={neu}
      className="space-y-3"
    >
      {neu ? (
        <input type="hidden" name="studioId" value={studioId} />
      ) : (
        <input type="hidden" name="id" value={trainer.id} />
      )}

      <div className="flex flex-wrap gap-3">
        {!neu && (
          <TrainerBild name={trainer.name} fotoUrl={trainer.fotoUrl} groesse="klein" />
        )}
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Name</span>
            <input
              type="text"
              name="name"
              required
              defaultValue={trainer?.name}
              placeholder="Lena Hoffmann"
              className={adminInput}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Rolle</span>
            <input
              type="text"
              name="rolle"
              defaultValue={trainer?.rolle ?? ""}
              placeholder="Studioleitung"
              className={adminInput}
            />
          </label>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Qualifikation</span>
        <input
          type="text"
          name="qualifikation"
          defaultValue={trainer?.qualifikation ?? ""}
          placeholder="EMS-Trainerin, B-Lizenz Fitness"
          className={adminInput}
        />
        {/* Der Hinweis steht hier und nicht in einer Anleitung: Eine
            Qualifikation zu nennen, die jemand nicht hat, ist Werbung mit
            einer falschen Angabe - und das fällt auf den Standort zurück. */}
        <span className="mt-1 block text-xs text-muted">
          Nur eintragen, was tatsächlich vorliegt.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Zwei, drei Sätze</span>
        <textarea
          name="text"
          rows={3}
          defaultValue={trainer?.text ?? ""}
          placeholder="Kommt aus der Physiotherapie und achtet darauf, dass die Haltung stimmt, bevor die Intensität steigt."
          className={adminInput}
        />
        <span className="mt-1 block text-xs text-muted">
          Was diesen Menschen ausmacht - nicht, was EMS ist. Das steht auf
          jeder anderen Seite schon.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Foto (Adresse)</span>
        <input
          type="url"
          name="fotoUrl"
          defaultValue={trainer?.fotoUrl ?? ""}
          placeholder="https://..."
          className={adminInput}
        />
        <span className="mt-1 block text-xs text-muted">
          Ohne Foto erscheinen die Anfangsbuchstaben. Am besten ein
          quadratisches Bild, mindestens 400 Pixel.
        </span>
      </label>

      <div className="flex flex-wrap items-end gap-4">
        <label className="block w-28">
          <span className="mb-1 block text-xs text-muted">Reihenfolge</span>
          <input
            type="number"
            name="sortOrder"
            defaultValue={trainer?.sortOrder ?? ""}
            placeholder="10"
            className={adminInput}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="aktiv"
            defaultChecked={trainer?.aktiv ?? true}
            className="accent-lime"
          />
          Auf der Standortseite zeigen
        </label>
      </div>

      <SubmitButton>{neu ? "Anlegen" : "Speichern"}</SubmitButton>
    </AdminForm>
  );
}

/** Der Löschknopf. Steht bewusst getrennt vom Bearbeitungsformular. */
export function TrainerLoeschen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await trainerLoeschen(id);
      }}
    >
      <ConfirmButton
        variant="link"
        question={`Profil von ${name} löschen?`}
        confirmLabel="Ja, löschen"
      />
    </form>
  );
}
