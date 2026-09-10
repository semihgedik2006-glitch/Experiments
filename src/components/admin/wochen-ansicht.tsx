import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteSlot } from "@/lib/actions/admin-slots";
import { StatusBadge } from "@/components/admin/ui";
import { mitParams, type SuchParams } from "@/lib/admin-list";
import {
  kurzerWochentag,
  kurzesDatum,
  langerTag,
  tagePlus,
  tagesSchluessel,
  wochenTage,
  wochenTitel,
} from "@/lib/woche";

export type WochenSlot = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  /** Belegte Plätze - wer zu zweit kommt, zählt doppelt. */
  belegt: number;
  /** Anzahl der Buchungen. Steht in der Rückfrage vor dem Löschen, denn
   *  dort geht es um Menschen, die angeschrieben werden müssen, nicht um
   *  Plätze. */
  buchungen: number;
  templateId: string | null;
  studioName: string;
};

/**
 * Verfügbarkeiten als Woche.
 *
 * Als Liste ließ sich nicht erkennen, ob am Donnerstag eine Lücke klafft
 * oder ob zwei gleiche Zeiten doppelt eingetragen sind - dafür hätte man
 * Datum für Datum lesen müssen. Nebeneinander fällt beides sofort auf.
 *
 * Auf breiten Bildschirmen sieben Spalten, auf dem Handy sieben Abschnitte
 * untereinander. Sieben Spalten auf 360 Pixeln wären 50 Pixel je Tag.
 */
export function WochenAnsicht({
  basis,
  params,
  montag,
  slots,
  mehrereStudios,
}: {
  basis: string;
  params: SuchParams;
  montag: Date;
  slots: WochenSlot[];
  mehrereStudios: boolean;
}) {
  const tage = wochenTage(montag);

  // Termine nach Tag bündeln - eine Runde durch die Liste statt sieben.
  const nachTag = new Map<string, WochenSlot[]>();
  for (const slot of slots) {
    const key = tagesSchluessel(slot.date);
    const vorhanden = nachTag.get(key);
    if (vorhanden) vorhanden.push(slot);
    else nachTag.set(key, [slot]);
  }

  const heute = tagesSchluessel(new Date());
  const nav =
    "inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-lime";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">{wochenTitel(montag)}</p>
        <div className="flex items-center gap-2">
          <Link
            href={mitParams(basis, params, { woche: tagesSchluessel(tagePlus(montag, -7)) })}
            className={nav}
          >
            <ChevronLeft size={14} /> Woche zurück
          </Link>
          <Link href={mitParams(basis, params, { woche: undefined })} className={nav}>
            Diese Woche
          </Link>
          <Link
            href={mitParams(basis, params, { woche: tagesSchluessel(tagePlus(montag, 7)) })}
            className={nav}
          >
            Woche vor <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Sieben Spalten ab Tablet-Breite */}
      <div className="hidden gap-2 md:grid md:grid-cols-7">
        {tage.map((tag) => {
          const key = tagesSchluessel(tag);
          const tagesSlots = nachTag.get(key) ?? [];
          const istHeute = key === heute;

          return (
            <div
              key={key}
              className={`admin-panel flex min-h-40 flex-col p-2 ${istHeute ? "border-lime" : ""}`}
            >
              <p className="mb-2 text-center text-xs">
                <span className={`font-semibold ${istHeute ? "text-accent" : ""}`}>
                  {kurzerWochentag(tag)}
                </span>{" "}
                <span className="text-muted">{kurzesDatum(tag)}</span>
              </p>

              {tagesSlots.length === 0 ? (
                <p className="mt-2 text-center text-xs text-muted">frei</p>
              ) : (
                <ul className="space-y-1.5">
                  {tagesSlots.map((slot) => (
                    <li
                      key={slot.id}
                      className="rounded-lg border border-border bg-surface-raised p-2 text-xs"
                    >
                      <p className="font-medium tabular-nums">
                        {slot.startTime}&ndash;{slot.endTime}
                      </p>
                      <p
                        className={
                          slot.belegt >= slot.capacity ? "mt-0.5 text-danger" : "mt-0.5 text-muted"
                        }
                      >
                        {slot.belegt}/{slot.capacity} belegt
                      </p>
                      {mehrereStudios && (
                        <p className="mt-0.5 truncate text-muted">{slot.studioName}</p>
                      )}
                      <form
                        action={async () => {
                          "use server";
                          await deleteSlot(slot.id);
                        }}
                        className="mt-1"
                      >
                        <ConfirmButton
                          variant="link"
                          question={
                            slot.buchungen > 0
                              ? `Termin mit ${slot.buchungen} Buchung${slot.buchungen === 1 ? "" : "en"} löschen?`
                              : "Diesen Termin löschen?"
                          }
                        />
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Untereinander auf dem Handy - leere Tage werden dabei weggelassen,
          sonst scrollt man an fünf "frei"-Karten vorbei. */}
      <div className="space-y-2 md:hidden">
        {tage.map((tag) => {
          const key = tagesSchluessel(tag);
          const tagesSlots = nachTag.get(key) ?? [];
          if (tagesSlots.length === 0) return null;

          return (
            <div key={key} className={`admin-panel p-3 ${key === heute ? "border-lime" : ""}`}>
              <p className="text-sm font-semibold">{langerTag(tag)}</p>
              <ul className="mt-2 space-y-2">
                {tagesSlots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-sm first:border-0 first:pt-0"
                  >
                    <span>
                      <span className="font-medium tabular-nums">
                        {slot.startTime}&ndash;{slot.endTime}
                      </span>
                      <span className={slot.belegt >= slot.capacity ? "text-danger" : "text-muted"}>
                        {" "}
                        &middot; {slot.belegt}/{slot.capacity} belegt
                      </span>
                      {mehrereStudios && (
                        <span className="block text-xs text-muted">{slot.studioName}</span>
                      )}
                    </span>
                    <form
                      action={async () => {
                        "use server";
                        await deleteSlot(slot.id);
                      }}
                    >
                      <ConfirmButton
                        variant="link"
                        question={
                          slot.buchungen > 0
                            ? `Termin mit ${slot.buchungen} Buchung${slot.buchungen === 1 ? "" : "en"} löschen?`
                            : "Diesen Termin löschen?"
                        }
                      />
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {slots.length === 0 && (
          <p className="text-sm text-muted">In dieser Woche ist kein Termin eingetragen.</p>
        )}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        {slots.length === 0
          ? "In dieser Woche ist kein Termin eingetragen."
          : `${slots.length} ${slots.length === 1 ? "Termin" : "Termine"} in dieser Woche`}
        {slots.some((slot) => slot.templateId) && (
          <StatusBadge ton="idle">enthält wiederkehrende Termine</StatusBadge>
        )}
      </p>
    </div>
  );
}
