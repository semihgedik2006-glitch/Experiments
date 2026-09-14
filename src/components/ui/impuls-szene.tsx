/**
 * Illustrationen für einzelne Momente.
 *
 * ABGRENZUNG ZUM MOTIV: ImpulsMotiv ist die Verzierung, die an jedem
 * Seitenkopf wiederkehrt - sie liegt hinter dem Text und soll nicht
 * auffallen. Was hier steht, ist das Gegenteil: ein Bild, das etwas
 * erzählt, an einer Stelle, an der sonst nur Text stünde.
 *
 * Verwendet wird trotzdem dieselbe Bildsprache - Kreis, Impulslinie,
 * Punkte, die der Reihe nach ansprechen. Sieben verschiedene Verzierungen
 * sähen aus wie sieben Websites; Illustrationen, die erkennbar aus
 * derselben Hand kommen, gehören dazu.
 *
 * ZU DEN FIGUREN: In ems-figur.tsx steht, warum dort keine gezeichneten
 * Menschen stehen - eine menschliche Silhouette wird unbarmherzig daran
 * gemessen, wie ein Mensch aussieht. Das gilt für eine naturalistische
 * Zeichnung. "Zu zweit" umgeht es, indem es gar nicht erst so tut: keine
 * Gesichter, keine Finger, keine Proportionen, die man nachmessen kann -
 * zwei Formen, von denen eine sich zur anderen neigt.
 *
 * TECHNIK: Inline-SVG mit CSS-Animation statt einer nachgeladenen Datei.
 * Sie ist Teil des HTML und damit sofort da, skaliert ohne Unschärfe,
 * kennt Hell- und Dunkelmodus über die Farbtoken und kostet keine
 * zusätzliche Anfrage. Animiert werden nur Deckkraft, Größe und
 * Strichversatz - das rechnet die Grafikkarte, ohne die Seite neu zu
 * vermessen. Bei "Bewegung reduzieren" steht ein fertiges Bild.
 *
 * Reine Zierde, deshalb für Vorleseprogramme ausgeblendet: Alles, was die
 * Bilder sagen, steht als Text daneben.
 */

export type SzeneName =
  | "postfach"
  | "bestaetigt"
  | "netz"
  | "woche"
  | "zuZweit"
  | "ruecken"
  | "termin"
  | "standort"
  | "fortschritt"
  | "geraet";

/**
 * postfach    - Umschlag, in den der Impuls läuft. "Meine Termine".
 * bestaetigt  - Haken, den die Impulslinie zeichnet. Nach dem Absenden.
 * netz        - Knoten, die der Reihe nach ansprechen. Das Studionetz.
 * woche       - Sieben Balken, einer davon ist die Einheit.
 * zuZweit     - Zwei Formen, eine betreut die andere.
 * ruecken     - Wirbelsäule mit der tiefen Muskulatur daneben.
 * termin      - Kalenderblatt mit einem bestätigten Tag.
 * standort    - Kartennadel mit den übrigen Standorten drumherum.
 * fortschritt - Drei Balken, die wachsen, mit der Linie darüber.
 * geraet      - Das Impulsgerät mit laufender Signalkurve.
 */
export function ImpulsSzene({
  name,
  className = "",
}: {
  name: SzeneName;
  className?: string;
}) {
  /*
   * Eigene Kennung je Motiv.
   *
   * Vorher hieß der Verlauf in jeder Szene "szene-schein". Stehen zwei
   * Illustrationen auf derselben Seite - und genau das ist jetzt der Fall -,
   * gibt es die Kennung zweimal im Dokument. Das ist ungültiges HTML, und
   * der Browser nimmt stillschweigend die erste. Hier sahen beide gleich
   * aus, es fiel also nicht auf; mit unterschiedlichen Verläufen wäre es
   * ein Fehler gewesen, den niemand findet.
   */
  const scheinId = `szene-schein-${name}`;

  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={scheinId}>
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.22" />
          <stop offset="60%" stopColor="var(--color-lime)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={120} cy={120} r={112} fill={`url(#${scheinId})`} className="figur-schein" />
      <circle
        cx={120}
        cy={120}
        r={104}
        fill="none"
        stroke="var(--color-lime)"
        strokeOpacity={0.25}
        strokeWidth={1.5}
        strokeDasharray="3 9"
        className="szene-ring"
      />

      {name === "postfach" && <Postfach />}
      {name === "bestaetigt" && <Bestaetigt />}
      {name === "netz" && <Netz />}
      {name === "woche" && <Woche />}
      {name === "zuZweit" && <ZuZweit />}
      {name === "ruecken" && <Ruecken />}
      {name === "termin" && <Termin />}
      {name === "standort" && <Standort />}
      {name === "fortschritt" && <Fortschritt />}
      {name === "geraet" && <Geraet />}
    </svg>
  );
}

