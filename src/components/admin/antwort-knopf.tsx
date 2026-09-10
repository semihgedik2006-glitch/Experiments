"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, MailOpen } from "lucide-react";
import { mailtoLink, vorlageFuellen, type VorlagenWerte } from "@/lib/vorlagen";

/**
 * "Antworten" an einer Anfrage oder Nachricht.
 *
 * Ein Klick öffnet das eigene Mailprogramm mit ausgefülltem Empfänger,
 * Betreff und Text - die Antwort geht aus dem Postfach des Studios raus,
 * nicht von der Website. Die ausführliche Begründung steht in
 * src/lib/vorlagen.ts.
 *
 * Zusätzlich "Text kopieren": Wer im Browser bei Gmail oder Outlook
 * arbeitet, hat kein Mailprogramm, das auf mailto: reagiert - für den ist
 * der Knopf sonst wertlos. Kopieren funktioniert überall.
 *
 * Die Platzhalter werden hier im Browser ersetzt und nicht auf dem Server:
 * Sonst müsste für jede Anfrage mal drei Vorlagen der fertige Text
 * mitgeschickt werden - bei zwanzig Anfragen auf einer Seite wären das
 * sechzig Textblöcke im HTML, die fast nie jemand aufklappt.
 */

export type VorlageKurz = { id: string; titel: string; betreff: string; text: string };

export function AntwortKnopf({
  email,
  vorlagen,
  werte,
}: {
  email: string;
  vorlagen: VorlageKurz[];
  werte: VorlagenWerte;
}) {
  const [offen, setOffen] = useState(false);
  const [kopiert, setKopiert] = useState<string | null>(null);
  const huelle = useRef<HTMLDivElement>(null);

  // Zuklappen, sobald daneben geklickt oder Escape gedrückt wird. Ohne das
  // bleibt die Liste offen, während man längst woanders liest.
  useEffect(() => {
    if (!offen) return;
    function beiKlick(event: MouseEvent) {
      if (!huelle.current?.contains(event.target as Node)) setOffen(false);
    }
    function beiTaste(event: KeyboardEvent) {
      if (event.key === "Escape") setOffen(false);
    }
    document.addEventListener("mousedown", beiKlick);
    document.addEventListener("keydown", beiTaste);
    return () => {
      document.removeEventListener("mousedown", beiKlick);
      document.removeEventListener("keydown", beiTaste);
    };
  }, [offen]);

  // Die Rückmeldung "kopiert" verfällt von selbst - sonst steht der Haken
  // noch da, wenn man längst eine andere Vorlage ansieht.
  useEffect(() => {
    if (!kopiert) return;
    const timer = setTimeout(() => setKopiert(null), 2000);
    return () => clearTimeout(timer);
  }, [kopiert]);

  if (vorlagen.length === 0) return null;

  async function kopieren(vorlage: VorlageKurz) {
    const text = vorlageFuellen(vorlage.text, werte);
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(vorlage.id);
    } catch {
      // Ohne Freigabe für die Zwischenablage - etwa in einem alten Browser
      // oder ohne HTTPS - bleibt der Knopf wirkungslos. Das ist kein Grund
      // für eine Fehlermeldung: Der Weg über das Mailprogramm daneben
      // funktioniert weiterhin.
    }
  }

  return (
    <div ref={huelle} className="relative">
      <button
        type="button"
        onClick={() => setOffen((z) => !z)}
        aria-expanded={offen}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-lime"
      >
        <MailOpen size={14} aria-hidden />
        Antworten
      </button>

      {offen && (
        <div
          role="menu"
          className="admin-panel absolute right-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] p-2 shadow-xl"
        >
          <p className="px-2 py-1.5 text-xs text-muted">
            Öffnet dein Mailprogramm mit fertigem Text. Abgeschickt wird von
            Hand.
          </p>
          <ul className="mt-1 space-y-1">
            {vorlagen.map((vorlage) => (
              <li key={vorlage.id} className="flex items-center gap-1">
                <a
                  role="menuitem"
                  href={mailtoLink(
                    email,
                    vorlageFuellen(vorlage.betreff, werte),
                    vorlageFuellen(vorlage.text, werte),
                  )}
                  onClick={() => setOffen(false)}
                  className="min-w-0 flex-1 truncate rounded-lg px-2 py-2 text-sm transition-colors hover:bg-lime/10 hover:text-accent"
                >
                  {vorlage.titel}
                </a>
                <button
                  type="button"
                  onClick={() => kopieren(vorlage)}
                  title={`Text von „${vorlage.titel}“ kopieren`}
                  aria-label={`Text von ${vorlage.titel} kopieren`}
                  className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-lime/10 hover:text-accent"
                >
                  {kopiert === vorlage.id ? (
                    <Check size={14} className="text-accent" aria-hidden />
                  ) : (
                    <Copy size={14} aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
          {/* Für Vorleseprogramme: Der Haken am Kopierknopf ist sonst die
              einzige Rückmeldung, und ein getauschtes Symbol wird nicht
              angesagt. */}
          <p aria-live="polite" className="sr-only">
            {kopiert ? "Text kopiert" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
