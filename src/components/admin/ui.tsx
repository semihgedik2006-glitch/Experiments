import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

/**
 * Ein Symbol - aus lucide oder aus src/components/icons.
 *
 * Vorher stand hier LucideIcon. Damit ließen sich die eigenen
 * Markensymbole (Instagram, Facebook, TikTok) nirgends einsetzen, obwohl
 * sie dieselben Angaben entgegennehmen - lucide führt seine Symbole über
 * forwardRef, unsere sind einfache Funktionen. Geprüft wird jetzt, was
 * tatsächlich gebraucht wird: Größe, Klasse, Ausblenden.
 */
export type SymbolTyp = ComponentType<{
  size?: number | string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

/**
 * Gemeinsame Bausteine für alle Admin-Seiten.
 *
 * Die Bereiche sind zu unterschiedlichen Zeiten entstanden: mal 2xl-Radien
 * und p-6, mal xl und p-5, Überschriften mal text-2xl und mal font-semibold,
 * Statusfarben aus drei verschiedenen Paletten. Das fiel einzeln nicht auf,
 * in Summe wirkte der Adminbereich zusammengestückelt.
 *
 * Ab hier gibt jede Seite ihren Kopf, ihre Flächen, ihre Statusmarken und
 * ihre Leerzustände über dieselben Bausteine aus.
 */

/** Seitenkopf: Titel, erklärender Satz, optional eine Schaltfläche rechts. */
export function AdminPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** Abschnittsüberschrift innerhalb einer Seite. */
export function AdminSection({
  title,
  description,
  className = "",
  children,
}: {
  title: string;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Arbeitsfläche - die Karte, auf der Listen und Formulare stehen. */
export function Panel({
  className = "",
  highlight = false,
  children,
}: {
  className?: string;
  /** Hervorgehoben für Anlege-Formulare. */
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`admin-panel p-4 sm:p-5 ${highlight ? "border-lime/40" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

type Ton = "open" | "ok" | "off" | "idle";

/**
 * Statusmarke. Farbe und Fläche kommen aus den Tokens in globals.css, damit
 * "offen" überall gleich aussieht - vorher war dieselbe Bedeutung an drei
 * Stellen unterschiedlich eingefärbt, und das Gelb war auf heller Fläche
 * kaum zu lesen.
 */
export function StatusBadge({
  ton,
  children,
  icon: Icon,
}: {
  ton: Ton;
  children: ReactNode;
  icon?: SymbolTyp;
}) {
  return (
    <span className={`badge badge-${ton}`}>
      {Icon && <Icon size={12} aria-hidden />}
      {children}
    </span>
  );
}

/**
 * Leerzustand. Vorher stand dort ein grauer Halbsatz ("Noch keine Kommentare
 * vorhanden."), der nicht sagte, ob etwas fehlt oder ob das in Ordnung ist.
 */
export function EmptyState({
  icon: Icon,
  title,
  children,
  actionHref,
  actionLabel,
}: {
  icon: SymbolTyp;
  title: string;
  children?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="admin-panel flex flex-col items-center px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/12 text-accent">
        <Icon size={20} aria-hidden />
      </span>
      <p className="mt-3 font-semibold">{title}</p>
      {children && <p className="mt-1.5 max-w-md text-sm text-muted">{children}</p>}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/** Einheitliches Eingabefeld - vorher stand die Klassenkette auf jeder Seite neu. */
export const adminInput =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none transition-colors focus:border-lime";