/** Kurzschreibweise für den Taktversatz einer Animation. */
const takt = (sekunden: number) => ({ "--takt": `${sekunden}s` }) as React.CSSProperties;

/* ------------------------------------------------------------------ */

function Postfach() {
  return (
    <g>
      {/* Der Umschlag. Bewusst offen gezeichnet und nicht gefüllt: Eine
          geschlossene Fläche in Markengrün würde als Schaltfläche gelesen.
          Nach rechts gerückt, damit links Platz für die Impulslinie
          bleibt - in der ersten Fassung war sie ein Stummel am Bildrand
          und las sich als Versehen statt als Bewegung. */}
      <rect
        x={84}
        y={88}
        width={104}
        height={72}
        rx={9}
        fill="var(--surface-raised)"
        stroke="var(--color-lime)"
        strokeOpacity={0.55}
        strokeWidth={2.5}
      />
      <path
        d="M84 97 L136 132 L188 97"
        fill="none"
        stroke="var(--color-lime)"
        strokeOpacity={0.55}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 124 H48 l8-16 9 32 8-16 h13"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-impuls"
      />
      {/* Der Punkt am Ziel: Der Link ist angekommen. Eigene Klasse statt
          szene-punkt - der pulst von 0.3 auf 1 und war auf dem Standbild
          meist unsichtbar. Hier soll er stehen und nur atmen. */}
      <circle cx={136} cy={132} r={6} fill="var(--color-lime)" className="szene-ziel" />
      <circle
        cx={136}
        cy={132}
        r={6}
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={2}
        className="szene-welle"
      />
    </g>
  );
}

function Bestaetigt() {
  return (
    <g>
      <circle
        cx={120}
        cy={120}
        r={62}
        fill="var(--surface-raised)"
        stroke="var(--color-lime)"
        strokeOpacity={0.5}
        strokeWidth={2.5}
      />
      {/* Der Haken wird gezeichnet, nicht eingeblendet - deshalb über
          stroke-dashoffset und nicht über Deckkraft. */}
      <path
        d="M92 121 l20 21 l38 -42"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-haken"
      />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={120}
          cy={120}
          r={62}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={2}
          className="szene-welle"
          style={takt(i * 0.9)}
        />
      ))}
    </g>
  );
}

/** Knotenpunkte, von Hand gesetzt: Zufall erzeugt Häufungen. */
const knoten = [
  { x: 62, y: 84 },
  { x: 104, y: 62 },
  { x: 156, y: 80 },
  { x: 176, y: 124 },
  { x: 142, y: 160 },
  { x: 92, y: 168 },
  { x: 58, y: 134 },
  { x: 118, y: 116 },
];

function Netz() {
  return (
    <g>
      {/* Verbindungen zur Mitte: das Netz, nicht die Landkarte. Eine echte
          Karte steht auf der Standortseite - die hier ist ein Sinnbild und
          soll nicht so tun, als wären es die echten Koordinaten. */}
      {knoten.slice(0, 7).map((k, i) => (
        <line
          key={i}
          x1={k.x}
          y1={k.y}
          x2={118}
          y2={116}
          stroke="var(--color-lime)"
          strokeOpacity={0.3}
          strokeWidth={1.5}
        />
      ))}
      {knoten.map((k, i) => (
        <g key={`k${i}`}>
          <circle
            cx={k.x}
            cy={k.y}
            r={i === knoten.length - 1 ? 9 : 6}
            fill="var(--color-lime)"
            className="szene-punkt"
            style={takt(i * 0.6)}
          />
          <circle
            cx={k.x}
            cy={k.y}
            r={i === knoten.length - 1 ? 9 : 6}
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth={1.5}
            className="szene-welle"
            style={takt(i * 0.6)}
          />
        </g>
      ))}
    </g>
  );
}

/* ---------------- Die neuen Motive ---------------- */

/** Die sechs Tage ohne Training - Höhe von Hand gesetzt, damit sie
    unregelmäßig wirken, ohne dass Zufall Häufungen erzeugt. */
const wochentage = [
  { x: 54, hoehe: 28 },
  { x: 76, hoehe: 18 },
  { x: 120, hoehe: 20 },
  { x: 142, hoehe: 28 },
  { x: 164, hoehe: 16 },
  { x: 186, hoehe: 24 },
];

