import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { adminInput } from "@/components/admin/ui";
import { EINWILLIGUNG_FORMEN } from "@/lib/verwandlung";
import {
  verwandlungAendern,
  verwandlungAnlegen,
  verwandlungLoeschen,
  verwandlungVerbergen,
} from "@/lib/actions/admin-verwandlungen";

export type VerwandlungDaten = {
  id: string;
  name: string;
  zeitraum: string;
  kontext: string;
  text: string | null;
  vorherUrl: string;
  nachherUrl: string;
  studioId: string | null;
  einwilligungAm: Date | null;
  einwilligungForm: string | null;
  einwilligungNotiz: string | null;
  aktiv: boolean;
  sortOrder: number;
};

/** Für das Datumsfeld: "2026-09-11". Ohne Zeitzonenumweg über toISOString. */
function alsFeldwert(datum: Date | null): string {
  if (!datum) return "";
  const zwei = (n: number) => String(n).padStart(2, "0");
  return `${datum.getFullYear()}-${zwei(datum.getMonth() + 1)}-${zwei(datum.getDate())}`;
}

/**
 * Ein Vorher-Nachher-Paar anlegen oder ändern.
 *
 * Die Reihenfolge der Felder ist Absicht und nicht alphabetisch: Zuerst
 * die Einwilligung, dann die Bilder, dann der Text. Wer das Formular von
 * oben nach unten ausfüllt, stolpert damit über die Frage „liegt die
 * Einwilligung vor?“, bevor er das erste Bild einträgt - und nicht
 * danach.
 */
