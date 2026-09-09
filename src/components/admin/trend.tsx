import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

/**
 * Kennzahl mit Vergleich zur Vorwoche.
 *
 * Eine nackte Zahl beantwortet die falsche Frage. "14 Anfragen" heißt für
 * sich genommen nichts - erst "14, letzte Woche 8" sagt, ob gerade etwas
 * läuft. Deshalb steht hier immer der Vorwochenwert daneben.
 *
 * Bewusst keine Prozentangabe bei kleinen Zahlen: Von 1 auf 2 sind "+100 %",
 * was mehr verspricht, als dahintersteckt. Erst ab fünf Vorgängen in der
 * Vorwoche wird der Anteil angezeigt.
 */
export function TrendKarte({
  label,
  jetzt,
  vorher,
  href,
  einheit,
}: {
  label: string;
  jetzt: number;
  vorher: number;
  href: string;
  einheit: string;
}) {
  const diff = jetzt - vorher;
  const prozent = vorher >= 5 ? Math.round((diff / vorher) * 100) : null;

  const richtung = diff > 0 ? "hoch" : diff < 0 ? "runter" : "gleich";
  const Pfeil = richtung === "hoch" ? ArrowUpRight : richtung === "runter" ? ArrowDownRight : ArrowRight;

  // Mehr ist hier immer besser - Anfragen, Nachrichten, Anmeldungen.
  const farbe =
    richtung === "hoch" ? "text-accent" : richtung === "runter" ? "text-danger" : "text-muted";

  return (
    <Link href={href} className="admin-panel block p-4 transition-colors hover:border-lime">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">{jetzt}</span>
        <span className="text-xs text-muted">{einheit} / 7 Tage</span>
      </p>

      <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${farbe}`}>
        <Pfeil size={13} aria-hidden />
        {vorher === 0 && jetzt === 0
          ? "keine Bewegung, auch nicht in der Vorwoche"
          : vorher === 0
            ? "neu - in der Vorwoche war es keine"
            : diff === 0
              ? `gleich viele wie in der Vorwoche (${vorher})`
              : `${diff > 0 ? "+" : ""}${diff} gegenüber ${vorher} in der Vorwoche${
                  prozent !== null ? ` (${prozent > 0 ? "+" : ""}${prozent} %)` : ""
                }`}
      </p>
    </Link>
  );
}