function Woche() {
  return (
    <g>
      {wochentage.map((t, i) => (
        <line
          key={i}
          x1={t.x}
          y1={150}
          x2={t.x}
          y2={150 - t.hoehe}
          stroke="var(--color-lime)"
          strokeWidth={3}
          strokeLinecap="round"
          className="szene-tag"
          style={takt(i * 0.35)}
        />
      ))}
      {/* Der eine Tag, an dem trainiert wird. Er wächst als Einziger. */}
      <rect x={90} y={74} width={18} height={76} rx={9} fill="var(--color-lime)" className="szene-balken" />
      <line
        x1={46}
        y1={160}
        x2={194}
        y2={160}
        stroke="var(--color-lime)"
        strokeOpacity={0.35}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Der Impuls über dem Trainingstag. */}
      <path
        d="M74 58 h10 l5-11 6 22 5-11 h24"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-impuls"
      />
    </g>
  );
}

function ZuZweit() {
  return (
    <g>
      <line
        x1={52}
        y1={176}
        x2={188}
        y2={176}
        stroke="var(--color-lime)"
        strokeOpacity={0.4}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Der Gast, er trägt die Weste. */}
      <circle cx={146} cy={94} r={16} fill="var(--color-lime)" />
      <path d="M124 176 v-44 a22 22 0 0 1 44 0 v44 z" fill="var(--color-lime)" />
      {[
        { x: 138, y: 140 },
        { x: 154, y: 140 },
        { x: 138, y: 156 },
        { x: 154, y: 156 },
      ].map((e, i) => (
        <circle
          key={i}
          cx={e.x}
          cy={e.y}
          r={4}
          fill="var(--color-on-lime)"
          opacity={0.5}
          className="szene-punkt"
          style={takt(i * 0.5)}
        />
      ))}
      {/* Der Trainer, zum Gast geneigt, mit einem Arm. Keine Gesichter,
          keine Finger - was man nicht zeichnet, kann auch nicht falsch
          aussehen.
          UMRISS STATT FÜLLUNG: Zuerst war er in --color-accent gefüllt.
          Im dunklen Thema ist accent aber derselbe Ton wie lime - die
          beiden Figuren verschmolzen dort zu einem Klumpen mit einem
          seltsamen Fortsatz. Der Unterschied darf nicht an der Farbe
          hängen, sondern an der Form: einer gefüllt, einer als Umriss.
          Das stimmt in jedem Thema. */}
      <circle
        cx={80}
        cy={88}
        r={15}
        fill="var(--surface-raised)"
        stroke="var(--color-lime)"
        strokeWidth={3}
      />
      <path
        d="M60 176 v-40 a20 20 0 0 1 40 0 v40 z"
        fill="var(--surface-raised)"
        stroke="var(--color-lime)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M98 128 q14 -4 19 5"
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M100 100 h6 l5-12 6 24 5-12 h6"
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-impuls"
      />
    </g>
  );
}

/** Die Wirbel folgen der Krümmung - x verschiebt sich leicht. */
const wirbel = [
  { x: 106, y: 58 },
  { x: 108, y: 81 },
  { x: 112, y: 104 },
  { x: 112, y: 127 },
  { x: 108, y: 150 },
  { x: 104, y: 173 },
];

function Ruecken() {
  return (
    <g>
      <g fill="var(--surface)" stroke="var(--color-lime)" strokeWidth={3}>
        {wirbel.map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width={30} height={17} rx={7} />
        ))}
      </g>
      {/* Die tiefe Muskulatur links und rechts daneben - das, was EMS
          erreicht und klassisches Training oft verfehlt. */}
      <path
        d="M96 62 q-12 56 4 128"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
      />
      <path
        d="M148 62 q12 56 -4 128"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
      />
      {[
        { x: 88, y: 98 },
        { x: 156, y: 98 },
        { x: 90, y: 146 },
        { x: 154, y: 146 },
      ].map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={6}
            fill="var(--color-lime)"
            className="szene-punkt"
            style={takt(i * 0.8)}
          />
          <circle
            cx={p.x}
            cy={p.y}
            r={6}
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth={2}
            className="szene-welle"
            style={takt(i * 0.8)}
          />
        </g>
      ))}
    </g>
  );
}

/** Die freien Tage im Kalenderblatt. */
const kalenderTage = [
  { x: 86, y: 124 },
  { x: 112, y: 124 },
  { x: 164, y: 124 },
  { x: 86, y: 152 },
  { x: 112, y: 152 },
  { x: 138, y: 152 },
  { x: 164, y: 152 },
];

