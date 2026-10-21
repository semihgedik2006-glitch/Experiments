"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { probeterminHref, useZiel } from "@/components/ziel/ziel-kontext";
import { ZIEL_INHALTE, ZONEN, zielInhalt } from "@/lib/ziel-inhalte";

/**
 * "Erkennst du dich wieder?" - der Abschnitt, der zum gewählten Ziel spricht.
 *
 * Ein Ziel, drei Situationen aus dem Alltag, drei Sätze dazu, wie wir
 * damit arbeiten. Daneben die Weste mit ihren acht Zonen: Wechselt das
 * Ziel, gleiten die Regler auf einen anderen Schwerpunkt. Genau das ist
 * die Aussage - dasselbe Gerät, für jeden anders eingestellt.
 *
 * Das Ziel kommt aus dem ersten Bildschirm (ZielProvider). Hat noch
 * niemand gewählt, steht der Rücken da - das häufigste Anliegen. Ein Klick
 * hier ändert die Wahl auch oben und im Formular.
 */

const weich = [0.16, 1, 0.3, 1] as const;

export function ZielWelt() {
  const { ziel, waehlen } = useZiel();
  const inhalt = zielInhalt(ziel) ?? ZIEL_INHALTE[0];
  const wenigerBewegung = useReducedMotion();

  return (
    <section id="dein-ziel" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-24 md:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Erkennst du dich wieder?
          </h2>
          <p className="mt-4 text-lg text-muted">
            Wähl dein Ziel – und sieh, wie dein Training dafür aussieht.
          </p>
        </Reveal>

        <div role="tablist" aria-label="Dein Ziel" className="mt-10 flex flex-wrap gap-2">
          {ZIEL_INHALTE.map((z) => {
            const aktiv = z.wert === inhalt.wert;
            return (
              <button
                key={z.wert}
                type="button"
                role="tab"
                id={`ziel-tab-${z.wert}`}
                aria-selected={aktiv}
                aria-controls="ziel-panel"
                onClick={() => waehlen(z.wert)}
                className={`relative isolate rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  aktiv ? "border-lime text-on-lime" : "border-border text-muted hover:border-lime/60 hover:text-foreground"
                }`}
              >
                {aktiv && (
                  <motion.span
                    layoutId="ziel-welt-pille"
                    transition={wenigerBewegung ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-full bg-lime"
                  />
                )}
                {z.kurz}
              </button>
            );
          })}
        </div>

        <div
          id="ziel-panel"
          role="tabpanel"
          aria-labelledby={`ziel-tab-${inhalt.wert}`}
          className="mt-10 grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={inhalt.wert}
              initial={wenigerBewegung ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={wenigerBewegung ? undefined : { opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: weich }}
            >
              <ul className="space-y-4">
                {inhalt.erkennst.map((satz, i) => (
                  <motion.li
                    key={satz}
                    initial={wenigerBewegung ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 + i * 0.08, ease: weich }}
                    className="flex gap-4 text-lg font-medium leading-snug sm:text-xl"
                  >
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-on-lime">
                      <Check size={14} aria-hidden />
                    </span>
                    {satz}
                  </motion.li>
                ))}
              </ul>

              <p className="mt-10 text-sm font-semibold text-foreground">So trainieren wir mit dir:</p>
              <dl className="mt-4 grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {inhalt.soArbeiten.map((punkt) => (
                  <div key={punkt.titel} className="border-t border-lime/40 pt-4">
                    <dt className="font-semibold">{punkt.titel}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-muted">{punkt.text}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-8 max-w-xl text-sm text-muted">{inhalt.hinweis}</p>

              <Button href={probeterminHref(inhalt.wert)} className="mt-8">
                Probetraining für „{inhalt.kurz}“
                <ArrowRight size={16} aria-hidden />
              </Button>
            </motion.div>
          </AnimatePresence>

          <Schwerpunkt profil={inhalt.profil} titel={inhalt.kurz} />
        </div>
      </Container>
    </section>
  );
}

/**
 * Die acht Zonen der Weste als Regler. Beim Zielwechsel federn alle
 * gleichzeitig auf den neuen Schwerpunkt - leicht versetzt von oben nach
 * unten, damit das Auge der Bewegung folgen kann.
 */
function Schwerpunkt({ profil, titel }: { profil: number[]; titel: string }) {
  const wenigerBewegung = useReducedMotion();
  const staerkste = new Set(
    [...profil]
      .map((wert, i) => ({ wert, i }))
      .sort((a, b) => b.wert - a.wert)
      .slice(0, 3)
      .map((z) => z.i),
  );

  return (
    <div className="on-ink kal-karte relative rounded-3xl p-6 sm:p-8 lg:sticky lg:top-24">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">Dein Schwerpunkt</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={titel}
            initial={wenigerBewegung ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={wenigerBewegung ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-accent"
          >
            {titel}
          </motion.p>
        </AnimatePresence>
      </div>

      <ul className="mt-6 space-y-4" aria-label={`Beispiel-Schwerpunkte für ${titel}`}>
        {ZONEN.map((zone, i) => {
          const wert = profil[i] ?? 0.5;
          const stark = staerkste.has(i);
          return (
            <li key={zone} className="grid grid-cols-[7.5rem_1fr] items-center gap-4 text-sm">
              <span className={`text-right transition-colors duration-500 ${stark ? "font-semibold text-foreground" : "text-muted"}`}>
                {zone}
              </span>
              <span className="relative h-1.5 rounded-full bg-white/10">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-[var(--ink-lime)]"
                  initial={false}
                  animate={{ width: `${wert * 100}%`, opacity: stark ? 1 : 0.55 }}
                  transition={
                    wenigerBewegung
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 120, damping: 18, delay: i * 0.04 }
                  }
                />
                <motion.span
                  aria-hidden
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--ink-lime)] bg-[#0d0f0a]"
                  initial={false}
                  animate={{ left: `${wert * 100}%`, scale: stark ? 1.15 : 1 }}
                  transition={
                    wenigerBewegung
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 120, damping: 18, delay: i * 0.04 }
                  }
                />
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-muted">
        Ein Beispiel. Deinen echten Schwerpunkt legst du im Probetraining mit deinem Trainer fest –
        und er stellt ihn bei jeder Einheit neu ein.
      </p>
    </div>
  );
}
