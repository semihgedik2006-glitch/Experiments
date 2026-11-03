import { formatDate } from "@/lib/format";
import { artText, betragText } from "@/lib/gutschein-verwaltung";

/**
 * Die Gutscheinkarte - dieselbe im Adminbereich (Drucken nach Verkauf im
 * Studio) und für Käufer, die online bezahlt haben.
 *
 * Feste Farben statt Theme-Farben: Die Karte wird gedruckt, und auf Papier
 * gibt es keinen dunklen Modus.
 */
export function GutscheinKarte({
  gutschein: g,
  studio,
}: {
  gutschein: {
    code: string;
    art: string;
    betrag: number;
    fuer: string | null;
    widmung: string | null;
    gueltigBis: Date | null;
  };
  studio?: { name: string; street: string; postalCode: string; city: string; phone: string | null } | null;
}) {
  return (
    <div className="w-full rounded-3xl border-2 border-[#527012] bg-white p-10 text-neutral-900 print:border">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#527012]">Gutschein</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">
        Körper<span className="text-[#527012]">formen</span>
      </p>

      <p className="mt-8 text-4xl font-bold">{betragText(g.art, g.betrag)}</p>
      <p className="mt-1 text-lg">{artText(g.art, g.betrag)}</p>

      {g.fuer && <p className="mt-6 text-xl">für {g.fuer}</p>}
      {g.widmung && <p className="mt-2 text-lg italic">„{g.widmung}“</p>}

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-neutral-200 pt-6 text-sm">
        <div>
          <p className="text-neutral-500">Code</p>
          <p className="font-mono text-xl font-semibold tracking-wider">{g.code}</p>
        </div>
        <div className="text-right">
          <p className="text-neutral-500">Gültig bis</p>
          <p className="font-semibold">{g.gueltigBis ? formatDate(g.gueltigBis) : "-"}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        {studio
          ? `Einlösbar bei ${studio.name}, ${studio.street}, ${studio.postalCode} ${studio.city}${studio.phone ? ` · Telefon ${studio.phone}` : ""}.`
          : "Einlösbar in den Körperformen-Studios in Köln und Umgebung - einfach im Studio melden und den ersten Termin vereinbaren."}{" "}
        Keine Barauszahlung; ein Restbetrag bleibt auf dem Gutschein erhalten.
      </p>
    </div>
  );
}