function Termin() {
  return (
    <g>
      <rect
        x={62}
        y={72}
        width={116}
        height={104}
        rx={12}
        fill="var(--surface)"
        stroke="var(--color-lime)"
        strokeWidth={3}
      />
      <line x1={62} y1={102} x2={178} y2={102} stroke="var(--color-lime)" strokeWidth={3} />
      <line x1={88} y1={58} x2={88} y2={82} stroke="var(--color-lime)" strokeWidth={5} strokeLinecap="round" />
      <line x1={152} y1={58} x2={152} y2={82} stroke="var(--color-lime)" strokeWidth={5} strokeLinecap="round" />
      <g fill="var(--color-lime)" opacity={0.3}>
        {kalenderTage.map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r={6} />
        ))}
      </g>
      {/* Der gebuchte Tag. Der Haken zeichnet sich. */}
      <circle cx={138} cy={124} r={14} fill="var(--color-lime)" className="szene-ziel" />
      <circle
        cx={138}
        cy={124}
        r={14}
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth={2}
        className="szene-welle"
      />
      <path
        d="M132 124 l4 5 l9 -11"
        fill="none"
        stroke="var(--color-on-lime)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-haken-klein"
      />
    </g>
  );
}

function Standort() {
  return (
    <g>
      <ellipse cx={120} cy={176} rx={40} ry={11} fill="var(--color-lime)" opacity={0.18} />
      {/* Die Nadel wippt leicht - sie steht nicht wie festgeschraubt da. */}
      <g className="szene-nadel">
        <path
          d="M120 58 a40 40 0 0 1 40 40 c0 28 -40 78 -40 78 s-40 -50 -40 -78 a40 40 0 0 1 40 -40 z"
          fill="var(--surface)"
          stroke="var(--color-lime)"
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
        <circle cx={120} cy={98} r={15} fill="var(--color-lime)" />
      </g>
      {/* Die übrigen Standorte ringsum. */}
      {[
        { x: 62, y: 92 },
        { x: 182, y: 82 },
        { x: 52, y: 146 },
        { x: 192, y: 140 },
      ].map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={6}
          fill="var(--color-accent)"
          opacity={0.55}
          className="szene-punkt"
          style={takt(i * 0.7)}
        />
      ))}
    </g>
  );
}

/** Oberkante, Höhe und Deckkraft der drei Balken. */
const stufen = [
  { x: 68, y: 128, h: 42, o: 0.35 },
  { x: 106, y: 104, h: 66, o: 0.6 },
  { x: 144, y: 74, h: 96, o: 1 },
];

function Fortschritt() {
  return (
    <g>
      <line
        x1={58}
        y1={170}
        x2={184}
        y2={170}
        stroke="var(--color-lime)"
        strokeOpacity={0.4}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Die Balken wachsen nacheinander von unten. transform-origin liegt
          über die Klasse auf der Unterkante - sonst wüchsen sie aus der
          Mitte und sähen aus, als würden sie schweben. */}
      {stufen.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width={26}
          height={s.h}
          rx={8}
          fill="var(--color-lime)"
          opacity={s.o}
          className="szene-stufe"
          style={takt(i * 0.45)}
        />
      ))}
      {/* Die Linie trifft die Oberkanten: 128, 104, 74 - dieselben Werte
          wie oben. In der ersten Fassung lag sie daneben. */}
      <path
        d="M81 128 L119 104 L157 74"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-linie"
      />
      <circle cx={157} cy={74} r={8} fill="var(--color-accent)" className="szene-ziel" />
    </g>
  );
}

function Geraet() {
  return (
    <g>
      <rect
        x={58}
        y={66}
        width={124}
        height={108}
        rx={14}
        fill="var(--surface)"
        stroke="var(--color-lime)"
        strokeWidth={3}
      />
      <rect
        x={74}
        y={82}
        width={92}
        height={42}
        rx={8}
        fill="var(--surface-raised)"
        stroke="var(--color-lime)"
        strokeOpacity={0.4}
        strokeWidth={2}
      />
      {/* Die Kurve läuft über die Anzeige - wie auf einem echten Gerät. */}
      <path
        d="M82 106 h14 l6 -14 7 28 6 -14 h37"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-impuls"
      />
      {/* Die drei Stufen leuchten der Reihe nach auf. */}
      {[88, 120, 152].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={148}
          r={9}
          fill="var(--color-lime)"
          className="szene-punkt"
          style={takt(i * 0.55)}
        />
      ))}
    </g>
  );
}
