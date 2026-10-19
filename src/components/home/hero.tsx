"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Der erste Bildschirm.
 *
 * Vorige Fassung: eine gezeichnete Figur und die Überschrift "20 Minuten
 * Training. Ein sichtbarer Unterschied." Sauber, aber sachlich - sie sagte,
 * WAS es gibt, nicht, WARUM jemand es will. Wer abends nach zehn Stunden
 * Arbeit auf die Seite kommt, entscheidet in zwei Sekunden, ob sie ihn
 * meint.
 *
 * Diese Fassung spricht genau diesen Menschen an:
 *
 *   "Du bist für alle da. Bleib es auch."
 *
 * Für Kinder, Enkel, Partner, Kollegen da sein - und dafür selbst in Form
 * bleiben wollen. Bewusst positiv: Ein Satz wie "Wer nicht trainiert,
 * lässt seine Familie im Stich" wäre Angstmache, wirkt aufdringlich und
 * ist wettbewerbsrechtlich heikel. Kein Wirkungsversprechen, keine Zahl,
 * die niemand belegen kann. Dazu ein Foto statt einer Zeichnung: ein Trainer,
 * der neben jemandem kniet und hinsieht. Das ist das Versprechen der
 * ganzen Seite ("persönlich betreut") als Bild.
 *
 * Kleine Geschichte am Rand: "18:40 noch im Büro" -> "19:00 Deine 20
 * Minuten" -> "19:40 wieder bei deinen Liebsten". Ein Abend in drei
 * Schritten, ohne einen Satz Erklärung.
 *
 * EHRLICH BLEIBEN: Beide Fotos sind lizenzfreie Symbolbilder (Pexels,
 * siehe public/bilder/start/QUELLEN.md), nicht Körperformen. Deshalb
 * steht unten rechts klein "Symbolfoto". Sobald eigene Fotos da sind,
 * die Dateien mit gleichem Namen ersetzen und den Vermerk entfernen.
 *
 * Ladezeit: Die Eingangsanimation läuft weiter über CSS (.hero-anim in
 * globals.css), nicht über Motion - sonst stünde der Text bis zur
 * Hydration unsichtbar da. Das Hauptbild hat priority: Es ist das größte
 * Element des ersten Bildschirms und bestimmt, wann die Seite "da" ist.
 */

