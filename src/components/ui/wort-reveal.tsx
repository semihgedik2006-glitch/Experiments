import { Fragment, type CSSProperties } from "react";

/**
 * Überschrift, die sich Wort für Wort aufbaut, sobald sie ins Bild kommt.
 *
 * Dieselbe Bewegung wie die Hauptüberschrift im ersten Bildschirm - jedes
 * Wort steigt aus seiner eigenen Zeile herauf. Gesteuert wie Reveal über
 * den EinblendWaechter und CSS (globals.css, "Einblenden").
 */
export function WortReveal({ text }: { text: string }) {
  const woerter = text.split(" ");
  return (
    <span data-einblenden="worte">
      {woerter.map((w, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <span
              className="einblenden-wort inline-block"
              style={{ "--einblend-verzug": `${i * 0.055}s` } as CSSProperties}
            >
              {w}
            </span>
          </span>
          {i < woerter.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
