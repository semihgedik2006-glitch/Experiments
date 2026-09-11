import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { adminInput } from "@/components/admin/ui";
import {
  angebotAendern,
  angebotAnlegen,
  angebotLoeschen,
  tarifAendern,
  tarifAnlegen,
  tarifLoeschen,
  textSpeichern,
} from "@/lib/actions/admin-preise";
import { SYMBOLE } from "@/lib/zusatzangebote";

export type TarifDaten = {
  id: string;
  name: string;
  untertitel: string | null;
  preis: string | null;
  preisZusatz: string | null;
  leistungen: string[];
  empfohlen: boolean;
  hinweis: string | null;
  aktiv: boolean;
  sortOrder: number;
};

export type AngebotDaten = {
  id: string;
  name: string;
  text: string | null;
  preis: string | null;
  symbol: string;
  nurStudios: string[];
  aktiv: boolean;
  sortOrder: number;
};

/**
 * Ein Tarif anlegen oder ändern.
 *
 * Dasselbe Formular für beides - ein getrenntes Anlege- und
 * Bearbeitungsformular sind zwei Stellen, an denen ein neues Feld
 * vergessen werden kann.
 */
export function TarifFormular({ tarif }: { tarif?: TarifDaten }) {
  const neu = !tarif;

  return (
    <AdminForm action={neu ? tarifAnlegen : tarifAendern} resetOnSuccess={neu} className="space-y-3">
      {!neu && <input type="hidden" name="id" value={tarif.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Name</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={tarif?.name}
            placeholder="2x pro Woche"
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Untertitel</span>
          <input
            type="text"
            name="untertitel"
            defaultValue={tarif?.untertitel ?? ""}
            placeholder="für sichtbare Ergebnisse"
            className={adminInput}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Preis</span>
          <input
            type="text"
            name="preis"
            defaultValue={tarif?.preis ?? ""}
            placeholder="ab 89 €"
            className={adminInput}
          />
          {/* Der Hinweis steht hier, weil das Feld sonst nach einer Zahl
              aussieht: Es ist ein Textfeld, damit "ab 89 €" und "auf
              Anfrage" beide möglich sind. */}
          <span className="mt-1 block text-xs text-muted">
            Freier Text - „ab 89 €“ oder „auf Anfrage“ gehen beide.
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Zusatz hinter dem Preis</span>
          <input
            type="text"
            name="preisZusatz"
            defaultValue={tarif?.preisZusatz ?? ""}
            placeholder="pro Monat"
            className={adminInput}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Leistungen</span>
        <textarea
          name="leistungen"
          rows={5}
          defaultValue={tarif?.leistungen.join("\n") ?? ""}
          placeholder={"Zwei Einheiten pro Woche\nIndividueller Trainingsplan\nTrainingskleidung inklusive"}
          className={adminInput}
        />
        <span className="mt-1 block text-xs text-muted">
          Eine Leistung je Zeile, höchstens zehn. Mehr liest in einer Karte
          niemand - und die Karten daneben werden dadurch gleich mit unlesbar
          hoch.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Kleingedrucktes zu diesem Tarif</span>
        <input
          type="text"
          name="hinweis"
          defaultValue={tarif?.hinweis ?? ""}
          placeholder="Mindestlaufzeit 12 Monate"
          className={adminInput}
        />
      </label>

      <div className="flex flex-wrap items-end gap-5">
        <label className="block w-28">
          <span className="mb-1 block text-xs text-muted">Reihenfolge</span>
          <input
            type="number"
            name="sortOrder"
            defaultValue={tarif?.sortOrder ?? ""}
            placeholder="10"
            className={adminInput}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="empfohlen"
            defaultChecked={tarif?.empfohlen ?? false}
            className="accent-lime"
          />
          Als Empfehlung hervorheben
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="aktiv"
            defaultChecked={tarif?.aktiv ?? true}
            className="accent-lime"
          />
          Auf der Preisseite zeigen
        </label>
      </div>

      <SubmitButton>{neu ? "Tarif anlegen" : "Speichern"}</SubmitButton>
    </AdminForm>
  );
}

export function TarifLoeschen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await tarifLoeschen(id);
      }}
    >
      <ConfirmButton variant="link" question={`Tarif „${name}“ löschen?`} confirmLabel="Ja, löschen" />
    </form>
  );
}