/** Zeilenweiser Wortaufbau - jedes Wort steigt aus seiner Zeile herauf. */
function StaggeredLine({
  text,
  className,
  startDelay,
}: {
  text: string;
  className?: string;
  startDelay: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, index) => (
        // Das Leerzeichen steht zwischen den Wortcontainern: Innerhalb des
        // beschnittenen Containers würde es verschluckt.
        <Fragment key={index}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span
              className="hero-anim-word"
              style={{ "--hero-delay": `${startDelay + index * 0.06}s` } as React.CSSProperties}
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

export type NaechsterTermin = {
  label: string;
  studio: string;
  href: string;
  /** Wie viele Plätze in den nächsten sieben Tagen noch frei sind. */
  freieDieseWoche: number | null;
};

const verz = (s: number) => ({ "--hero-delay": `${s}s` }) as React.CSSProperties;

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
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  // Drei Ebenen, drei Tempi: Das Foto zieht am langsamsten mit, der Text
  // schneller, die kleine Geschichte am Rand dazwischen. Bei "Bewegung
  // reduzieren" steht alles; nur das Ausblenden bleibt.
  const bildY = useTransform(scrollYProgress, [0, 1], [0, wenigerBewegung ? 0 : 160]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, wenigerBewegung ? 0 : 70]);
  const geschichteY = useTransform(scrollYProgress, [0, 1], [0, wenigerBewegung ? 0 : 110]);
  const inhaltOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="on-ink hero-foto relative isolate flex min-h-[92vh] items-end overflow-hidden lg:items-center"
    >
      {/* Das Foto, langsam heranzoomend. */}
      <motion.div style={{ y: bildY }} className="absolute inset-0 -z-20">
        <div className="hero-foto-bild absolute inset-0">
          <Image
            src="/bilder/start/trainer-und-trainierende.jpg"
            alt="Ein Trainer kniet neben einer Frau und begleitet sie bei einer Übung."
            fill
            priority
            sizes="100vw"
            className="object-cover object-[82%_center] lg:object-[62%_center]"
          />
        </div>
      </motion.div>
      {/* Der Schleier: links dunkel für den Text, rechts frei für das Bild.
          Auf dem Handy von unten, weil der Text dort unten steht. */}
      <div aria-hidden className="hero-foto-schleier absolute inset-0 -z-10" />

      <motion.div style={{ opacity: inhaltOpacity }} className="w-full">
        <Container className="relative pb-16 pt-40 sm:pb-20 lg:py-28">
          <motion.div style={{ y: textY }} className="min-w-0 max-w-xl">
            <span
              className="hero-anim inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground/85 backdrop-blur-sm"
              style={verz(0.15)}
            >
              <MapPin size={13} className="text-accent" aria-hidden />
              {anzahlStudios > 1 ? `${anzahlStudios} Studios rund um Köln` : standorte}
            </span>

            <h1 className="font-display mt-6 text-[2.9rem] font-black leading-[1.02] tracking-tight sm:text-[4rem] xl:text-[4.8rem]">
              {/* Geschütztes Leerzeichen: "da." darf nie allein in einer Zeile
                  stehen - als einzelnes Wort fiel die Überschrift auseinander. */}
              <StaggeredLine text={"Du bist für alle\u00a0da."} startDelay={0.25} />
              <br />
              <StaggeredLine text="Bleib es auch." className="text-accent" startDelay={0.55} />
            </h1>

            <p className="hero-anim mt-6 max-w-lg text-lg leading-relaxed text-foreground/80" style={verz(0.75)}>
              Für die Menschen, die dich brauchen – und für dich: 20 Minuten EMS-Training pro
              Woche, mit deinem persönlichen Trainer, ganz in deiner Nähe.
            </p>

            <div className="hero-anim mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={verz(0.88)}>
              <Button href="/probetermin" className="knopf-glanz-dauer px-8 py-3.5">
                Kostenloses Probetraining
                <ArrowRight size={16} aria-hidden />
              </Button>
              <Button href="/ems-training" variant="secondary" className="border-white/25 bg-black/20 backdrop-blur-sm">
                Wie EMS funktioniert
              </Button>
            </div>

            {/* Echte Daten statt eines weiteren Versprechens. Fehlt der
                Termin, entfällt der Block. */}
            {naechsterTermin && (
              <Link
                href={naechsterTermin.href}
                className="hero-anim group mt-7 inline-flex max-w-full items-center gap-4 rounded-2xl border border-lime/40 bg-black/35 px-5 py-4 backdrop-blur-md transition-colors hover:border-lime"
                style={verz(1)}
              >
                <span aria-hidden className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="puls-welle absolute inset-0 rounded-full bg-lime" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-lime" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-widest text-muted">
                    Nächster freier Termin
                  </span>
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
                <ArrowRight size={17} aria-hidden className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}

            <p className="hero-anim mt-6 text-xs text-foreground/70" style={verz(1.1)}>
              Unverbindlich &middot; Ohne Vertragsbindung &middot; Persönlich betreut
            </p>
          </motion.div>

        </Container>
      </motion.div>

      {/* Die kleine Geschichte: Feierabend, dann Training. Unten rechts,
          über Boden und Beinen - nicht über den Gesichtern im Foto. Nur ab
          lg; auf dem Handy wäre dafür kein Platz neben dem Text. */}
      <motion.div
        style={{ y: geschichteY, opacity: inhaltOpacity }}
        className="absolute bottom-[9%] right-[4%] hidden items-center gap-4 lg:flex"
        aria-hidden
      >
        <div className="hero-anim flex items-center gap-3" style={verz(1.15)}>
          <div className="hero-buero h-[74px] w-[64px] overflow-hidden rounded-xl border border-white/15 shadow-2xl">
            <Image
              src="/bilder/start/spaet-im-buero.jpg"
              alt=""
              width={128}
              height={148}
              sizes="64px"
              className="h-full w-full object-cover object-[50%_25%]"
            />
          </div>
          <p className="text-sm leading-tight text-foreground/80">
            <span className="block font-semibold tabular-nums text-foreground">18:40</span>
            noch im Büro
          </p>
        </div>
        <div className="hero-linie hero-anim h-px w-12" style={verz(1.4)} />
        <div
          className="hero-anim hero-chip flex items-center gap-3 rounded-full bg-lime py-2.5 pl-3 pr-5 font-semibold text-on-lime"
          style={verz(1.55)}
        >
          <span className="flex h-8 w-12 items-center justify-center rounded-full bg-black/15 text-xs tabular-nums">
            19:00
          </span>
          Deine 20 Minuten
        </div>
        <div className="hero-linie hero-anim h-px w-12" style={verz(1.75)} />
        <div className="hero-anim flex items-center gap-3" style={verz(1.9)}>
          <div className="hero-familie h-[74px] w-[64px] overflow-hidden rounded-xl border border-lime/50 shadow-2xl">
            <Image
              src="/bilder/start/familie-umarmung.jpg"
              alt=""
              width={128}
              height={148}
              sizes="64px"
              className="h-full w-full object-cover object-[50%_35%]"
            />
          </div>
          <p className="text-sm leading-tight text-foreground/80">
            <span className="block font-semibold tabular-nums text-foreground">19:40</span>
            wieder bei
            <br />
            deinen Liebsten
          </p>
        </div>
      </motion.div>

      <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.18em] text-white/75">
        Symbolfoto
      </span>

      {/* Scroll-Hinweis - verschwindet, sobald jemand zu scrollen beginnt. */}
      <motion.div aria-hidden style={{ opacity: cueOpacity }} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block lg:hidden">
        <div className="hero-anim flex flex-col items-center gap-1 text-foreground/60" style={verz(1.8)}>
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
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
