"use client";

import { Fragment, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";

/**
 * Wichtig für die Ladezeit: Die Eingangsanimation läuft über CSS-Klassen
 * (siehe globals.css), nicht über Motion. Über Motion gesteuert stünde der
 * gesamte Hero bis zur Hydration bei opacity 0 - auf einem langsamen
 * Mobilgerät rund drei Sekunden leerer Bildschirm, in denen Google die
 * Überschrift als nicht dargestellt wertet.
 *
 * Motion bleibt für den Parallax-Effekt zuständig. Der hängt ohnehin am
 * Scrollen und schadet deshalb nicht, wenn er später einsetzt.
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

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: backdrop drifts slower than the content while scrolling away.
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-background"
    >
      {/* Aurora backdrop: two soft color fields drifting slowly. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[8%] h-[560px] w-[560px] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, var(--color-lime), transparent 65%)",
          opacity: "var(--aurora-opacity)",
          y: auroraY,
        }}
        animate={{ x: [0, 60, -20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 right-[4%] h-[620px] w-[620px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle, var(--color-electric-blue), transparent 65%)",
          opacity: "calc(var(--aurora-opacity) * 0.55)",
          y: auroraY,
        }}
        animate={{ x: [0, -50, 30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blueprint grid, masked so it dissolves toward the edges. */}
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 opacity-40" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="w-full">
        <Container className="flex flex-col items-center py-24 text-center md:py-28">
          {/* Logo opens the page big and alone, then settles into place as
              part of the normal flow - it can never overlap the headline. */}
          <div className="hero-anim-logo mb-10">
            <Logo className="h-14 w-auto sm:h-16" />
          </div>

          <span
            className="hero-anim mb-8 rounded-full border border-border bg-surface-raised/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted backdrop-blur"
            style={{ "--hero-delay": "0.3s" } as React.CSSProperties}
          >
            EMS-Studio in Hürth &middot; Köln &middot; Brühl
          </span>

          <h1 className="font-display max-w-5xl text-[2.6rem] font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            <StaggeredLine text="20 Minuten Training." startDelay={0.4} />
            <br />
            <StaggeredLine
              text="Ein sichtbarer Unterschied."
              className="text-glow text-lime"
              startDelay={0.55}
            />
          </h1>

          <p
            className="hero-anim mt-8 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
            style={{ "--hero-delay": "0.7s" } as React.CSSProperties}
          >
            Effektives EMS-Training für Berufstätige mit wenig Zeit. Einmal pro
            Woche, gelenkschonend, individuell betreut - bei Körperformen.
          </p>

          <div
            className="hero-anim mt-10 flex flex-col gap-4 sm:flex-row"
            style={{ "--hero-delay": "0.82s" } as React.CSSProperties}
          >
            <Button href="/probetermin">Kostenlosen Probetermin buchen</Button>
            <Button href="/ems-training" variant="secondary">
              Wie EMS funktioniert
            </Button>
          </div>

          <p
            className="hero-anim mt-6 text-xs text-muted"
            style={{ "--hero-delay": "0.94s" } as React.CSSProperties}
          >
            Unverbindlich &middot; Ohne Vertragsbindung &middot; Persönliche 1:1-Betreuung
          </p>
        </Container>
      </motion.div>

      {/* Scroll cue - fades out as soon as the visitor starts scrolling. */}
      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <div
          className="hero-anim flex flex-col items-center gap-1 text-muted"
          style={{ "--hero-delay": "1.6s" } as React.CSSProperties}
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