export function VerwandlungFormular({
  studios,
  eintrag,
  studioFest,
}: {
  studios: { id: string; name: string }[];
  /** Ohne Angabe ist es ein Anlege-Formular. */
  eintrag?: VerwandlungDaten;
  /** Für eine Studioleitung: Der Standort steht fest und wird mitgeschickt. */
  studioFest?: string;
}) {
  const neu = !eintrag;

  return (
    <AdminForm
      action={neu ? verwandlungAnlegen : verwandlungAendern}
      resetOnSuccess={neu}
      className="space-y-4"
    >
      {/* Beim Anlegen kommt der Standort entweder fest hierher (dann gibt
          es unten keine Auswahl) oder aus der Auswahl weiter unten. Beides
          zugleich wären zwei Felder gleichen Namens - und gelesen würde
          das erste, also immer das leere. */}
      {neu
        ? studioFest && <input type="hidden" name="studioId" value={studioFest} />
        : <input type="hidden" name="id" value={eintrag.id} />}

      <fieldset className="rounded-xl border border-border p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-accent">
          Einwilligung
        </legend>
        {/* Der Hinweis steht im Formular und nicht in einer Anleitung:
            Eine Anleitung liest man einmal, dieses Feld sieht man bei
            jedem Eintrag. */}
        <p className="mb-3 text-xs leading-relaxed text-muted">
          Ohne Datum lässt sich der Eintrag nicht veröffentlichen - das Häkchen
          unten wird beim Speichern zurückgesetzt. Die Einwilligung selbst
          gehört in eure Ablage, hier steht nur der Vermerk dazu.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Einwilligung liegt vor seit</span>
            <input
              type="date"
              name="einwilligungAm"
              defaultValue={alsFeldwert(eintrag?.einwilligungAm ?? null)}
              className={adminInput}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">In welcher Form</span>
            <select
              name="einwilligungForm"
              defaultValue={eintrag?.einwilligungForm ?? ""}
              className={adminInput}
            >
              <option value="">- bitte wählen -</option>
              {EINWILLIGUNG_FORMEN.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-muted">Wo liegt sie?</span>
          <input
            type="text"
            name="einwilligungNotiz"
            defaultValue={eintrag?.einwilligungNotiz ?? ""}
            placeholder="Ordner „Einwilligungen 2026“, Studio Ehrenfeld"
            className={adminInput}
          />
        </label>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Bild vorher (Adresse)</span>
          <input
            type="url"
            name="vorherUrl"
            defaultValue={eintrag?.vorherUrl ?? ""}
            placeholder="https://..."
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Bild nachher (Adresse)</span>
          <input
            type="url"
            name="nachherUrl"
            defaultValue={eintrag?.nachherUrl ?? ""}
            placeholder="https://..."
            className={adminInput}
          />
        </label>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Beide Bilder möglichst gleich aufgenommen: gleicher Abstand, gleiches
        Licht, gleiche Haltung. Sonst zeigt der Vergleich vor allem den
        Unterschied zwischen zwei Fotos. Hochformat, mindestens 800 Pixel breit.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Vorname</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={eintrag?.name}
            placeholder="Sandra"
            className={adminInput}
          />
          <span className="mt-1 block text-xs text-muted">
            Nur der Vorname oder die Initialen - der volle Name steht sonst für
            immer in Suchmaschinen.
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Zeitraum</span>
          <input
            type="text"
            name="zeitraum"
            required
            defaultValue={eintrag?.zeitraum}
            placeholder="9 Monate, Januar bis September 2026"
            className={adminInput}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Was gehörte dazu?</span>
        <input
          type="text"
          name="kontext"
          required
          defaultValue={eintrag?.kontext}
          placeholder="1x pro Woche EMS, dazu Ernährungsberatung und zweimal wöchentlich Schwimmen"
          className={adminInput}
        />
        {/* Die beiden Beispiele sind der ganze Punkt dieses Pakets - ein
            abstrakter Hinweis auf "Irreführung" würde niemanden davon
            abhalten, einfach "durch EMS" zu schreiben. */}
        <span className="mt-1 block text-xs leading-relaxed text-muted">
          Ehrlich: „1x pro Woche EMS, dazu Ernährungsumstellung“. Nicht ehrlich:
          „allein durch EMS“, wenn das nicht stimmt. Wer nebenher etwas anderes
          geändert hat, muss das hier stehen haben.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">In eigenen Worten (freiwillig)</span>
        <textarea
          name="text"
          rows={3}
          defaultValue={eintrag?.text ?? ""}
          placeholder="Ich habe vor allem gemerkt, dass der Rücken beim Sitzen nicht mehr zumacht."
          className={adminInput}
        />
      </label>

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
            defaultValue={eintrag?.sortOrder ?? ""}
            placeholder="10"
            className={adminInput}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="aktiv"
            // Voreinstellung aus: Bei jedem anderen Inhalt wäre das
            // umständlich, hier ist es der Sinn der Sache.
            defaultChecked={eintrag?.aktiv ?? false}
            className="accent-lime"
          />
          Auf der Seite zeigen
        </label>
      </div>

      <SubmitButton>{neu ? "Anlegen" : "Speichern"}</SubmitButton>
    </AdminForm>
  );
}

/**
 * Sofort aus der Anzeige nehmen.
 *
 * Ein eigener Knopf neben dem Formular, weil das der eilige Fall ist:
 * Widerruft jemand seine Einwilligung, muss das Bild weg sein, bevor
 * jemand acht Felder ausgefüllt und auf Speichern geklickt hat.
 */
export function VerwandlungVerbergen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await verwandlungVerbergen(id);
      }}
    >
      {/* Beschriftung, Symbol und Wartetext müssen alle gesetzt werden:
          Sonst stünde hier die Voreinstellung „Löschen“ mit Mülleimer -
          also zweimal derselbe Knopf nebeneinander, von denen einer etwas
          ganz anderes tut. */}
      <ConfirmButton
        variant="link"
        icon="keins"
        label="Sofort ausblenden"
        question={`Bilder von ${name} sofort ausblenden?`}
        confirmLabel="Ja, ausblenden"
        pendingLabel="Wird ausgeblendet..."
      />
    </form>
  );
}

export function VerwandlungLoeschen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await verwandlungLoeschen(id);
      }}
    >
      <ConfirmButton
        variant="link"
        label="Löschen"
        question={`Eintrag von ${name} endgültig löschen? Damit ist auch der Vermerk über die Einwilligung weg.`}
        confirmLabel="Ja, löschen"
      />
    </form>
  );
}
