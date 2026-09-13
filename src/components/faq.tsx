"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search, SearchX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export type FaqEntry = { question: string; answer: string };

/**
 * Häufige Fragen - mit Suche.
 *
 * Ab wann eine Suche nötig ist: Bei fünf Fragen liest man sie durch. Bei
 * fünfzehn - und dahin wächst so eine Liste - klappt man sie nicht mehr
 * einzeln auf, sondern verlässt die Seite. Wer "Schwangerschaft" oder
 * "Herzschrittmacher" sucht, hat eine konkrete Frage, und ob er eine
 * Antwort findet, entscheidet darüber, ob er bucht.
 *
 * Das Feld erscheint deshalb erst ab einer Schwelle. Ein Suchfeld über
 * vier Fragen sieht nach mehr Inhalt aus, als da ist.
 *
 * Gesucht wird in Frage UND Antwort: Das gesuchte Wort steht häufiger in
 * der Antwort ("Herzschrittmacher") als in der Frage ("Für wen ist EMS
 * nicht geeignet?").
 */

/** Ab so vielen Einträgen erscheint das Suchfeld. */
const AB_HIER_SUCHE = 6;

/**
 * Vergleichbar machen - in ZWEI Fassungen.
 *
 * Umlaute werden auf drei Arten getippt, und alle drei müssen finden, was
 * in der Antwort steht:
 *
 *   "Rücken"   - mit Umlaut
 *   "Ruecken"  - ausgeschrieben, die übliche Ersatzschreibung
 *   "Rucken"   - Umlaut einfach weggelassen
 *
 * Eine einzige Grundform genügt dafür nicht. Der erste Versuch hier
 * zerlegte den Umlaut und warf die Punkte weg ("Rücken" wurde zu
 * "rucken") - und fand damit "ruecken" nicht mehr, obwohl das die
 * häufigere Ersatzschreibung ist. Gemessen im Browser: 0 Treffer.
 *
 * Deshalb werden von Suchbegriff und Text jeweils beide Fassungen
 * gebildet, und es genügt, wenn irgendeine davon passt.
 */
function fassungen(text: string): [string, string] {
  const klein = text.toLowerCase();
  // Ausgeschrieben: ü -> ue
  const lang = klein
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
  // Weggelassen: ü -> u. Die Zerlegung in Grundzeichen plus Entfernen der
  // Zeichen darüber erledigt alle Umlaute auf einmal.
  const kurz = klein
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return [lang, kurz];
}

/** Kommt der Suchbegriff im Text vor - in irgendeiner Schreibweise? */
function enthaelt(text: string, begriff: string): boolean {
  const [textLang, textKurz] = fassungen(text);
  const [begriffLang, begriffKurz] = fassungen(begriff);
  return (
    textLang.includes(begriffLang) ||
    textKurz.includes(begriffKurz) ||
    textLang.includes(begriffKurz) ||
    textKurz.includes(begriffLang)
  );
}

export function Faq({ items }: { items: FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [suche, setSuche] = useState("");

  const begriff = suche.trim();

  const gefiltert = useMemo(() => {
    if (!begriff) return items;
    return items.filter(
      (item) => enthaelt(item.question, begriff) || enthaelt(item.answer, begriff),
    );
  }, [items, begriff]);

  if (items.length === 0) return null;

  const mitSuche = items.length >= AB_HIER_SUCHE;

  return (
    <section id="faq" className="scroll-mt-24 py-20 sm:py-24 md:py-32">
      <Container className="max-w-3xl">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Gut zu wissen
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Häufige Fragen
          </h2>
        </Reveal>

        {mitSuche && (
          <Reveal delay={0.06} className="mt-8">
            <label className="relative block">
              <span className="sr-only">In den häufigen Fragen suchen</span>
              <Search
                size={17}
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={suche}
                onChange={(event) => {
                  setSuche(event.target.value);
                  // Beim Suchen die erste Antwort aufklappen: Wer sucht,
                  // will lesen, nicht noch einmal klicken.
                  setOpenIndex(0);
                }}
                placeholder="Suchen, z.B. Schwangerschaft, Kosten, Kleidung"
                className="w-full rounded-full border border-border bg-transparent py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-lime"
              />
            </label>
            {/* Für Vorleseprogramme: Die Zahl der Treffer ändert sich beim
                Tippen, ohne dass der Fokus das Feld verlässt - ohne diese
                Ansage bliebe die Änderung unbemerkt. */}
            <p aria-live="polite" className="sr-only">
              {begriff
                ? `${gefiltert.length} von ${items.length} Fragen passen zu „${suche.trim()}“`
                : ""}
            </p>
          </Reveal>
        )}

        {gefiltert.length > 0 ? (
          <Reveal
            delay={0.1}
            className={`${mitSuche ? "mt-6" : "mt-10"} divide-y divide-border border-y border-border`}
          >
            {gefiltert.map((item, index) => {
              const open = openIndex === index;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-medium">{item.question}</span>
                    <motion.span
                      animate={{
                        rotate: open ? 180 : 0,
                        color: open ? "var(--color-lime)" : "var(--muted)",
                      }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0"
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="lesebreite pb-5 text-sm text-muted">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </Reveal>
        ) : (
          /* Eine leere Trefferliste ist der Moment, in dem jemand mit einer
             offenen Frage dasteht. Deshalb steht hier kein "nichts
             gefunden", sondern der Weg zu einer Antwort. */
          <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-lime/12 text-accent">
              <SearchX size={20} aria-hidden />
            </span>
            <p className="mt-3 font-semibold">
              Zu „{suche.trim()}“ steht hier nichts
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Das heißt nicht, dass es keine Antwort gibt - nur, dass sie noch
              nicht hier steht. Frag uns einfach direkt, wir antworten in der
              Regel am selben Werktag.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="/kontakt"
                className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90"
              >
                Frage stellen
              </a>
              <button
                type="button"
                onClick={() => setSuche("")}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime"
              >
                Alle Fragen zeigen
              </button>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
