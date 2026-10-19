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
 * die niemand belegen kann. Dazu ein Foto statt einer Zeichnung: eine
 * Trainerin, die neben jemandem steht und hinsieht - bei einer Kniebeuge
 * ohne Gewichte. Das ist das Versprechen der ganzen Seite ("persönlich
 * betreut") als Bild. Ein früheres Foto zeigte Hanteln und ein Zuggerät;
 * beides gibt es in den Studios nicht, das hätte in die Irre geführt.
 *
 * Kleine Geschichte am Rand: "18:40 noch im Büro" -> "19:00 Deine 20
 * Minuten" -> "19:40 wieder bei deinen Liebsten". Ein Abend in drei
 * Schritten, ohne einen Satz Erklärung.
 *
 * DAS FOTO ist ein echtes Körperformen-Foto (Studio, Logo, EMS-Gerät,
 * Anzug). Es kam gespiegelt an - das Logo an der Wand stand
 * spiegelverkehrt - und ist zurückgedreht. Weil der Kunde links im Bild
 * steht, liegt es nicht mehr vollflächig hinter dem Text, sondern als
 * gerahmte Karte rechts daneben: So verdeckt die Überschrift niemanden.
 * Die zwei Mini-Fotos der Abend-Geschichte bleiben Symbolbilder von
 * Pexels (siehe public/bilder/start/QUELLEN.md).
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
    <section ref={sectionRef} className="on-ink hero-foto relative isolate overflow-hidden">
      {/* Ein weicher Lime-Schein hinter dem Foto - der einzige Farbfleck. */}
      <div aria-hidden className="hero-schein pointer-events-none absolute -z-10" />

      <motion.div style={{ opacity: inhaltOpacity }}>
        <Container className="grid items-center gap-10 pb-16 pt-8 sm:pb-20 lg:min-h-[88vh] lg:grid-cols-[1fr_1.12fr] lg:gap-14 lg:py-20">
          {/* ---------- Das Foto: auf dem Handy zuerst, am Computer rechts ---------- */}
          <motion.div style={{ y: bildY }} className="relative lg:order-2">
            <div className="hero-anim hero-rahmen relative overflow-hidden rounded-[1.75rem]" style={verz(0.1)}>
              <div className="hero-foto-bild relative aspect-[16/11] lg:aspect-[4/3]">
                <Image
                  src="/bilder/start/studio-high-five.jpg"
                  alt="Ein Körperformen-Trainer gibt einem Kunden im EMS-Anzug ein High Five, daneben das EMS-Gerät."
                  fill
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover object-[60%_center]"
                />
              </div>
            </div>

            {/* Die kleine Geschichte: Feierabend, Training, zuhause. Hängt
                unten am Foto; nur ab lg, auf dem Handy wäre kein Platz. */}
            <motion.div
              style={{ y: geschichteY }}
              className="absolute -bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 lg:flex"
              aria-hidden
            >
              <div className="hero-anim hero-geschichte flex items-center gap-2.5 rounded-2xl py-2 pl-2 pr-4" style={verz(1.15)}>
                <div className="hero-buero h-11 w-11 overflow-hidden rounded-xl">
                  <Image src="/bilder/start/spaet-im-buero.jpg" alt="" width={88} height={88} sizes="44px" className="h-full w-full object-cover object-[50%_25%]" />
                </div>
                <p className="whitespace-nowrap text-xs leading-tight text-foreground/80">
                  <span className="block font-semibold tabular-nums text-foreground">18:40</span>
                  noch im Büro
                </p>
              </div>
              <div className="hero-linie hero-anim h-px w-6" style={verz(1.35)} />
              <div className="hero-anim hero-chip flex items-center gap-2 whitespace-nowrap rounded-full bg-lime py-2 pl-2 pr-4 text-sm font-semibold text-on-lime" style={verz(1.5)}>
                <span className="rounded-full bg-black/15 px-2 py-1 text-[11px] tabular-nums">19:00</span>
                Deine 20 Minuten
              </div>
              <div className="hero-linie hero-anim h-px w-6" style={verz(1.65)} />
              <div className="hero-anim hero-geschichte flex items-center gap-2.5 rounded-2xl py-2 pl-2 pr-4" style={verz(1.8)}>
                <div className="hero-familie h-11 w-11 overflow-hidden rounded-xl">
                  <Image src="/bilder/start/familie-umarmung.jpg" alt="" width={88} height={88} sizes="44px" className="h-full w-full object-cover object-[50%_35%]" />
                </div>
                <p className="whitespace-nowrap text-xs leading-tight text-foreground/80">
                  <span className="block font-semibold tabular-nums text-foreground">19:40</span>
                  bei deinen Liebsten
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ---------- Die Aussage ---------- */}
          <motion.div style={{ y: textY }} className="min-w-0 lg:order-1">
            <span
              className="hero-anim inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground/85"
              style={verz(0.15)}
            >
              <MapPin size={13} className="text-accent" aria-hidden />
              {anzahlStudios > 1 ? `${anzahlStudios} Studios rund um Köln` : standorte}
            </span>

            <h1 className="font-display mt-6 text-[2.9rem] font-black leading-[1.02] tracking-tight sm:text-[4rem] xl:text-[4.6rem]">
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
              <Button href="/ems-training" variant="secondary" className="border-white/25">
                Wie EMS funktioniert
              </Button>
            </div>

            {/* Echte Daten statt eines weiteren Versprechens. Fehlt der
                Termin, entfällt der Block. */}
            {naechsterTermin && (
              <Link
                href={naechsterTermin.href}
                className="hero-anim group mt-7 inline-flex max-w-full items-center gap-4 rounded-2xl border border-lime/40 bg-lime/5 px-5 py-4 transition-colors hover:border-lime"
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
              Kostenlos &middot; Unverbindlich &middot; Persönlich betreut
            </p>
          </motion.div>
        </Container>
      </motion.div>

      {/* Scroll-Hinweis - nur auf mittleren Breiten; am Computer liegt dort
          die kleine Geschichte, auf dem Handy wäre er im Weg. */}
      <motion.div aria-hidden style={{ opacity: cueOpacity }} className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 sm:block lg:hidden">
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
