import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { adminInput } from "@/components/admin/ui";
import {
  stimmeAendern,
  stimmeAnlegen,
  stimmeLoeschen,
} from "@/lib/actions/admin-kundenstimmen";

export type StimmeDaten = {
  id: string;
  name: string;
  text: string;
  ziel: string | null;
  monate: number | null;
  studioId: string | null;
  einwilligungAm: Date | null;
  einwilligungNotiz: string | null;
  aktiv: boolean;
  sortOrder: number;
};

/** Für das Datumsfeld: "2026-09-11", ohne Zeitzonenumweg über toISOString. */
function alsFeldwert(datum: Date | null): string {
  if (!datum) return "";
  const zwei = (n: number) => String(n).padStart(2, "0");
  return `${datum.getFullYear()}-${zwei(datum.getMonth() + 1)}-${zwei(datum.getDate())}`;
}

export function StimmeFormular({
  studios,
  stimme,
  studioFest,
}: {
  studios: { id: string; name: string }[];
  stimme?: StimmeDaten;
  studioFest?: string;
}) {
  const neu = !stimme;

  return (
    <AdminForm
      action={neu ? stimmeAnlegen : stimmeAendern}
      resetOnSuccess={neu}
      className="space-y-3"
    >
      {neu
        ? studioFest && <input type="hidden" name="studioId" value={studioFest} />
        : <input type="hidden" name="id" value={stimme.id} />}

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Das Zitat</span>
        <textarea
          name="text"
          rows={4}
          required
          defaultValue={stimme?.text ?? ""}
          placeholder="Nach Jahren mit Rückenschmerzen vom Bürojob sitze ich wieder aufrecht - und die 20 Minuten passen in meine Mittagspause."
          className={adminInput}
        />
        {/* Der Hinweis steht am wichtigsten Feld: Ein geglättetes Zitat
            klingt nach Werbetext, und genau daran erkennt man erfundene
            Bewertungen. */}
        <span className="mt-1 block text-xs leading-relaxed text-muted">
          In den Worten der Person, so wie sie es geschrieben hat. Nicht
          glattziehen - ein Zitat, das klingt wie ein Werbetext, wirkt wie
          einer.
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Name</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={stimme?.name}
            placeholder="Sandra K."
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Ziel (freiwillig)</span>
          <input
            type="text"
            name="ziel"
            defaultValue={stimme?.ziel ?? ""}
            placeholder="Rückengesundheit"
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Dabei seit (Monate)</span>
          <input
            type="number"
            name="monate"
            min={1}
            defaultValue={stimme?.monate ?? ""}
            placeholder="8"
            className={adminInput}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Zustimmung liegt vor seit</span>
          <input
            type="date"
            name="einwilligungAm"
            defaultValue={alsFeldwert(stimme?.einwilligungAm ?? null)}
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Vermerk dazu</span>
          <input
            type="text"
            name="einwilligungNotiz"
            defaultValue={stimme?.einwilligungNotiz ?? ""}
            placeholder="per WhatsApp geschickt, Screenshot in der Ablage"
            className={adminInput}
          />
        </label>
      </div>

      {neu && !studioFest && studios.length > 0 && (
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Standort</span>
          <select name="studioId" defaultValue="" className={adminInput}>
            <option value="">- kein bestimmter Standort -</option>
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <label className="block w-28">
          <span className="mb-1 block text-xs text-muted">Reihenfolge</span>
          <input
            type="number"
            name="sortOrder"
            defaultValue={stimme?.sortOrder ?? ""}
            placeholder="10"
            className={adminInput}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          {/* Voreinstellung aus, wie beim Vorher-Nachher-Bereich: Eine
              Kundenstimme erscheint erst, wenn jemand sie bewusst
              freigibt. */}
          <input
            type="checkbox"
            name="aktiv"
            defaultChecked={stimme?.aktiv ?? false}
            className="accent-lime"
          />
          Auf der Website zeigen
        </label>
      </div>

      <SubmitButton>{neu ? "Anlegen" : "Speichern"}</SubmitButton>
    </AdminForm>
  );
}

export function StimmeLoeschen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await stimmeLoeschen(id);
      }}
    >
      <ConfirmButton
        variant="link"
        question={`Stimme von ${name} löschen?`}
        confirmLabel="Ja, löschen"
      />
    </form>
  );
}
