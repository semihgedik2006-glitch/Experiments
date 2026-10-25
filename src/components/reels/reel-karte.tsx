"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { Play, Volume2, VolumeX } from "lucide-react";
import type { Reel } from "@/lib/reels";

/**
 * Ein Reel im Hochformat.
 *
 * Läuft stumm von selbst, sobald es zu mindestens 60 % im Bild ist, und
 * hält an, wenn es hinausscrollt - so spielt immer nur das, das man
 * gerade ansieht, und nichts lädt, bevor man hinkommt (preload="none",
 * bis dahin steht das Standbild). Die Untertitel sind ins Bild gebrannt,
 * stumm ist es also verständlich; Ton gibt es auf Antippen.
 *
 * Bei "Bewegung reduzieren" läuft nichts von selbst - ein Knopf startet.
 *
 * Das Standbild ist ein eigenes Bild statt poster="...": Ein Video-Poster
 * lädt der Browser sofort mit der Seite, auch weit unten - bei vier Reels
 * gut 300 KB, bevor man überhaupt hinscrollt. Als <Image> lädt es erst in
 * der Nähe und in passender Größe. Es liegt über dem Video, bis das erste
 * Bild tatsächlich läuft; danach zeigt das angehaltene Video sein Bild.
 */
export function ReelKarte({ reel, className = "" }: { reel: Reel; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const still = useReducedMotion();
  const [laeuft, setLaeuft] = useState(false);
  const [ton, setTon] = useState(false);
  const [gestartet, setGestartet] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el || still) return;
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.6 },
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [still]);

  function tonUmschalten() {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setTon(!el.muted);
    if (el.paused) el.play().catch(() => {});
  }

  return (
    <figure className={className}>
      <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-black">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          onPlay={() => setLaeuft(true)}
          onPlaying={() => setGestartet(true)}
          onPause={() => setLaeuft(false)}
          className="h-full w-full object-cover"
          aria-label={`Video: ${reel.titel}`}
        >
          <source src={`${reel.src}.webm`} type="video/webm" />
          <source src={`${reel.src}.mp4`} type="video/mp4" />
        </video>
        {!gestartet && (
          <Image
            src={reel.poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 62vw"
            className="pointer-events-none object-cover"
          />
        )}
        {!laeuft && (
          <button
            type="button"
            onClick={() => video.current?.play().catch(() => {})}
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            aria-label={`${reel.titel} abspielen`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-on-lime shadow-lg">
              <Play size={24} className="translate-x-0.5" aria-hidden />
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={tonUmschalten}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
          aria-label={ton ? "Ton aus" : "Ton an"}
          aria-pressed={ton}
        >
          {ton ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        </button>
      </div>
      <figcaption className="mt-3">
        <span className="block font-semibold leading-snug">{reel.titel}</span>
        <span className="mt-0.5 block text-sm text-muted">{reel.text}</span>
      </figcaption>
    </figure>
  );
}