/** Ein Zusatzangebot anlegen oder ändern. */
export function AngebotFormular({
  angebot,
  studios,
}: {
  angebot?: AngebotDaten;
  studios: { id: string; name: string }[];
}) {
  const neu = !angebot;

  return (
    <AdminForm
      action={neu ? angebotAnlegen : angebotAendern}
      resetOnSuccess={neu}
      className="space-y-3"
    >
      {!neu && <input type="hidden" name="id" value={angebot.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Name</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={angebot?.name}
            placeholder="Ernährungsberatung"
            className={adminInput}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Sinnbild</span>
          <select
            name="symbol"
            defaultValue={angebot?.symbol ?? "sonstiges"}
            className={adminInput}
          >
            {SYMBOLE.map((symbol) => (
              <option key={symbol.schluessel} value={symbol.schluessel}>
                {symbol.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Beschreibung</span>
        <textarea
          name="text"
          rows={3}
          defaultValue={angebot?.text ?? ""}
          placeholder="Ein persönlicher Plan, der zu deinem Alltag passt - keine Verbotsliste."
          className={adminInput}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Preis</span>
          <input
            type="text"
            name="preis"
            defaultValue={angebot?.preis ?? ""}
            placeholder="im Beitrag enthalten"
            className={adminInput}
          />
        </label>
        <label className="block w-28">
          <span className="mb-1 block text-xs text-muted">Reihenfolge</span>
          <input
            type="number"
            name="sortOrder"
            defaultValue={angebot?.sortOrder ?? ""}
            placeholder="10"
            className={adminInput}
          />
        </label>
      </div>

      {studios.length > 1 && (
        <fieldset>
          <legend className="mb-1 text-xs text-muted">Nur an diesen Standorten</legend>
          {/* Kein Haken gesetzt heißt "überall". Das ist die richtige
              Voreinstellung: Ein neues Angebot soll erscheinen, nicht
              verborgen bleiben, bis jemand vierzehn Haken setzt. */}
          <p className="mb-2 text-xs text-muted">
            Nichts angehakt = an allen Standorten.
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <label key={studio.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="nurStudios"
                  value={studio.id}
                  defaultChecked={angebot?.nurStudios.includes(studio.id) ?? false}
                  className="accent-lime"
                />
                <span className="truncate" title={studio.name}>
                  {studio.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="aktiv"
          defaultChecked={angebot?.aktiv ?? true}
          className="accent-lime"
        />
        Auf der Website zeigen
      </label>

      <SubmitButton>{neu ? "Angebot anlegen" : "Speichern"}</SubmitButton>
    </AdminForm>
  );
}

export function AngebotLoeschen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await angebotLoeschen(id);
      }}
    >
      <ConfirmButton variant="link" question={`Angebot „${name}“ löschen?`} confirmLabel="Ja, löschen" />
    </form>
  );
}

/** Der Pflichthinweis unter der Preisübersicht. */
export function TextFormular({
  schluessel,
  wert,
  zeilen,
}: {
  schluessel: string;
  wert: string;
  zeilen: number;
}) {
  return (
    <AdminForm action={textSpeichern} className="space-y-3">
      <input type="hidden" name="key" value={schluessel} />
      <textarea
        name="wert"
        rows={zeilen}
        defaultValue={wert}
        className={adminInput}
        aria-label="Hinweis unter den Tarifen"
      />
      <SubmitButton>Hinweis speichern</SubmitButton>
    </AdminForm>
  );
}
