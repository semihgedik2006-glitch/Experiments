import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { adminInput } from "@/components/admin/ui";
import {
  empfehlungAendern,
  empfehlungAnlegen,
  empfehlungLoeschen,
  praemieUmschalten,
} from "@/lib/actions/admin-empfehlungen";

export type EmpfehlungDaten = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  praemie: string | null;
  notiz: string | null;
  aktiv: boolean;
};

/**
 * Einen Empfehlungscode anlegen oder ändern.
 *
 * Das Codefeld darf beim Anlegen leer bleiben - dann entsteht ein
 * Vorschlag aus dem Namen ("Lena Hoffmann" wird zu "LENA-H"). Ein Code,
 * den niemand am Telefon diktieren kann, wird nicht weitergegeben, und
 * genau das ist der einzige Weg, auf dem er unter Leute kommt.
 */
export function EmpfehlungFormular({
  studioId,
  eintrag,
  studios,
  istLeitung,
}: {
  /** Vorausgewählter Standort beim Anlegen. */
  studioId: string | null;
  eintrag?: EmpfehlungDaten;
  studios: { id: string; name: string }[];
  istLeitung: boolean;
}) {
  const neu = !eintrag;

  return (
    <AdminForm
      action={neu ? empfehlungAnlegen : empfehlungAendern}
      resetOnSuccess={neu}
      className="space-y-3"
    >
      {neu ? (
        // Beim Anlegen muss der Standort mit - beim Ändern kommt er aus
        // dem Datensatz, damit er sich nicht über das Formular umbiegen
        // lässt.
        istLeitung && studios.length > 1 ? (
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Standort des Mitglieds</span>
            <select name="studioId" defaultValue={studioId ?? ""} className={adminInput}>
              <option value="">Kein bestimmter Standort</option>
              {studios.map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="studioId" value={studioId ?? ""} />
        )
      ) : (
        <input type="hidden" name="id" value={eintrag.id} />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Name des Mitglieds</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={eintrag?.name}
            placeholder="Lena Hoffmann"
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Code</span>
          <input
            type="text"
            name="code"
            defaultValue={eintrag?.code ?? ""}
            placeholder={neu ? "wird aus dem Namen gebildet" : ""}
            autoCapitalize="characters"
            className={`${adminInput} uppercase placeholder:normal-case`}
          />
          <span className="mt-1 block text-xs text-muted">
            {neu
              ? "Leer lassen genügt - dann schlagen wir einen vor."
              : "Ein geänderter Code macht jeden weitergegebenen Zettel ungültig."}
          </span>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">E-Mail (freiwillig)</span>
          <input
            type="email"
            name="email"
            defaultValue={eintrag?.email ?? ""}
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Telefon (freiwillig)</span>
          <input
            type="tel"
            name="phone"
            defaultValue={eintrag?.phone ?? ""}
            className={adminInput}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Prämie</span>
        <input
          type="text"
          name="praemie"
          defaultValue={eintrag?.praemie ?? ""}
          placeholder="eine Freieinheit"
          className={adminInput}
        />
        <span className="mt-1 block text-xs text-muted">
          Freier Text. Steht nur intern - der Geworbene sieht sie nie.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Vermerk (freiwillig)</span>
        <input
          type="text"
          name="notiz"
          defaultValue={eintrag?.notiz ?? ""}
          className={adminInput}
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="aktiv"
          defaultChecked={eintrag?.aktiv ?? true}
          className="accent-lime"
        />
        Code gilt
      </label>

      <SubmitButton>{neu ? "Code anlegen" : "Speichern"}</SubmitButton>
    </AdminForm>
  );
}

export function EmpfehlungLoeschen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await empfehlungLoeschen(id);
      }}
    >
      <ConfirmButton
        variant="link"
        question={`Code von ${name} löschen? Die geworbenen Anfragen bleiben bestehen.`}
        confirmLabel="Ja, löschen"
      />
    </form>
  );
}

/** Prämie als abgerechnet markieren - oder die Markierung zurücknehmen. */
export function PraemieKnopf({
  bookingId,
  gutgeschrieben,
}: {
  bookingId: string;
  gutgeschrieben: boolean;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await praemieUmschalten(bookingId);
      }}
    >
      <SubmitButton variant="link">
        {gutgeschrieben ? "Markierung zurücknehmen" : "Prämie gutgeschrieben"}
      </SubmitButton>
    </form>
  );
}
