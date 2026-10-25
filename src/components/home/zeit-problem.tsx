"use client";

import { ProblemAbschnitt, Legende, ab } from "@/components/problem/problem-abschnitt";
import { useSprache } from "@/lib/i18n/use-sprache";

/**
 * Zeit: 20 Minuten passen auch in eine volle Woche.
 *
 * Vorher stand hier eine Rechnung "drei Mal Fitnessstudio = 4,5 Stunden
 * gegen 20 Minuten bei uns". Das machte Fitnessstudios schlecht - das
 * wollen wir nicht. Jetzt zeigt die Grafik nur die eigene Woche und den
 * einen Termin, der hineinpasst.
 *
 * DER ABLAUF (globals.css, "Die volle Woche"), ein Takt für den ganzen
 * Abschnitt statt Einzeleffekte:
 *   1. Text und Karte gleiten herein.
 *   2. Die Woche füllt sich Tag für Tag mit Terminen.
 *   3. Ein schmaler Lime-Block setzt sich in die Lücke und atmet weiter.
 *   4. Unten leuchtet "20 Min." auf.
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

/** Der eine Termin bei uns: 20 Minuten Training. */
const EMS = { tag: 3, von: 17.5, dauer: 20 / 60 };

function Kalender() {
  const en = useSprache() === "en";
  return (
    <svg
      viewBox="0 0 360 280"
      role="img"
      aria-label={
        en
          ? "A full working week with work and appointments. A 20-minute session fits into a gap on Thursday at 5:30 pm."
          : "Eine volle Arbeitswoche mit Arbeit und Terminen. Ein 20-Minuten-Training passt am Donnerstag um 17:30 Uhr in eine Lücke."
      }
      className="w-full"
    >
      {(en ? ["Mon", "Tue", "Wed", "Thu", "Fri"] : ["Mo", "Di", "Mi", "Do", "Fr"]).map((tag, i) => (
        <text key={tag} x={x(i) + BREITE / 2} y={26} textAnchor="middle" className="kal-tag zp-auf" style={ab(0.35 + i * 0.06)}>
          {tag}
        </text>
      ))}
      {[8, 12, 16, 20].map((h) => (
        <g key={h}>
          <text x={LINKS - 8} y={y(h) + 4} textAnchor="end" className="kal-zeit">
            {en ? (h === 12 ? "12" : h > 12 ? `${h - 12}p` : `${h}a`) : h}
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
            {en ? "20 min" : "20 Min"}
          </text>
        </g>
      </g>
    </svg>
  );
}

export function ZeitProblem() {
  if (useSprache() === "en") return <ZeitProblemEn />;
  return (
    <ProblemAbschnitt
      kicker="Passt in deine Woche"
      titel="Dein Kalender ist voll? 20 Minuten passen trotzdem rein."
      punkte={[
        {
          label: "Ein fester Termin",
          text: <>einmal pro Woche, 20 Minuten Training. Er liegt jede Woche gleich und wird zur Gewohnheit.</>,
        },
        {
          label: "Nichts zu planen",
          text: <>dein Trainer stellt alles ein und weiß, woran ihr arbeitet. Du kommst, trainierst und gehst weiter in deinen Tag.</>,
        },
        {
          label: "Mehr Zeit für dich",
          text: <>der Rest der Woche gehört deiner Familie, deinem Job und dir.</>,
        },
      ]}
      knopf={{ href: "/probetermin", text: "Wunschzeit nennen" }}
      kartenTitel="Deine Woche"
      legende={
        <>
          <Legende farbe="termin">Termine</Legende>
          <Legende farbe="neu">Dein Training</Legende>
        </>
      }
      alt={{ label: "Deine Woche", wert: "voll" }}
      neu={{ label: "Training", wert: "20 Min." }}
      aufloesung={2.4}
    >
      <Kalender />
    </ProblemAbschnitt>
  );
}

function ZeitProblemEn() {
  return (
    <ProblemAbschnitt
      kicker="Fits into your week"
      titel="Your calendar is full? 20 minutes still fit in."
      punkte={[
        {
          label: "One fixed appointment",
          text: <>once a week, 20 minutes of training. It is at the same time every week and becomes a habit.</>,
        },
        {
          label: "Nothing to plan",
          text: <>your trainer sets everything up and knows what you are working on. You come, train and get on with your day.</>,
        },
        {
          label: "More time for you",
          text: <>the rest of the week belongs to your family, your job and you.</>,
        },
      ]}
      knopf={{ href: "/probetermin", text: "Tell us when suits you" }}
      kartenTitel="Your week"
      legende={
        <>
          <Legende farbe="termin">Appointments</Legende>
          <Legende farbe="neu">Your training</Legende>
        </>
      }
      alt={{ label: "Your week", wert: "full" }}
      neu={{ label: "Training", wert: "20 min" }}
      aufloesung={2.4}
    >
      <Kalender />
    </ProblemAbschnitt>
  );
}
