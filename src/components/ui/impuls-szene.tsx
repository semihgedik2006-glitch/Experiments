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
 * sähen aus wie sieben Websites; eine Illustration, die erkennbar aus
 * derselben Hand kommt, gehört dazu.
 *
 * KEINE MENSCHEN. Das ist keine Bequemlichkeit, sondern in ems-figur.tsx
 * nachzulesende Erfahrung: Eine gezeichnete menschliche Silhouette wird
 * unbarmherzig daran gemessen, wie ein Mensch aussieht - jede Abweichung
 * in den Proportionen fällt auf, weil jeder das Original seit seiner
 * Geburt kennt. Geometrische Formen haben das Problem nicht.
 *
 * TECHNIK: Inline-SVG mit CSS-Animation statt einer nachgeladenen Datei.
 * Sie ist Teil des HTML und damit sofort da, skaliert ohne Unschärfe,
 * kennt Hell- und Dunkelmodus über die Farbtoken und kostet keine
 * zusätzliche Anfrage. Animiert werden nur Deckkraft, Größe und
 * Strichversatz - das rechnet die Grafikkarte.
 *
 * Reine Zierde, deshalb für Vorleseprogramme ausgeblendet: Alles, was die
 * Bilder sagen, steht als Text daneben.
 */

/** Gemeinsamer Rahmen: Schein, Ring, gestrichelter Außenkreis. */
function Buehne({ children }: { children: React.ReactNode }) {
  return (
    <>
      <circle cx={120} cy={120} r={112} fill="url(#szene-schein)" className="figur-schein" />
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
      {children}
    </>
  );
}

export type SzeneName = "postfach" | "bestaetigt" | "netz";

/**
 * postfach   - ein Umschlag, in den der Impuls hineinläuft.
 *              Für "Meine Termine": Der Zugang kommt per E-Mail.
 * bestaetigt - ein Haken, den die Impulslinie zeichnet.
 *              Für den Moment nach dem Absenden.
 * netz       - Knoten, die der Reihe nach ansprechen.
 *              Für alles, wo es um die vierzehn Standorte geht.
 */
export function ImpulsSzene({
  name,
  className = "",
}: {
  name: SzeneName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="szene-schein">
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.22" />
          <stop offset="60%" stopColor="var(--color-lime)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Buehne>
        {name === "postfach" && <Postfach />}
        {name === "bestaetigt" && <Bestaetigt />}
        {name === "netz" && <Netz />}
      </Buehne>
    </svg>
  );
}

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
      {/* Die Lasche. */}
      <path
        d="M84 97 L136 132 L188 97"
        fill="none"
        stroke="var(--color-lime)"
        strokeOpacity={0.55}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Der Impuls läuft von links in den Umschlag - dieselbe Linie, die
          auf der ganzen Seite für "hier passiert etwas" steht. */}
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
          stroke-dashoffset und nicht über Deckkraft. Länge des Pfades
          rund 84; die Strichmuster in globals.css sind darauf abgestimmt. */}
      <path
        d="M92 121 l20 21 l38 -42"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="szene-haken"
      />
      {/* Drei Wellen nach außen - dasselbe Prinzip wie bei den Elektroden. */}
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
          style={{ "--takt": `${i * 0.9}s` } as React.CSSProperties}
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
            style={{ "--takt": `${i * 0.6}s` } as React.CSSProperties}
          />
          <circle
            cx={k.x}
            cy={k.y}
            r={i === knoten.length - 1 ? 9 : 6}
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth={1.5}
            className="szene-welle"
            style={{ "--takt": `${i * 0.6}s` } as React.CSSProperties}
          />
        </g>
      ))}
    </g>
  );
}
