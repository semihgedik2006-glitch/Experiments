"use client";

import Link from "@/components/sprach-link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { stationen, type StationsSchluessel } from "@/lib/weg";
import { useSprache } from "@/lib/i18n/use-sprache";
import { nachDe } from "@/lib/i18n/pfade";

/**
 * Die Weg-Leiste am Ende einer Seite: wo stehe ich, wohin geht es weiter.
 *
 * Oben die vier Stationen, die Linie füllt sich bis zur aktuellen, sobald
 * die Leiste ins Bild kommt. Darunter ein großer Verweis auf die nächste
 * Station - an der letzten Station ist das das Probetraining.
 *
 * Die Stationen sind Links: Wer eine überspringen will, kann das.
 */
export function WegLeiste({ aktuell }: { aktuell: StationsSchluessel }) {
  // Verglichen wird mit der deutschen Adresse - die Stationen nennen die
  // deutschen, und auf Englisch übersetzt sie der Verweis von selbst.
  const pfad = nachDe(usePathname());
  const sprache = useSprache();
  const en = sprache === "en";
  const STATIONEN = stationen(sprache);
  const index = STATIONEN.findIndex((s) => s.schluessel === aktuell);
  // "Auch hier" zeigt die anderen Seiten der Station, nicht die, auf der
  // man gerade steht - auf /preise also /studio und nicht /preise.
  const station = STATIONEN[index];
  const auch = [{ label: station.schluessel === "entscheiden" ? "Studios" : en ? "Knowledge" : "Wissen", href: station.href }, ...(station.auch ?? [])].filter(
    (s) => s.href !== pfad,
  );
  const naechste = STATIONEN[index + 1];
  const anteil = index / (STATIONEN.length - 1);

  return (
    <section aria-label={en ? "Your path to Körperformen" : "Dein Weg zu Körperformen"} className="border-t border-border py-16 sm:py-20">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{en ? "Your path" : "Dein Weg"}</p>

        <div className="relative mt-8">
          {/* Die Linie liegt auf Höhe der Punkte: Mitte des ersten bis
              Mitte des letzten Punktes - deshalb die halben Spaltenbreiten
              als Rand. */}
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[15px] h-0.5 rounded-full bg-border">
            <motion.div
              className="h-full origin-left rounded-full bg-lime"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: anteil }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            />
          </div>
          <ol className="relative grid grid-cols-4">
            {STATIONEN.map((station, i) => {
              const erledigt = i < index;
              const hier = i === index;
              return (
                <li key={station.schluessel} className="flex flex-col items-center text-center">
                  <Link
                    href={station.href}
                    aria-current={hier ? "step" : undefined}
                    className="group flex flex-col items-center"
                  >
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 380, damping: 20, delay: 0.15 + i * 0.12 }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                        hier
                          ? "weg-hier border-lime bg-lime text-on-lime"
                          : erledigt
                            ? "border-lime bg-background text-accent"
                            : "border-border bg-background text-muted group-hover:border-lime"
                      }`}
                    >
                      {erledigt ? <Check size={14} strokeWidth={3} aria-hidden /> : i + 1}
                    </motion.span>
                    <span
                      className={`mt-3 text-xs font-semibold sm:text-sm ${
                        hier ? "text-foreground" : "text-muted group-hover:text-foreground"
                      }`}
                    >
                      {station.name}
                    </span>
                    <span className="mt-1 hidden max-w-[16ch] text-xs text-muted md:block">
                      {station.frage}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <Link
            href={naechste ? naechste.href : "/probetermin"}
            className="karte-hebt karte-glanz group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 sm:p-8"
          >
            <span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {naechste ? (en ? `On to step ${index + 2}` : `Weiter zu Station ${index + 2}`) : en ? "Ready?" : "Bereit?"}
              </span>
              <span className="mt-2 block text-xl font-bold tracking-tight sm:text-2xl">
                {naechste ? naechste.frage : en ? "Experience it yourself – free trial session" : "Erlebe es selbst – kostenloses Probetraining"}
              </span>
            </span>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime">
              <ArrowRight size={20} className="karte-pfeil" aria-hidden />
            </span>
          </Link>
          {station.auch && auch.length > 0 && (
            <p className="mt-4 text-sm text-muted">
              {en ? "Also here:" : "Auch hier:"}{" "}
              {auch.map((s, i) => (
                <span key={s.href}>
                  {i > 0 && " · "}
                  <Link href={s.href} className="text-accent underline underline-offset-2">
                    {s.label}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
