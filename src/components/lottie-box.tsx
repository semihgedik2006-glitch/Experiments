"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// lottie-web greift beim Import auf `document` zu und darf deshalb niemals
// auf dem Server laufen.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/**
 * Dekorative Lottie-Animation.
 *
 * Die Abspielbibliothek wiegt rund 300 KB, die Animationsdatei je nach
 * Motiv 150-200 KB. Beides steht auf den beiden wichtigsten Seiten der
 * Website - Probetermin und Kontakt - neben einem Formular. Deshalb wird
 * hier bewusst nichts davon geladen, solange
 *
 *   - die Animation nicht im sichtbaren Bereich ist,
 *   - der Browser noch mit dem Seitenaufbau beschäftigt ist, oder
 *   - der Nutzer im Betriebssystem reduzierte Bewegung eingestellt hat.
 *
 * Das Formular ist dadurch nie von einer Verzierung abhängig. Der Platz
 * wird über das Seitenverhältnis von Anfang an freigehalten, damit beim
 * Nachladen nichts springt.
 */
export function LottieBox({
  src,
  className,
  /** Seitenverhältnis der Animationsdatei, z.B. "1080 / 1080". */
  ratio = "1 / 1",
}: {
  src: string;
  className?: string;
  ratio?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Wer reduzierte Bewegung eingestellt hat, bekommt gar nichts geladen -
    // eine dauerhaft laufende Schleife wäre hier genau das Gegenteil.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;

    const load = () => {
      fetch(src)
        .then((response) => response.json())
        .then((json) => {
          if (!cancelled) setData(json);
        })
        .catch(() => {});
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        // Erst laden, wenn der Browser Luft hat. requestIdleCallback fehlt
        // in Safari, dort greift der Timeout.
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(load, { timeout: 2000 });
        } else {
          setTimeout(load, 300);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src]);

  return (
    <div ref={containerRef} className={className} style={{ aspectRatio: ratio }} aria-hidden>
      {data && <Lottie animationData={data} loop autoplay />}
    </div>
  );
}
