"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarDays, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ZielMotiv } from "@/components/ziel/ziel-motiv";
import { ZIEL_SPEICHER } from "@/components/ziel/ziel-kontext";
import { ZIEL_INHALTE, ZONEN, zielInhalt, type ZielWert } from "@/lib/ziel-inhalte";
import { ERFAHRUNG, type ErfahrungWert, type Fenster, type FensterWert } from "@/lib/ziel-check";
import { istTageszeit, TAGESZEIT_SPEICHER } from "@/lib/wunschzeit";

type Antworten = {
  ziel: ZielWert | "unsicher" | null;
  fenster: FensterWert | null;
  erfahrung: ErfahrungWert | null;
};

const weich = [0.16, 1, 0.3, 1] as const;

/**
 * Drei Fragen, eine nach der anderen, danach der Startplan.
 *
 * Eine Frage pro Bildschirm: Wer sie liest, entscheidet sich mit einem
 * Antippen und ist sofort bei der nächsten - kein Formular, das man erst
 * überblicken muss. Zurück geht immer. Die Antworten verlassen den Browser
 * nicht; nur das Ziel wird für das Probetermin-Formular gemerkt.
 */
export function ZielCheck({
  fensterListe,
  formular,
}: {
  fensterListe: readonly Fenster[];
  /** Das Anfrageformular, vom Server mit den Standorten gebaut. Steht erst
      unter dem fertigen Startplan - vorher wäre es nur im Weg. */
  formular: React.ReactNode;
}) {
  const [schritt, setSchritt] = useState(0);
  const [richtung, setRichtung] = useState(1);
  const [antworten, setAntworten] = useState<Antworten>({ ziel: null, fenster: null, erfahrung: null });
  const still = useReducedMotion();

  function beantworten(teil: Partial<Antworten>) {
    const neu = { ...antworten, ...teil };
    setAntworten(neu);
    setRichtung(1);
    setSchritt((s) => s + 1);
    if (teil.ziel) {
      try {
        sessionStorage.setItem(ZIEL_SPEICHER, teil.ziel);
      } catch {
        // Ohne Speicher eben ohne Vorauswahl im Formular.
      }
    }
    // Das Zeitfenster wird im Formular zur vorausgewählten Wunschzeit.
    // "Ist mir egal" heißt: keine Vorauswahl.
    if (teil.fenster) {
      try {
        if (istTageszeit(teil.fenster)) sessionStorage.setItem(TAGESZEIT_SPEICHER, teil.fenster);
        else sessionStorage.removeItem(TAGESZEIT_SPEICHER);
      } catch {
        // Wie oben.
      }
    }
  }

  function zurueck() {
    setRichtung(-1);
    setSchritt((s) => Math.max(0, s - 1));
  }

  function neu() {
    setRichtung(-1);
    setAntworten({ ziel: null, fenster: null, erfahrung: null });
    setSchritt(0);
  }

  const fragen = [
    {
      titel: "Was willst du erreichen?",
      inhalt: (
        <Optionen
          optionen={[
            ...ZIEL_INHALTE.map((z) => ({ wert: z.wert, label: z.kurz, motiv: z.wert })),
            { wert: "unsicher", label: "Weiß ich noch nicht", motiv: null },
          ]}
          gewaehlt={antworten.ziel}
          waehlen={(wert) => beantworten({ ziel: wert as Antworten["ziel"] })}
        />
      ),
    },
    {
      titel: "Wann passt Training in deine Woche?",
      inhalt: (
        <Optionen
          optionen={fensterListe.map((f) => ({ wert: f.wert, label: f.label, unter: f.spanne, motiv: null }))}
          gewaehlt={antworten.fenster}
          waehlen={(wert) => beantworten({ fenster: wert as FensterWert })}
        />
      ),
    },
    {
      titel: "Wie viel Erfahrung hast du mit Krafttraining?",
      inhalt: (
        <Optionen
          optionen={ERFAHRUNG.map((e) => ({ wert: e.wert, label: e.label, motiv: null }))}
          gewaehlt={antworten.erfahrung}
          waehlen={(wert) => beantworten({ erfahrung: wert as ErfahrungWert })}
        />
      ),
    },
  ];

  const fertig = schritt >= fragen.length;

  return (
    <>
      <section className="on-ink hero-foto relative isolate min-h-[80vh] overflow-hidden">
        <div aria-hidden className="hero-schein pointer-events-none absolute -z-10" />
        <Container className="max-w-3xl py-14 sm:py-20">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-accent">Ziel-Check · 30 Sekunden</p>
            {!fertig && (
              <p className="text-sm tabular-nums text-muted" aria-live="polite">
                Frage {schritt + 1} von {fragen.length}
              </p>
            )}
          </div>

          {/* Fortschritt: drei Abschnitte, die sich nacheinander füllen. */}
          <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
            {fragen.map((_, i) => (
              <span key={i} className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.span
                  className="block h-full rounded-full bg-[var(--ink-lime)]"
                  initial={false}
                  animate={{ width: i < schritt ? "100%" : "0%" }}
                  transition={still ? { duration: 0 } : { duration: 0.5, ease: weich }}
                />
              </span>
            ))}
          </div>

          <div className="relative mt-10">
            <AnimatePresence mode="wait" initial={false} custom={richtung}>
              {!fertig ? (
                <motion.div
                  key={schritt}
                  custom={richtung}
                  initial={still ? false : { opacity: 0, x: 40 * richtung }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={still ? undefined : { opacity: 0, x: -40 * richtung }}
                  transition={{ duration: 0.35, ease: weich }}
                >
                  <h1 className="font-display text-balance text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                    {fragen[schritt].titel}
                  </h1>
                  <div className="mt-8">{fragen[schritt].inhalt}</div>
                  {schritt > 0 && (
                    <button
                      type="button"
                      onClick={zurueck}
                      className="mt-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
                    >
                      <ArrowLeft size={16} aria-hidden /> Zurück
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="plan"
                  initial={still ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: weich }}
                >
                  <Startplan antworten={antworten} fensterListe={fensterListe} neu={neu} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </section>

      {/* Direkt unter dem Plan anfragen, statt erst auf eine andere Seite
          zu wechseln. Erst jetzt eingebaut: Das Formular übernimmt beim
          Aufbau Ziel und Tageszeit, die der Check gerade gemerkt hat. */}
      {fertig && (
        <section id="termin" className="scroll-mt-20 border-t border-border bg-surface py-16 sm:py-20">
          <Container className="max-w-3xl">
            <h2 className="font-display text-balance text-2xl font-black tracking-tight sm:text-4xl">
              Gleich hier anfragen<span className="text-accent">.</span>
            </h2>
            <p className="mt-3 max-w-xl text-foreground/80">
              Ziel und Tageszeit aus deinem Check sind schon eingetragen. Nenn uns noch deine Wunschtage – wir
              melden uns mit einem passenden Termin.
            </p>
            <div className="mt-8">{formular}</div>
          </Container>
        </section>
      )}
    </>
  );
}

function Optionen({
  optionen,
  gewaehlt,
  waehlen,
}: {
  optionen: { wert: string; label: string; unter?: string; motiv: ZielWert | null }[];
  gewaehlt: string | null;
  waehlen: (wert: string) => void;
}) {
  const still = useReducedMotion();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {optionen.map((o, i) => {
        const aktiv = o.wert === gewaehlt;
        return (
          <motion.button
            key={o.wert}
            type="button"
            onClick={() => waehlen(o.wert)}
            initial={still ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 + i * 0.04, ease: weich }}
            whileTap={still ? undefined : { scale: 0.98 }}
            className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              aktiv ? "border-lime bg-lime/10" : "border-white/15 bg-white/[0.03] hover:border-lime/60 hover:bg-white/[0.06]"
            }`}
          >
            {o.motiv ? (
              <span className="h-12 w-12 shrink-0 rounded-xl bg-black/40 p-1.5">
                <ZielMotiv ziel={o.motiv} stehend className="h-full w-full" />
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">{o.label}</span>
              {o.unter && <span className="mt-0.5 block text-sm text-muted">{o.unter}</span>}
            </span>
            <ArrowRight
              size={18}
              aria-hidden
              className="shrink-0 text-accent opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
            />
          </motion.button>
        );
      })}
    </div>
  );
}

function Startplan({
  antworten,
  fensterListe,
  neu,
}: {
  antworten: Antworten;
  fensterListe: readonly Fenster[];
  neu: () => void;
}) {
  const still = useReducedMotion();
  const offen = antworten.ziel === "unsicher";
  // "Weiß ich noch nicht": ausgewogen über den ganzen Körper - genau das
  // ist "Fitter im Alltag". Das eigentliche Ziel klärt das Probetraining.
  const inhalt = zielInhalt(offen ? "fitness" : antworten.ziel) ?? ZIEL_INHALTE[0];
  const fenster = fensterListe.find((f) => f.wert === antworten.fenster);
  const erfahrung = ERFAHRUNG.find((e) => e.wert === antworten.erfahrung);
  const schwerpunkte = inhalt.profil
    .map((wert, i) => ({ wert, zone: ZONEN[i] }))
    .sort((a, b) => b.wert - a.wert)
    .slice(0, 3)
    .map((z) => z.zone)
    .join(", ");

  const zeilen = [
    { label: "Dein Ziel", wert: offen ? "Finden wir gemeinsam heraus" : inhalt.kurz },
    { label: "Schwerpunkte", wert: offen ? "Ganzer Körper, ausgewogen" : schwerpunkte },
    {
      label: "Dein Rhythmus",
      wert: `1× pro Woche, 20 Minuten${fenster?.imSatz ? ` · ${fenster.imSatz}` : ""}`,
    },
    { label: "Dein Einstieg", wert: erfahrung?.einstieg ?? "" },
  ];

  return (
    <div>
      <h1 className="font-display text-balance text-3xl font-black leading-tight tracking-tight sm:text-5xl">
        Dein Startplan<span className="text-accent">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-foreground/80">
        {offen
          ? "Kein Problem – im Probetraining findet dein Trainer mit dir heraus, was für dich am meisten zählt."
          : inhalt.antwort}
      </p>

      <div className="kal-karte relative mt-10 overflow-hidden rounded-3xl p-6 sm:p-8">
        {/* Ein Impuls läuft einmal über die Karte, wenn der Plan erscheint. */}
        <svg aria-hidden viewBox="0 0 600 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-8 w-full">
          <motion.path
            d="M0 20 H250 L262 6 L276 34 L290 12 L300 20 H600"
            fill="none"
            stroke="var(--ink-lime)"
            strokeWidth={2}
            initial={still ? false : { pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </svg>

        <div className="grid gap-8 pt-4 sm:grid-cols-[1fr_9rem] sm:items-start">
          <dl className="divide-y divide-white/10">
            {zeilen.map((zeile, i) => (
              <motion.div
                key={zeile.label}
                initial={still ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.12, ease: weich }}
                className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4"
              >
                <dt className="text-sm text-muted">{zeile.label}</dt>
                <dd className="font-semibold leading-snug">{zeile.wert}</dd>
              </motion.div>
            ))}
          </dl>
          <motion.div
            initial={still ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.3 }}
            className="mx-auto h-36 w-36 rounded-2xl bg-black/40 p-4 sm:order-last"
          >
            <ZielMotiv ziel={inhalt.wert} className="h-full w-full" />
          </motion.div>
        </div>

        {/* Kein fester Termin: Die Studios teilen ihr Team nach den Anfragen
            ein (siehe @/lib/wunschzeit). Die Tageszeit steht im Formular
            schon drin. */}
        <motion.div
          initial={still ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.95, ease: weich }}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-lime/40 bg-lime/5 px-4 py-3"
        >
          <CalendarDays size={18} className="shrink-0 text-accent" aria-hidden />
          <p className="text-sm">
            <span className="font-semibold">
              {fenster?.imSatz ? `Wunschzeit ${fenster.imSatz} ist vorgemerkt.` : "Nenn uns im nächsten Schritt deine Wunschzeit."}
            </span>{" "}
            <span className="text-muted">Wir melden uns mit einem passenden Termin.</span>
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={still ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.1, ease: weich }}
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Button href="#termin" className="knopf-glanz-dauer whitespace-nowrap px-8 py-3.5">
          Probetraining mit diesem Plan
          <ArrowRight size={16} aria-hidden />
        </Button>
        {!offen && (
          <Button href={`/ziel/${inhalt.wert}`} variant="secondary" className="border-white/25">
            Alles zu „{inhalt.kurz}“
          </Button>
        )}
      </motion.div>
      <p className="mt-4 text-xs text-foreground/70">
        Kostenlos und unverbindlich. Deine Antworten bleiben in deinem Browser.
      </p>
      <button
        type="button"
        onClick={neu}
        className="mt-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <RotateCcw size={15} aria-hidden /> Noch einmal von vorn
      </button>
    </div>
  );
}
