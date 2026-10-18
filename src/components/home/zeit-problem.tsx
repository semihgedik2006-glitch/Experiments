"use client";

import { ProblemAbschnitt, Legende, ab } from "@/components/problem/problem-abschnitt";

/**
 * Das Problem, das wir lösen: Zeit.
 *
 * Bewusst KEIN Versprechen über Wirkung ("so effektiv wie drei Stunden
 * Studio") - das wäre eine Behauptung, die niemand belegen kann. Gezeigt
 * wird nur, was sich nachrechnen lässt: Wie viel Platz drei Studio-Einheiten
 * in einer vollen Arbeitswoche brauchen, und wie viel ein Termin bei uns.
 *
 * DER ABLAUF (globals.css, "Die volle Woche"), ein Takt für den ganzen
 * Abschnitt statt Einzeleffekte:
 *   1. Text und Karte gleiten herein.
 *   2. Die Woche füllt sich Tag für Tag mit Terminen.
 *   3. Drei Studio-Blöcke fallen hinein, stoßen an, werden rot, verblassen.
 *   4. Ein schmaler Lime-Block setzt sich in die Lücke und atmet weiter.
 *   5. Unten: 4,5 Std. wird durchgestrichen, "unter 1 Std." leuchtet auf.
 *
 * Nur opacity und transform - beides rechnet die Grafikkarte, nichts
 * ruckelt. Ohne JavaScript und bei "Bewegung reduzieren" steht sofort das
 * Endbild da.
 */

/* Raster: Mo-Fr, 8 bis 20 Uhr, 18 px je Stunde. */
const LINKS = 44;
const OBEN = 40;
const SPALTE = 62;
const BREITE = 56;
const PRO_STUNDE = 18;
const y = (stunde: number) => OBEN + (stunde - 8) * PRO_STUNDE;
const x = (tag: number) => LINKS + tag * SPALTE;

/** Was ohnehin im Kalender steht - Arbeit, Termine. */
const BELEGT: [tag: number, von: number, bis: number][] = [
  [0, 8, 12], [0, 13, 17.5],
  [1, 9, 12.5], [1, 13.5, 18],
  [2, 8, 11.5], [2, 12.5, 18.5],
  [3, 8, 12], [3, 13, 17],
  [4, 8, 13], [4, 14, 17],
];

/** Drei Studio-Einheiten à 90 Minuten (Training, Weg, Umziehen). */
const STUDIO: [tag: number, von: number][] = [
  [0, 17],
  [2, 18],
  [4, 16.5],
];

/** Der eine Termin bei uns: 20 Minuten Training. */
const EMS = { tag: 3, von: 17.5, dauer: 20 / 60 };

function Kalender() {
  return (
    <svg
      viewBox="0 0 360 280"
      role="img"
      aria-label="Eine volle Arbeitswoche: Drei Studio-Einheiten à 90 Minuten stoßen an bestehende Termine. Ein 20-Minuten-Termin passt am Donnerstag um 17:30 Uhr in eine Lücke."
      className="w-full"
    >
      {["Mo", "Di", "Mi", "Do", "Fr"].map((tag, i) => (
        <text key={tag} x={x(i) + BREITE / 2} y={26} textAnchor="middle" className="kal-tag zp-auf" style={ab(0.35 + i * 0.06)}>
          {tag}
        </text>
      ))}
      {[8, 12, 16, 20].map((h) => (
        <g key={h}>
          <text x={LINKS - 8} y={y(h) + 4} textAnchor="end" className="kal-zeit">
            {h}
          </text>
          <line x1={LINKS - 2} x2={x(4) + BREITE} y1={y(h)} y2={y(h)} className="kal-linie" />
        </g>
      ))}

      {/* Die Woche füllt sich, Tag für Tag von oben nach unten. */}
      {BELEGT.map(([tag, von, bis], i) => (
        <rect
          key={`${tag}-${von}`}
          x={x(tag)}
          y={y(von) + 1}
          width={BREITE}
          height={(bis - von) * PRO_STUNDE - 2}
          rx={4}
          className="kal-belegt"
          style={ab(0.55 + tag * 0.09 + (i % 2) * 0.12)}
        />
      ))}

      {/* Drei Mal Studio - stößt überall an. */}
      {STUDIO.map(([tag, von], i) => (
        <g key={tag} className="kal-studio" style={ab(1.55 + i * 0.28)}>
          <rect x={x(tag) + 3} y={y(von)} width={BREITE - 6} height={1.5 * PRO_STUNDE} rx={4} />
          <text x={x(tag) + BREITE / 2} y={y(von) + 17} textAnchor="middle">
            Studio
          </text>
        </g>
      ))}

      {/* Der eine Termin. */}
      <rect
        x={x(EMS.tag) + 2}
        y={y(EMS.von)}
        width={BREITE - 4}
        height={Math.max(EMS.dauer * PRO_STUNDE, 6)}
        rx={3}
        className="kal-ems-block"
      />
      <path
        d={`M${x(EMS.tag) + BREITE / 2} ${y(EMS.von) + 9} V${y(18.9)} H${x(EMS.tag) + BREITE + 18}`}
        className="kal-ems-linie"
      />
      {/* Außen die Lage, innen die Bewegung: Eine CSS-Animation mit
          transform würde sonst das translate() der Lage überschreiben. */}
      <g transform={`translate(${x(EMS.tag) + BREITE + 18} ${y(18.9) - 13})`}>
        <g className="kal-ems-schild">
          <rect width={52} height={26} rx={13} />
          <text x={26} y={17} textAnchor="middle">
            20 Min
          </text>
        </g>
      </g>
    </svg>
  );
}

export function ZeitProblem() {
  return (
    <ProblemAbschnitt
      kicker="Das kennst du"
      titel="Dreimal die Woche ins Studio? Dein Kalender sagt nein."
      klassisch={
        <>
          drei Einheiten, dazu Weg und Umziehen – gut{" "}
          <strong className="font-semibold text-foreground">4,5 Stunden</strong> pro Woche.
        </>
      }
      beiUns={
        <>
          ein fester Termin, 20 Minuten Training, dein Trainer stellt alles ein. Mit Weg{" "}
          <strong className="font-semibold text-foreground">unter einer Stunde</strong>.
        </>
      }
      rechnung={{
        titel: "So ist gerechnet",
        inhalt: (
          <>
            <p>
              Klassisch: 3 × (60 Min. Training + 20 Min. Weg + 10 Min. Umziehen) = 270 Min.
              Bei uns: 1 × (20 Min. Training + 20 Min. Weg + 10 Min. Umziehen) = 50 Min.
            </p>
            <p className="mt-2">
              Eine Beispielrechnung – dein Weg hängt davon ab, wo du wohnst und arbeitest.
              Mit 14 Studios rund um Köln ist er meistens kurz.
            </p>
          </>
        ),
      }}
      knopf={{ href: "/probetermin", text: "Freien Termin finden" }}
      kartenTitel="Deine Woche"
      legende={
        <>
          <Legende farbe="termin">Termine</Legende>
          <Legende farbe="alt">Studio</Legende>
        </>
      }
      alt={{ label: "Klassisch", wert: "4,5 Std." }}
      neu={{ label: "Bei uns", wert: "unter 1 Std." }}
    >
      <Kalender />
    </ProblemAbschnitt>
  );
}
