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
      kicker="Nicht allein"
      titel="Allein trainieren heißt: Keiner sieht hin."
      klassisch={<>du trainierst nach Gefühl, und niemand sagt dir, ob es zu viel oder zu wenig ist.</>}
      beiUns={
        <>
          dein Trainer steht neben dir und stellt die Intensität mit dir ein –{" "}
          <strong className="font-semibold text-foreground">Muskelgruppe für Muskelgruppe</strong>.
        </>
      }
      knopf={{ href: "/probetermin", text: "Probetraining mit Trainer" }}
      kartenTitel="Intensität je Muskelgruppe"
      legende={
        <>
          <Legende farbe="termin">Spielraum</Legende>
          <Legende farbe="neu">Für dich</Legende>
        </>
      }
      alt={{ label: "Klassisch", wert: "nach Gefühl" }}
      neu={{ label: "Bei uns", wert: "mit Trainer" }}
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
      aria-label={`Karte mit ${studios.length} Studios rund um Köln. Von Köln-Ehrenfeld aus liegt ${naechstes.name} am nächsten, etwa ${naechstes.km.toFixed(1).replace(".", ",")} Kilometer Luftlinie.`}
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
      titel="Zu weit weg – und das Training fällt aus."
      klassisch={<>ein Studio. Wer am anderen Ende der Stadt wohnt oder arbeitet, hat einen langen Weg.</>}
      beiUns={
        <>
          <strong className="font-semibold text-foreground">{n} Studios</strong> rund um Köln. Eins
          liegt fast immer auf dem Weg – morgens beim Büro oder abends um die Ecke.
        </>
      }
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
      kartenTitel="Rund um Köln"
      legende={
        <>
          <Legende farbe="termin">Studio</Legende>
          <Legende farbe="neu">Am nächsten</Legende>
        </>
      }
      alt={{ label: "Klassisch", wert: "1 Studio" }}
      neu={{ label: "Bei uns", wert: `${n} Studios` }}
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
      viewBox="0 0 360 250"
      role="img"
      aria-label="Zwei Abläufe. Klassisch: Vertrag, Monatsbeitrag, erst dann die Frage, ob es passt. Bei uns: kostenloses Probetraining, dann die Frage, ob es passt, dann entscheiden."
      className="w-full"
    >
      <text x={6} y={22} className="pr-zeile zp-auf" style={ab(0.35)}>
        Klassisch
      </text>
      <g className="pr-reihe-alt">
        <Schritt x={6} y={34} titel="Vertrag" unter="unterschreiben" art="alt" ab={0.6} />
        <Pfeil x={108} y={63} einsatz={0.9} art="alt" />
        <Schritt x={132} y={34} titel="Beitrag" unter="jeden Monat" art="alt" ab={1.0} />
        <Pfeil x={234} y={63} einsatz={1.3} art="alt" />
        <Schritt x={258} y={34} titel="Passt es?" unter="zu spät gefragt" art="frage" ab={1.4} />
      </g>

      <text x={6} y={146} className="pr-zeile zp-auf" style={ab(2.2)}>
        Bei uns
      </text>
      <Schritt x={6} y={158} titel="Probetraining" unter="0 € · mit Trainer" art="neu" ab={2.4} />
      <Pfeil x={108} y={187} einsatz={2.7} art="neu" />
      <Schritt x={132} y={158} titel="Passt es?" unter="du weißt es" art="neu" ab={2.8} />
      <Pfeil x={234} y={187} einsatz={3.1} art="neu" />
      <Schritt x={258} y={158} titel="Entscheiden" unter="ohne Druck" art="fertig" ab={3.2} />
    </svg>
  );
}

export function PreisProblem() {
  return (
    <ProblemAbschnitt
      kicker="Erst probieren"
      titel="Erst unterschreiben, dann merken, ob es passt?"
      klassisch={<>der Vertrag kommt zuerst – ob dir das Training liegt, merkst du, wenn du schon zahlst.</>}
      beiUns={
        <>
          zuerst ein <strong className="font-semibold text-foreground">kostenloses Probetraining</strong>{" "}
          mit Trainer. Unverbindlich, ohne Mitgliedschaft – entscheiden kannst du danach.
        </>
      }
      knopf={{ href: "/probetermin", text: "Kostenlos ausprobieren" }}
      kartenTitel="Der Weg zum Training"
      alt={{ label: "Klassisch", wert: "Vertrag zuerst" }}
      neu={{ label: "Bei uns", wert: "Probe zuerst" }}
      aufloesung={3.4}
    >
      <Probe />
    </ProblemAbschnitt>
  );
}
