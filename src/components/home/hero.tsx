"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "motion/react";
import { ArrowRight, CalendarClock, ChevronDown, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmsFigur } from "@/components/home/ems-figur";

/**
 * Der erste Bildschirm.
 *
 * Erste Fassung: sechs zentrierte Blöcke untereinander, links und rechts
 * je ein Viertel leere Fläche. Zweite Fassung: zwei Spalten, rechts eine
 * Karte mit einem Ring, vier Stichpunkten und dem nächsten freien Termin.
 * Sachlich besser - aber immer noch ein Kasten mit Text darin. Nichts,
 * wovon jemand hängen bleibt, und der erste Eindruck von Fremden
 * entscheidet sich in zwei Sekunden.
 *
 * Diese Fassung: Der Kasten ist weg. Rechts steht jetzt eine gezeichnete
 * Figur im EMS-Anzug, an der die Elektroden der Reihe nach aufleuchten
 * (siehe ems-figur.tsx). Sie zeigt, was im Training passiert, statt es zu
 * behaupten - und sie ist der Blickfang, der bisher fehlte.
 *
 * Was vorher im Kasten stand, steht jetzt dort, wo es hingehört:
 *
 *   - Die drei Merkmale hängen als Fähnchen an der Figur. Sie zeigen damit
 *     auf etwas, statt untereinander in einer Liste zu stehen.
 *   - Der nächste freie Termin steht links unter den Knöpfen. Er ist eine
 *     Handlungsaufforderung, keine Eigenschaft - und links liest ihn
 *     jeder, rechts las ihn niemand.
 *
 * Was hier weiterhin NICHT steht: ein Foto. Begründung in ems-figur.tsx.
 *
 * Wichtig für die Ladezeit: Die Eingangsanimation läuft über CSS-Klassen
 * (siehe globals.css), nicht über Motion. Über Motion gesteuert stünde der
 * gesamte Hero bis zur Hydration bei opacity 0 - auf einem langsamen
 * Mobilgerät rund drei Sekunden leerer Bildschirm, in denen Google die
 * Überschrift als nicht dargestellt wertet.
 */

