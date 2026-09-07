"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

/**
 * Suchfeld für die Admin-Listen.
 *
 * Der Begriff steht in der Adresszeile, nicht im Browser-Zustand: Die Seite
 * bleibt dadurch eine Server-Komponente und lädt nur die Treffer, statt
 * alles zu holen und im Browser zu filtern. Bei mehreren hundert Buchungen
 * ist das der Unterschied.
 *
 * Getippt wird mit Verzögerung - ohne sie liefe je Tastendruck eine Anfrage.
 */
export function SearchBox({
  platzhalter = "Suchen...",
  klasse = "",
}: {
  platzhalter?: string;
  klasse?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [wert, setWert] = useState(searchParams.get("q") ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uebernehmen = useCallback(
    (begriff: string) => {
      const such = new URLSearchParams(searchParams.toString());
      if (begriff) such.set("q", begriff);
      else such.delete("q");
      // Nach einer neuen Suche wieder vorn anfangen.
      such.delete("seite");

      const query = such.toString();
      startTransition(() => {
        // replace statt push: Sonst liegt für jeden Tastendruck ein
        // Eintrag im Verlauf und der Zurück-Knopf tippt rückwärts.
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  function tippen(begriff: string) {
    setWert(begriff);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => uebernehmen(begriff), 350);
  }

  function leeren() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setWert("");
    uebernehmen("");
  }

  return (
    <div className={`relative ${klasse}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        {pending ? (
          <Loader2 size={15} className="animate-spin" aria-hidden />
        ) : (
          <Search size={15} aria-hidden />
        )}
      </span>
      <label>
        <span className="sr-only">{platzhalter}</span>
        <input
          type="search"
          value={wert}
          onChange={(event) => tippen(event.target.value)}
          placeholder={platzhalter}
          className="w-full rounded-lg border border-border bg-surface-raised py-2 pl-9 pr-9 text-sm outline-none transition-colors focus:border-lime"
        />
      </label>
      {wert && (
        <button
          type="button"
          onClick={leeren}
          aria-label="Suche zurücksetzen"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
