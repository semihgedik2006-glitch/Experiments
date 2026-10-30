import Link from "next/link";
import { Printer } from "lucide-react";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { adminInput } from "@/components/admin/ui";
import {
  einloesungZuruecknehmen,
  gutscheinAusstellen,
  gutscheinEinloesen,
  gutscheinNotizSpeichern,
  gutscheinStornieren,
  gutscheinVorOrtVerkaufen,
} from "@/lib/actions/admin-gutscheine";
import { STARTPAKET_WERT, WEIHNACHTEN_WERT, WERT_STUFEN } from "@/lib/gutschein-verwaltung";
import type { GutscheinStatus } from "@/generated/prisma/enums";

/** Die Knöpfe zu einem Gutschein - je nach Stand nur die, die passen. */
export function GutscheinAktionen({ id, status }: { id: string; status: GutscheinStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "ANGEFRAGT" && (
        <form
          action={async () => {
            "use server";
            await gutscheinAusstellen(id);
          }}
        >
          <SubmitButton variant="primary">Bezahlt - ausstellen</SubmitButton>
        </form>
      )}
      {status === "AUSGESTELLT" && (
        <>
          <Link
            href={`/admin/gutschein-druck/${id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime"
          >
            <Printer size={13} aria-hidden /> Drucken
          </Link>
          <form
            action={async () => {
              "use server";
              await gutscheinEinloesen(id);
            }}
          >
            <SubmitButton>Eingelöst</SubmitButton>
          </form>
        </>
      )}
      {status === "EINGELOEST" && (
        <form
          action={async () => {
            "use server";
            await einloesungZuruecknehmen(id);
          }}
        >
          <SubmitButton variant="link">Einlösung zurücknehmen</SubmitButton>
        </form>
      )}
      {(status === "ANGEFRAGT" || status === "AUSGESTELLT") && (
        <form
          action={async () => {
            "use server";
            await gutscheinStornieren(id);
          }}
        >
          <ConfirmButton
            variant="link"
            label="Stornieren"
            icon="keins"
            question="Gutschein stornieren? Der Code gilt danach nicht mehr."
            confirmLabel="Ja, stornieren"
            pendingLabel="Wird storniert..."
          />
        </form>
      )}
    </div>
  );
}

export function GutscheinNotiz({ id, notiz }: { id: string; notiz: string | null }) {
  return (
    <AdminForm action={gutscheinNotizSpeichern} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <label className="min-w-0 flex-1">
        <span className="mb-1 block text-xs text-muted">Interner Vermerk</span>
        <input
          type="text"
          name="notiz"
          defaultValue={notiz ?? ""}
          placeholder="z. B. „bar bezahlt, Karte am 12.12. abgeholt“"
          className={adminInput}
        />
      </label>
      <SubmitButton>Speichern</SubmitButton>
    </AdminForm>
  );
}

/** Ein Gutschein, der im Studio verkauft wird - sofort gültig. */
export function VorOrtFormular({
  studios,
  studioId,
  istLeitung,
}: {
  studios: { id: string; name: string }[];
  studioId: string | null;
  istLeitung: boolean;
}) {
  return (
    <AdminForm action={gutscheinVorOrtVerkaufen} resetOnSuccess className="space-y-3">
      {istLeitung && studios.length > 1 ? (
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Studio</span>
          <select name="studioId" defaultValue={studioId ?? ""} className={adminInput}>
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="studioId" value={studioId ?? ""} />
      )}

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Gutschein</span>
        <select name="auswahl" defaultValue="wert-50" className={adminInput}>
          {WERT_STUFEN.map((betrag) => (
            <option key={betrag} value={`wert-${betrag}`}>
              Wertgutschein {betrag} €
            </option>
          ))}
          <option value="startpaket">
            Startpaket geschenkt ({STARTPAKET_WERT.toFixed(2).replace(".", ",")} €)
          </option>
          <option value="weihnachten">Weihnachtsaktion: 4 Wochen EMS-Training ({WEIHNACHTEN_WERT} €)</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-muted">Bezahlt</span>
        <select name="zahlweg" defaultValue="studio" className={adminInput}>
          <option value="studio">im Studio</option>
          <option value="digistore">über Digistore24 (Gutschein-PDF von dort)</option>
          <option value="ueberweisung">per Überweisung</option>
        </select>
        <span className="mt-1 block text-xs text-muted">
          Digistore24-Gutscheine hier eintragen, sobald jemand damit ins Studio kommt - dann zählen
          sie in den Kennzahlen mit und lassen sich als eingelöst markieren.
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Käufer</span>
          <input type="text" name="kaeuferName" required className={adminInput} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">E-Mail des Käufers (freiwillig)</span>
          <input type="email" name="kaeuferEmail" className={adminInput} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Für (steht auf dem Gutschein)</span>
          <input type="text" name="fuer" maxLength={60} className={adminInput} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Widmung (freiwillig)</span>
          <input type="text" name="widmung" maxLength={140} className={adminInput} />
        </label>
      </div>

      <SubmitButton variant="primary" savedLabel="Ausgestellt - jetzt in der Liste drucken">
        Verkauft - ausstellen
      </SubmitButton>
    </AdminForm>
  );
}
