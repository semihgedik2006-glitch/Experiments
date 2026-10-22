"use client";

import { ProblemAbschnitt, Legende, ab } from "@/components/problem/problem-abschnitt";

/**
 * Die Probleme der Unterseiten - je eins, je eine Grafik.
 *
 * Wie auf der Startseite gilt: nur, was sich belegen oder nachrechnen
 * lässt. Kein Wort über Wirkung, keine erfundene Vertragslaufzeit (die
 * Tarife in der Datenbank nennen keine), keine geschätzten Wege - die
 * Karte der Studios rechnet mit den echten Koordinaten.
 */

/* ======================================================================
   EMS-Training: Intensität je Muskelgruppe
   ====================================================================== */

const ZONEN: [name: string, wert: number][] = [
  ["Brust", 0.62],
  ["Bauch", 0.48],
  ["Arme", 0.72],
  ["Schultern", 0.55],
  ["Oberer Rücken", 0.66],
  ["Unterer Rücken", 0.38],
  ["Po", 0.78],
  ["Beine", 0.7],
];
const SPUR_X = 118;
const SPUR_B = 214;
const GLEICH = 0.5;

function Zonen() {
  return (
    <svg
      viewBox="0 0 360 280"
      role="img"
      aria-label="Acht Muskelgruppen mit je einem Regler. Zuerst stehen alle gleich, dann wird jede einzeln eingestellt - der untere Rücken am niedrigsten, Po und Arme am höchsten."
      className="w-full"
    >
      {ZONEN.map(([name, wert], i) => {
        const yy = 22 + i * 31;
        return (
          <g key={name} className="zp-auf" style={ab(0.4 + i * 0.05)}>
            <text x={SPUR_X - 14} y={yy + 4} textAnchor="end" className="zr-name">
              {name}
            </text>
            <rect x={SPUR_X} y={yy - 3} width={SPUR_B} height={6} rx={3} className="zr-spur" />
            <rect
              x={SPUR_X}
              y={yy - 3}
              width={wert * SPUR_B}
              height={6}
              rx={3}
              className="zr-fuellung"
              style={{ ...ab(1.7 + i * 0.13), "--von": `${GLEICH / wert}` } as React.CSSProperties}
            />
            <circle
              cx={SPUR_X + wert * SPUR_B}
              cy={yy}
              r={7}
              className="zr-knopf"
              style={{ ...ab(1.7 + i * 0.13), "--dx": `${(GLEICH - wert) * SPUR_B}px` } as React.CSSProperties}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function EmsProblem() {
  return (
    <ProblemAbschnitt
      kicker="Auf dich eingestellt"
      titel="Dein Körper bekommt genau die Intensität, die er braucht."
      punkte={[
        {
          label: "Muskelgruppe für Muskelgruppe",
          text: <>dein Trainer stellt jede Zone einzeln ein – kräftiger, wo du Kraft aufbauen willst, sanfter, wo du vorsichtig sein musst.</>,
        },
        {
          label: "Bei jeder Einheit neu",
          text: <>er steht neben dir, sieht, wie du dich bewegst, und passt die Einstellung an deinen Tag an.</>,
        },
      ]}
      knopf={{ href: "/probetermin", text: "Probetraining mit Trainer" }}
      kartenTitel="Intensität je Muskelgruppe"
      legende={
        <>
          <Legende farbe="termin">Spielraum</Legende>
          <Legende farbe="neu">Für dich</Legende>
        </>
      }
      alt={{ label: "Muskelgruppen", wert: "8 Zonen" }}
      neu={{ label: "Eingestellt", wert: "für dich" }}
      aufloesung={3.1}
    >
      <Zonen />
    </ProblemAbschnitt>
  );
}

/* ======================================================================
   Studios: Nähe - mit den echten Koordinaten
   ====================================================================== */

export type StudioPunkt = { name: string; lat: number; lng: number };

/**
 * Der Beispiel-Startpunkt: Köln-Ehrenfeld. Steht so auch unter "Wie die
 * Karte entsteht". Zuerst war es der Dom - der liegt aber nur gut einen
 * Kilometer vom Ebertplatz entfernt, "Du" und Studio lagen übereinander.
 */
const START = { lat: 50.9495, lng: 6.9175 };

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

function Naehe({ studios }: { studios: StudioPunkt[] }) {
  // Einfache Projektion: Längengrade mit cos(Breite) stauchen, damit Köln
  // nicht in die Breite gezogen wird. Für 50 km reicht das völlig.
  const alle = [...studios, START];
  const kx = Math.cos((START.lat * Math.PI) / 180);
  const xs = alle.map((p) => p.lng * kx);
  const ys = alle.map((p) => p.lat);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Die Höhe richtet sich nach den Punkten: Liegen die Studios eher in
  // die Breite, bleibt unten kein leerer Streifen stehen.
  const RAND = 30;
  const B = 360 - 2 * RAND;
  const massstab = Math.min(B / (maxX - minX || 1), 260 / (maxY - minY || 1));
  const hoehe = Math.max(190, (maxY - minY) * massstab + 2 * RAND);
  const versatzX = RAND + (B - (maxX - minX) * massstab) / 2;
  const versatzY = (hoehe - (maxY - minY) * massstab) / 2;
  const p = (pt: { lat: number; lng: number }) => ({
    x: versatzX + (pt.lng * kx - minX) * massstab,
    y: versatzY + (maxY - pt.lat) * massstab,
  });

  const du = p(START);
  const mitAbstand = studios.map((s) => ({ ...s, km: km(START, s), ...p(s) }));
  const naechstes = mitAbstand.reduce((a, b) => (b.km < a.km ? b : a));
  const schildLinks = naechstes.x > 230;

  return (
    <svg
      viewBox={`0 0 360 ${Math.round(hoehe)}`}
      role="img"
      aria-label={`Karte mit ${studios.length} Studios in Köln und Umgebung. Von Köln-Ehrenfeld aus liegt ${naechstes.name} am nächsten, etwa ${naechstes.km.toFixed(1).replace(".", ",")} Kilometer Luftlinie.`}
      className="w-full"
    >
      {/* Radarringe um "Du" */}
      {[28, 52, 78].map((r, i) => (
        <circle key={r} cx={du.x} cy={du.y} r={r} className="nh-ring" style={ab(1.6 + i * 0.18)} />
      ))}

      {mitAbstand.map((s, i) => (
        <circle
          key={s.name}
          cx={s.x}
          cy={s.y}
          r={4.5}
          className={s === naechstes ? "nh-studio nh-naechstes" : "nh-studio"}
          style={ab(0.45 + i * 0.06)}
        />
      ))}

      {/* Linie zum nächsten Studio */}
      <line x1={du.x} y1={du.y} x2={naechstes.x} y2={naechstes.y} className="nh-linie" />

      {/* Du */}
      <g transform={`translate(${du.x} ${du.y})`}>
        <g className="nh-du">
          <circle r={7} className="nh-du-punkt" />
          <text y={-13} textAnchor="middle" className="nh-du-text">
            Du
          </text>
        </g>
      </g>

      {/* Schild am nächsten Studio */}
      <g transform={`translate(${naechstes.x + (schildLinks ? -12 : 12)} ${naechstes.y - 14})`}>
        <g className="nh-schild">
          <rect x={schildLinks ? -118 : 0} width={118} height={28} rx={14} />
          <text x={schildLinks ? -59 : 59} y={18} textAnchor="middle">
            {naechstes.km.toFixed(1).replace(".", ",")} km Luftlinie
          </text>
        </g>
      </g>
    </svg>
  );
}

export function StudioProblem({ studios }: { studios: StudioPunkt[] }) {
  // Ohne genug Koordinaten ergäbe die Karte kein Bild - dann lieber nichts.
  if (studios.length < 3) return null;
  const n = studios.length;
  return (
    <ProblemAbschnitt
      kicker="In deiner Nähe"
      titel="Ein kurzer Weg macht es leicht, dranzubleiben."
      punkte={[
        {
          label: `${n} Studios`,
          text: <>in Köln und Umgebung. Eins liegt fast immer auf dem Weg – morgens beim Büro oder abends um die Ecke.</>,
        },
        {
          label: "Ein Standard",
          text: <>derselbe Ablauf und dieselbe Betreuung, egal in welchem unserer Studios du trainierst.</>,
        },
      ]}
      rechnung={{
        titel: "Wie die Karte entsteht",
        inhalt: (
          <p>
            Die Punkte sind die echten Standorte der Studios. Als Beispiel ist Köln-Ehrenfeld der
            Startpunkt; die Entfernung ist Luftlinie. Dein eigenes nächstes Studio findest du oben
            auf dieser Seite – mit deinem Standort.
          </p>
        ),
      }}
      knopf={{ href: "/probetermin", text: "Probetraining in meiner Nähe" }}
      kartenTitel="Köln und Umgebung"
      legende={
        <>
          <Legende farbe="termin">Studio</Legende>
          <Legende farbe="neu">Am nächsten</Legende>
        </>
      }
      alt={{ label: "Köln und Umgebung", wert: `${n} Studios` }}
      neu={{ label: "Dein Weg", wert: "kurz" }}
      aufloesung={3.2}
      hintergrund="background"
    >
      <Naehe studios={studios} />
    </ProblemAbschnitt>
  );
}

/* ======================================================================
   Preise: Erst probieren, dann entscheiden
   ====================================================================== */

function Schritt({
  x,
  y,
  titel,
  unter,
  art,
  ab: einsatz,
}: {
  x: number;
  y: number;
  titel: string;
  unter?: string;
  art: "alt" | "neu" | "frage" | "fertig";
  ab: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`pr-schritt pr-${art}`} style={ab(einsatz)}>
        <rect width={96} height={58} rx={12} />
        <text x={48} y={unter ? 25 : 34} textAnchor="middle" className="pr-titel">
          {titel}
        </text>
        {unter && (
          <text x={48} y={42} textAnchor="middle" className="pr-unter">
            {unter}
          </text>
        )}
      </g>
    </g>
  );
}

function Pfeil({ x, y, einsatz, art }: { x: number; y: number; einsatz: number; art: "alt" | "neu" }) {
  return <path d={`M${x} ${y} h18 m-6 -5 l6 5 l-6 5`} className={`pr-pfeil pr-pfeil-${art}`} style={ab(einsatz)} />;
}

function Probe() {
  return (
    <svg
      viewBox="0 0 360 200"
      role="img"
      aria-label="Drei Schritte: kostenloses Probetraining mit Trainer, dann die Frage, ob es passt, dann mit dem eigenen Plan loslegen."
      className="w-full"
    >
      <Schritt x={6} y={40} titel="Probetraining" unter="0 € · mit Trainer" art="neu" ab={0.6} />
      <Pfeil x={108} y={69} einsatz={1.0} art="neu" />
      <Schritt x={132} y={40} titel="Passt es?" unter="du spürst es" art="neu" ab={1.1} />
      <Pfeil x={234} y={69} einsatz={1.5} art="neu" />
      <Schritt x={258} y={40} titel="Loslegen" unter="mit deinem Plan" art="fertig" ab={1.6} />

      <text x={180} y={150} textAnchor="middle" className="pr-zeile zp-auf" style={ab(2.0)}>
        Dein Angebot bekommst du schriftlich
      </text>
      <text x={180} y={176} textAnchor="middle" className="pr-unter zp-auf" style={ab(2.2)}>
        Keine Entscheidung vor Ort – du überlegst in Ruhe.
      </text>
    </svg>
  );
}

export function PreisProblem() {
  return (
    <ProblemAbschnitt
      kicker="Erst probieren"
      titel="Erst ausprobieren, dann in Ruhe entscheiden."
      punkte={[
        {
          label: "Kostenloses Probetraining",
          text: <>du trainierst einmal mit deinem Trainer und spürst selbst, wie sich EMS anfühlt.</>,
        },
        {
          label: "Dein Plan, dein Angebot",
          text: <>danach zeigt dir dein Trainer, welche Mitgliedschaft zu deinem Ziel passt – schriftlich zum Mitnehmen.</>,
        },
      ]}
      knopf={{ href: "/probetermin", text: "Kostenlos ausprobieren" }}
      kartenTitel="Der Weg zum Training"
      alt={{ label: "Probetraining", wert: "0 €" }}
      neu={{ label: "Zuerst", wert: "ausprobieren" }}
      aufloesung={2.6}
    >
      <Probe />
    </ProblemAbschnitt>
  );
}
