"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ABLAUF_EINHEIT } from "@/lib/ablauf";

/**
 * "Dein Termin, Minute für Minute" - eine Geschichte, die beim Scrollen
 * weiterläuft.
 *
 * Der Abschnitt bleibt stehen (sticky), während man scrollt; eine Uhr
 * zählt die Minuten mit und die Leiste darunter füllt sich Station für
 * Station. Die Leiste ist nach Dauer geteilt: Die 20 Minuten Training
 * nehmen sichtbar den größten Teil ein - genau das, was der Abschnitt
 * sagen soll.
 *
 * Kurzfassung von /erster-besuch (components/erster-besuch/
 * ablauf-geschichte.tsx). Beide lesen den Ablauf aus lib/ablauf.ts.
 *
 * Bei "Bewegung reduzieren" steht statt der Geschichte eine einfache
 * Liste - ein stehender Abschnitt, durch den man scrollen muss, ohne dass
 * sich etwas bewegt, wäre nur ein langes Stück Leere.
 */

const weich = [0.16, 1, 0.3, 1] as const;

const dauer = ABLAUF_EINHEIT.map((s) => parseInt(s.duration) || 0);
const gesamt = dauer.reduce((a, b) => a + b, 0);
/** Minute, mit der jede Station beginnt: 0, 5, 10, 13, 33 - und am Ende 38. */
const grenzen = dauer.reduce<number[]>((acc, d) => [...acc, acc[acc.length - 1] + d], [0]);

export function EinheitStory() {
  const still = useReducedMotion();
  return still ? <Liste /> : <Geschichte />;
}

function Geschichte() {
  const ref = useRef<HTMLDivElement>(null);
  const n = ABLAUF_EINHEIT.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Jede Station bekommt gleich viel Scrollweg - sonst müsste man durch
  // die 20 Minuten Training viermal so lange scrollen wie durch den Rest.
  const stufen = grenzen.map((_, i) => i / n);
  const minuten = useTransform(scrollYProgress, stufen, grenzen, { clamp: true });
  const anzeige = useTransform(minuten, (m) => String(Math.round(m)));
  const fuellung = useTransform(minuten, (m) => `${(m / gesamt) * 100}%`);

  const [aktiv, setAktiv] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setAktiv(Math.min(n - 1, Math.max(0, Math.floor(p * n))));
  });
  const schritt = ABLAUF_EINHEIT[aktiv];

  // Es läuft nur die Schleife der aktiven Station - und nur, solange der
  // Abschnitt im Bild ist. Vorher lädt nichts (preload="none").
  const imBild = useInView(ref, { margin: "200px 0px" });
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (imBild && i === aktiv) v.play().catch(() => {});
      else v.pause();
    });
  }, [aktiv, imBild]);

  return (
    <section ref={ref} className="on-ink relative" style={{ height: `${n * 45 + 60}vh` }}>
      <div className="sticky top-0 isolate flex h-svh items-center overflow-hidden">
        <div aria-hidden className="hero-schein pointer-events-none absolute -z-10" />
        {/* Das Bild der Station - eine kurze stumme Videoschleife aus dem
            Dreh im Studio (sonst das Foto), je Station, ineinander
            überblendend. Alle
            liegen von Anfang an da (nur unsichtbar), damit beim Wechsel
            nichts nachlädt. Am Computer rechte Hälfte, auf dem Handy
            gedämpft hinter dem Text; der Verlauf hält den Text lesbar. */}
        <div aria-hidden className="absolute inset-0 -z-20 lg:left-[42%]">
          {ABLAUF_EINHEIT.map((s, i) => (
            <motion.div
              key={s.step}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: i === aktiv ? 1 : 0, scale: i === aktiv ? 1 : 1.04 }}
              transition={{ duration: 0.6, ease: weich }}
            >
              {s.video ? (
                // Nur die aktive Station und die nächste laden vor - der
                // Rest kommt erst, wenn man hinscrollt.
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  poster={`${s.video}.jpg`}
                  muted
                  loop
                  playsInline
                  preload={imBild && (i === aktiv || i === aktiv + 1) ? "auto" : "none"}
                  className="h-full w-full object-cover opacity-30 lg:opacity-100"
                >
                  <source src={`${s.video}.webm`} type="video/webm" />
                  <source src={`${s.video}.mp4`} type="video/mp4" />
                </video>
              ) : s.foto ? (
                <Image
                  src={s.foto.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover opacity-30 lg:opacity-100"
                />
              ) : null}
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/70 to-[var(--ink)]/40 lg:bg-gradient-to-r lg:from-[var(--ink)] lg:via-[var(--ink)]/40 lg:to-transparent" />
        </div>
        <Container className="w-full">
          {/* Ab lg nur die linke Hälfte - rechts steht das Foto. */}
          <div className="lg:max-w-[50%]">
            <p className="text-sm font-semibold text-accent">Dein Termin, Minute für Minute</p>
            <h2 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">
              Dein erster Termin: rund 40 Minuten. 20 davon Training.
            </h2>

            <div className="mt-8 grid gap-6 sm:mt-10">
              <p className="font-display text-7xl font-black leading-none tabular-nums sm:text-9xl" aria-hidden>
                <motion.span>{anzeige}</motion.span>
                <span className="ml-2 text-2xl font-bold text-muted sm:text-3xl">Min</span>
              </p>

              <div className="min-h-36 sm:min-h-32" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={aktiv}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: weich }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                      Station {aktiv + 1} von {n} · {schritt.duration}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{schritt.step}</h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-foreground/80">{schritt.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Die Leiste, nach Dauer geteilt. Die Füllung läuft mit der Uhr. */}
            <div className="mt-10 sm:mt-14">
              <div className="relative flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden>
                {dauer.map((d, i) => (
                  <span
                    key={i}
                    className={`h-full rounded-full transition-colors duration-300 ${i === aktiv ? "bg-white/25" : "bg-white/10"}`}
                    style={{ flexGrow: d }}
                  />
                ))}
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-[var(--ink-lime)] mix-blend-screen"
                  style={{ width: fuellung }}
                />
              </div>
              <div className="mt-3 flex gap-1 text-[11px] text-muted" aria-hidden>
                {ABLAUF_EINHEIT.map((s, i) => (
                  <span
                    key={s.step}
                    className={`min-w-0 whitespace-nowrap transition-colors ${i === aktiv ? "text-foreground" : ""}`}
                    style={{ flexGrow: dauer[i], flexBasis: 0 }}
                  >
                    {/* Kurz, damit auch die 3 Minuten in ihr schmales Feld passen. */}
                    {dauer[i]}′
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/erster-besuch"
              className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Der erste Besuch im Detail <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
}

function Liste() {
  return (
    <section className="on-ink py-20 sm:py-24">
      <Container>
        <p className="text-sm font-semibold text-accent">Dein Termin, Minute für Minute</p>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          Dein erster Termin: rund 40 Minuten. 20 davon Training.
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {ABLAUF_EINHEIT.map((s, i) => (
            <li key={s.step}>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {grenzen[i]}. Minute · {s.duration}
              </p>
              <h3 className="mt-2 font-bold">{s.step}</h3>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{s.text}</p>
            </li>
          ))}
        </ol>
        <Link
          href="/erster-besuch"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          Der erste Besuch im Detail <ArrowRight size={14} aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