/** Zeilenweiser Wortaufbau - jedes Wort steigt aus seiner Zeile herauf. */
function StaggeredLine({
  text,
  className,
  startDelay,
}: {
  text: string;
  className?: string;
  /** Verzögerung des ersten Wortes in Sekunden. */
  startDelay: number;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        // Das Leerzeichen steht bewusst zwischen den Wortcontainern und
        // nicht in ihnen: Innerhalb des überlaufenden Containers wird ein
        // abschließendes Leerzeichen verschluckt, und die Wörter kleben
        // aneinander.
        <Fragment key={index}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span
              className="hero-anim-word"
              style={{ "--hero-delay": `${startDelay + index * 0.05}s` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Die Fähnchen an der Grafik.
 *
 * Sie sitzen in den Ecken des Bildrahmens. Grund: Die Grafik ist ein
 * Kreis in einem Quadrat - frei ist genau das, was der Kreis nicht
 * ausfüllt, und das sind die vier Ecken. In der ersten Fassung stand eines
 * davon auf halber Höhe rechts und lag damit mitten auf dem Ring.
 *
 * Die kurze Linie zeigt zur Grafik hin: Damit gehört das Fähnchen zum
 * Bild, statt daneben zu schweben.
 */
const fahnen: {
  icon: typeof CalendarClock;
  text: string;
  /** Ankerpunkt am Bildrahmen. */
  stil: string;
  /** Von welcher Seite die Linie zur Grafik zeigt. */
  seite: "links" | "rechts";
  verzoegerung: string;
}[] = [
  {
    icon: CalendarClock,
    text: "Einmal pro Woche",
    stil: "left-0 top-[2%]",
    seite: "rechts",
    verzoegerung: "0.9s",
  },
  {
    icon: ShieldCheck,
    text: "Kein Abo beim Probetraining",
    stil: "right-0 bottom-[10%]",
    seite: "links",
    verzoegerung: "1.05s",
  },
  {
    icon: UserRound,
    text: "Immer persönlich betreut",
    stil: "left-0 bottom-[2%]",
    seite: "rechts",
    verzoegerung: "1.2s",
  },
];

export type NaechsterTermin = {
  label: string;
  studio: string;
  href: string;
  /** Wie viele Plätze in den nächsten sieben Tagen noch frei sind. */
  freieDieseWoche: number | null;
};

export function Hero({
  standorte,
  anzahlStudios,
  naechsterTermin,
}: {
  standorte: string;
  anzahlStudios: number;
  naechsterTermin: NaechsterTermin | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const wenigerBewegung = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /**
   * Die Dauerbewegungen der Grafik anhalten, sobald sie aus dem Bild ist.
   *
   * Gemessen auf einem sechsfach gebremsten Gerät: Mit laufenden
   * Animationen fällt das Scrollen von 58 auf 50 Bilder pro Sekunde - und
   * zwar auf der ganzen Seite, nicht nur im Hero. Der Browser zeichnet den
   * drehenden Ring und die zwölf Punkte auch dann bei jedem Bild neu, wenn
   * sie zehn Bildschirme weiter oben stehen und niemand sie sieht.
   *
   * Das kostet außerdem Akku - auf einem Handy der Grund, warum eine Seite
   * sich "schwer" anfühlt, ohne dass man sagen könnte warum.
   */
  const [sichtbar, setSichtbar] = useState(true);
  useEffect(() => {
    const ziel = sectionRef.current;
    if (!ziel || typeof IntersectionObserver === "undefined") return;
    const beobachter = new IntersectionObserver(
      ([eintrag]) => setSichtbar(eintrag.isIntersecting),
      // Ein großzügiger Rand: Die Animationen sollen schon laufen, bevor
      // die Grafik ins Bild kommt, sonst startet sie sichtbar neu.
      { rootMargin: "200px" },
    );
    beobachter.observe(ziel);
    return () => beobachter.disconnect();
  }, []);

  // Parallax: der Text zieht beim Wegscrollen langsamer mit als die Seite,
  // die Figur noch etwas langsamer als der Text. Der kleine Unterschied
  // ist es, der Tiefe erzeugt - zwei Ebenen mit demselben Tempo sind eine.
  //
  // Bei "Bewegung reduzieren" bleibt beides stehen. Parallax ist das
  // Lehrbuchbeispiel für die Bewegung, die diese Einstellung meint: Inhalt,
  // der sich anders bewegt als die Seite, ist für Menschen mit
  // vestibulären Beschwerden nicht unangenehm, sondern auslösend. Das
  // sanfte Ausblenden bleibt - Deckkraft löst das nicht aus.
  const textY = useTransform(scrollYProgress, [0, 1], [0, wenigerBewegung ? 0 : 90]);
  const figurY = useTransform(scrollYProgress, [0, 1], [0, wenigerBewegung ? 0 : 150]);
  const inhaltOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="hero-wash relative flex min-h-[92vh] items-center overflow-hidden bg-background"
    >
      {/* Der farbige Schimmer wird direkt in die Fläche des Abschnitts
          gemalt (siehe .hero-wash in globals.css) statt über zwei große
          halbtransparente Ebenen darüberzuliegen.

          Gemessen: Die beiden Ebenen kosteten drei Viertel der Bildrate -
          die Startseite schaffte damit 16 statt 60 Bilder pro Sekunde,
          weil bei jedem erzeugten Bild eine bildschirmgroße durchsichtige
          Fläche neu überlagert werden musste. Auf älteren Geräten war das
          als Ruckeln beim Scrollen zu sehen. Ein Verlauf im Hintergrund
          des Abschnitts wird dagegen einmal gezeichnet. */}
      <div aria-hidden className="soft-glow pointer-events-none absolute inset-0" />

      <motion.div style={{ opacity: inhaltOpacity }} className="w-full">
        {/* Zwei Spalten statt zwölf: Bei einem Zwölferraster mit großem
            Abstand gehen elf Abstände von der Breite ab, und die
            Textspalte wird schmaler als sie aussieht. Hier greift der
            Abstand genau einmal - zwischen Text und Figur. */}
        <Container className="grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* ---------------- Linke Spalte: die Aussage ----------------

              min-w-0: Rasterspalten dürfen von sich aus nicht schmaler
              werden als ihr breitester Inhalt. Der Terminkasten weiter
              unten ist ein inline-flex und damit so breit wie sein Text -
              auf einem 390 Pixel breiten Gerät wuchs die Spalte dadurch
              auf 429 Pixel, und der Hero schnitt rechts alles ab, was
              nicht mehr hineinpasste. Gemerkt hat man davon nichts: Der
              Abschnitt hat overflow-hidden, die Seite scrollt also nicht
              quer, der Text war einfach weg. */}
          <motion.div style={{ y: textY }} className="min-w-0">
            <span
              className="hero-anim inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-raised px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted"
              style={{ "--hero-delay": "0.15s" } as React.CSSProperties}
            >
              {/* Der Punkt pulst leise - er macht aus einer Angabe eine
                  laufende Sache. Reine Zierde, deshalb ausgeblendet für
                  Vorleseprogramme. */}
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="puls-welle absolute inset-0 rounded-full bg-lime" />
                <span className="relative h-2 w-2 rounded-full bg-lime" />
              </span>
              {standorte}
            </span>

            {/* Die Größen sind an der Spaltenbreite gemessen, nicht
                geraten: Bei 4,2rem brach "20 Minuten Training." in der
                schmaleren Spalte um, und die Überschrift stand vierzeilig
                da. */}
            <h1 className="font-display mt-7 text-[2.6rem] font-black leading-[1.06] tracking-tight sm:text-[3.25rem] lg:text-[3rem] xl:text-[3.4rem]">
              <StaggeredLine text="20 Minuten Training." startDelay={0.25} />
              <br />
              {/* Ohne text-glow: Die Wörter steigen aus einem beschnittenen
                  Kasten herauf, und dieser Kasten beschneidet auch den
                  Schein. Im Dunkelmodus stand deshalb hinter jedem Wort ein
                  sichtbares Rechteck. */}
              <StaggeredLine
                text="Ein sichtbarer Unterschied."
                className="text-accent-strong"
                startDelay={0.4}
              />
            </h1>

            <p
              className="hero-anim mt-6 max-w-xl text-lg leading-relaxed text-muted"
              style={{ "--hero-delay": "0.6s" } as React.CSSProperties}
            >
              Effektives EMS-Training für Berufstätige mit wenig Zeit. Einmal pro
              Woche, gelenkschonend, persönlich betreut - bei Körperformen.
            </p>

            <div
              className="hero-anim mt-8 flex flex-col gap-4 sm:flex-row"
              style={{ "--hero-delay": "0.72s" } as React.CSSProperties}
            >
              <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
              <Button href="/ems-training" variant="secondary">
                Wie EMS funktioniert
              </Button>
            </div>

            {/* Echte Daten statt eines weiteren Versprechens. Steht bewusst
                links unter den Knöpfen: Das ist eine Verabredung, keine
                Eigenschaft - und "Donnerstag um 9 in Hürth" ist etwas
                anderes als "jetzt Termin sichern". Fehlt der Termin,
                entfällt der Block; eine Zeile "aktuell keine Termine" wäre
                auf dem ersten Bildschirm das falsche Signal. */}
            {naechsterTermin && (
              <Link
                href={naechsterTermin.href}
                className="hero-anim group mt-7 inline-flex max-w-full items-center gap-4 rounded-2xl border border-lime/40 bg-lime/5 px-5 py-4 transition-colors hover:border-lime"
                style={{ "--hero-delay": "0.84s" } as React.CSSProperties}
              >
                {/* Derselbe pulsende Punkt wie oben an der Standortzahl.
                    Er sagt in einem Zeichen, was drei Wörter bräuchten:
                    Das hier ist gerade eben so, nicht irgendwann mal
                    aufgeschrieben. */}
                <span aria-hidden className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="puls-welle absolute inset-0 rounded-full bg-lime" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-lime" />
                </span>

                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-widest text-muted">
                    Nächster freier Termin
                  </span>
                  {/* Eine Stufe größer als vorher. Das ist der einzige
                      Satz auf dem ersten Bildschirm, der etwas Prüfbares
                      sagt - er stand bisher in derselben Größe wie das
                      Kleingedruckte darunter. */}
                  {/* Kein truncate mehr: Auf einem schmalen Gerät passt
                      "Fr., 11.09. um 09:00 Uhr · Körperformen Hürth" nicht
                      in eine Zeile, und abgeschnitten wurde ausgerechnet
                      der Studioname - also die Hälfte der Auskunft. Zwei
                      Zeilen sind hier besser als eine mit Auslassung. */}
                  <span className="mt-0.5 block text-base font-semibold">
                    {naechsterTermin.label}
                    {naechsterTermin.studio && (
                      <span className="font-normal text-muted"> · {naechsterTermin.studio}</span>
                    )}
                  </span>
                  {naechsterTermin.freieDieseWoche && (
                    <span className="mt-1 block text-xs text-muted">
                      {naechsterTermin.freieDieseWoche} freie Termine in den nächsten 7 Tagen
                    </span>
                  )}
                </span>

                <ArrowRight
                  size={17}
                  aria-hidden
                  className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}

            <p
              className="hero-anim mt-6 text-xs text-muted"
              style={{ "--hero-delay": "0.96s" } as React.CSSProperties}
            >
              Unverbindlich &middot; Ohne Vertragsbindung &middot; Persönlich betreut
            </p>
          </motion.div>

          {/* ---------------- Rechte Spalte: die Figur ---------------- */}
          {/* Auf dem Handy zuerst der Text, dann die Figur - deshalb keine
              Umsortierung. Wer auf 390 Pixeln landet, soll die Überschrift
              sehen und nicht eine Zeichnung, die den halben Bildschirm
              füllt. Sie ist dort auch kleiner. */}
          <motion.div
            // Der Parallax-Wert und die Verzögerung der Eingangsanimation
            // teilen sich dieselbe Angabe - deshalb beides in einem Objekt.
            style={{ y: figurY, "--hero-delay": "0.5s" } as MotionStyle}
            className="hero-anim relative mx-auto w-full max-w-[300px] sm:max-w-[360px] lg:max-w-none"
          >
            <div className="relative">
              {/* Die Grafik trägt die 20 Minuten selbst - hier stand
                  vorher zusätzlich eine kleine Marke mit derselben Zahl.

                  Etwas schmaler als der Rahmen: Der Kreis rückt damit von
                  den Ecken ab, und die Fähnchen bekommen dort Platz, ohne
                  auf dem Ring zu liegen. */}
              <EmsFigur className={`mx-auto w-[88%] ${sichtbar ? "" : "bewegung-aus"}`} />

              {/* Die Fähnchen. Erst ab lg sichtbar: Auf schmalen Geräten
                  läge jedes davon quer über der Figur, weil links und
                  rechts kein Platz daneben ist. Der Inhalt geht dort nicht
                  verloren - er steht unter der Figur als Zeile. */}
              {fahnen.map((fahne) => (
                <div
                  key={fahne.text}
                  className={`hero-anim absolute hidden items-center gap-2 lg:flex ${fahne.stil}`}
                  style={{ "--hero-delay": fahne.verzoegerung } as React.CSSProperties}
                >
                  {fahne.seite === "links" && (
                    <span aria-hidden className="h-px w-5 bg-border" />
                  )}
                  <span className="flex items-center gap-2 rounded-full border border-border bg-surface-raised/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm">
                    <fahne.icon size={13} className="shrink-0 text-accent" aria-hidden />
                    {fahne.text}
                  </span>
                  {fahne.seite === "rechts" && (
                    <span aria-hidden className="h-px w-5 bg-border" />
                  )}
                </div>
              ))}
            </div>

            {/* Dieselben Angaben als Zeile - unter lg, wo die Fähnchen
                keinen Platz haben. */}
            <p className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted lg:hidden">
              {fahnen.map((fahne) => (
                <span key={fahne.text} className="flex items-center gap-1.5">
                  <fahne.icon size={12} className="text-accent" aria-hidden />
                  {fahne.text}
                </span>
              ))}
              {anzahlStudios > 1 && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-accent" aria-hidden />
                  {anzahlStudios} Standorte
                </span>
              )}
            </p>
          </motion.div>
        </Container>
      </motion.div>

      {/* Scroll-Hinweis - verschwindet, sobald jemand zu scrollen beginnt. */}
      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div
          className="hero-anim flex flex-col items-center gap-1 text-muted"
          style={{ "--hero-delay": "1.6s" } as React.CSSProperties}
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          {/* Ein endlos hüpfender Pfeil ist genau die Art Bewegung, die
              jemand abstellt, der "Bewegung reduzieren" einschaltet - bei
              Migräne oder vestibulären Beschwerden ist sie nicht
              unangenehm, sondern auslösend. Er bleibt dann einfach stehen;
              der Hinweis selbst geht dabei nicht verloren. */}
          <motion.span
            animate={wenigerBewegung ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
