/**
 * Der Impuls - das Motiv auf dem ersten Bildschirm.
 *
 * VORGESCHICHTE, damit niemand denselben Weg noch einmal geht:
 *
 * Hier stand zuerst ein Kasten mit einer Zahl und vier Stichpunkten.
 * Sachlich richtig, aber nichts, wovon jemand hängen bleibt - und der
 * erste Eindruck von Fremden entscheidet sich in zwei Sekunden.
 *
 * Dann standen hier drei Fassungen einer gezeichneten Figur im EMS-Anzug.
 * Alle drei sahen aus wie eine Schaufensterpuppe. Der Grund ist nicht
 * handwerklich, sondern grundsätzlich: Eine menschliche Silhouette wird
 * unbarmherzig daran gemessen, wie ein Mensch aussieht. Jede Abweichung in
 * den Proportionen fällt sofort auf, weil jeder Betrachter das Original
 * seit seiner Geburt kennt. Geometrische Formen haben dieses Problem
 * nicht.
 *
 * Deshalb zeigt die Grafik jetzt nicht den Menschen, sondern das, was im
 * Training mit ihm passiert: den elektrischen Impuls. Zwanzig Minuten als
 * Ring, der sich einmal füllt. Ein Signal, das als Welle durch das Bild
 * läuft. Punkte auf dem äußeren Kreis, die der Reihe nach ansprechen - so
 * wie die Elektroden im Anzug nacheinander die Muskelgruppen ansteuern.
 *
 * Was hier weiterhin NICHT steht: ein Foto. Es gibt keine eigenen
 * Studiofotos, und ein gekauftes Bild fremder Menschen an fremden Geräten
 * wäre auf der Seite einer Kette mit vierzehn echten Standorten die
 * schlechtere Wahl als gar keins.
 *
 * Technisch bewusst eine Inline-Grafik mit CSS-Animation statt einer
 * Bilddatei oder einer Animationsbibliothek:
 *
 *   - Sie ist Teil des HTML und damit sofort da. Eine nachgeladene Datei
 *     hätte auf dem ersten Bildschirm eine Lücke hinterlassen, bis sie
 *     ankommt - und genau die misst Google als Ladezeit.
 *   - Sie skaliert ohne Unschärfe von 390 auf 1920 Pixel.
 *   - Sie kennt Hell- und Dunkelmodus, weil sie die Farbtoken benutzt.
 *   - Animiert werden ausschließlich Deckkraft, Drehung und Strichversatz.
 *     Das rechnet die Grafikkarte, ohne die Seite neu zu vermessen.
 *
 * Für Vorleseprogramme ist sie ausgeblendet: Alles, was sie sagt, steht
 * als Text daneben.
 */

/** Mitte und Radien der Scheibe. */
const M = 180;
const R_AUSSEN = 168;
const R_PUNKTE = 140;
const R_FORTSCHRITT = 104;

/** Umfang des Fortschrittsrings - muss zu R_FORTSCHRITT passen. */
const UMFANG = 2 * Math.PI * R_FORTSCHRITT;

/** Wie viele Punkte auf dem Kreis ansprechen und in welcher Reihenfolge. */
const ANZAHL_PUNKTE = 12;

/** Ein Durchlauf über alle Punkte. */
const RUNDE = 4.8;

const punkte = Array.from({ length: ANZAHL_PUNKTE }, (_, i) => {
  // Bei -90 Grad beginnen, damit der erste Punkt oben sitzt.
  const winkel = (i / ANZAHL_PUNKTE) * 2 * Math.PI - Math.PI / 2;
  return {
    x: M + Math.cos(winkel) * R_PUNKTE,
    y: M + Math.sin(winkel) * R_PUNKTE,
    // Gleichmäßig über die Runde verteilt - der Reihe nach im Uhrzeigersinn.
    takt: (i / ANZAHL_PUNKTE) * RUNDE,
  };
});

/**
 * Die Signalkurve - eine Ablesezeile unter der Zahl.
 *
 * Bewusst kein gleichmäßiger Sinus: Ein EMS-Impuls ist eine Folge kurzer
 * Ausschläge mit Ruhe dazwischen, und genau das macht die Kurve als Bild
 * interessant. Ein Sinus sähe aus wie ein Wellenmuster auf einer Tapete.
 *
 * Sie lag zuerst quer über das ganze Bild und war hinter der Scheibe
 * ausgeblendet - übrig blieben zwei Stummel von je 26 Pixeln an den
 * Rändern, die man schlicht nicht sah. Jetzt liegt sie vollständig
 * INNERHALB der Scheibe: 150 Pixel breit, unter "MINUTEN", wie die
 * Ablesezeile eines Messgeräts.
 */
const KURVE =
  "M 106 245 L 126 245 L 132 231 L 140 260 L 146 245 L 166 245 L 170 238 L 174 252 L 178 245 " +
  "L 198 245 L 205 225 L 213 264 L 219 245 L 238 245 L 242 239 L 246 251 L 250 245 L 254 245";

export function EmsFigur({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 360"
      aria-hidden
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Der Schein hinter der Scheibe. Ein Verlauf statt eines
            Weichzeichners: Weichzeichner über einer großen Fläche kosten
            bei jedem Bild Rechenzeit, ein Verlauf wird einmal gezeichnet. */}
        <radialGradient id="impuls-schein">
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.26" />
          <stop offset="52%" stopColor="var(--color-lime)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </radialGradient>

        {/* Die Kurve verliert an den Rändern an Kraft, statt abgeschnitten
            zu enden. Ohne das steht links und rechts eine harte Kante. */}
        <linearGradient id="kurven-verlauf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0" />
          <stop offset="22%" stopColor="var(--color-lime)" stopOpacity="0.9" />
          <stop offset="78%" stopColor="var(--color-lime)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Der atmende Schein ganz hinten */}
      <circle cx={M} cy={M} r={R_AUSSEN} fill="url(#impuls-schein)" className="figur-schein" />

      {/* Äußerer Ring, gestrichelt und langsam drehend. 60 Sekunden pro
          Umdrehung - schnell genug, dass man die Bewegung bemerkt, langsam
          genug, dass sie beim Lesen nicht stört. */}
      <circle
        cx={M}
        cy={M}
        r={R_AUSSEN}
        fill="none"
        strokeWidth="1.5"
        strokeDasharray="2 12"
        className="impuls-aussenring"
      />

      {/* Zwei Bögen, die gegenläufig kreisen - sie geben der Scheibe Tiefe,
          ohne dass eine weitere Farbe nötig wäre. */}
      <g fill="none" strokeLinecap="round" stroke="var(--color-lime)">
        <path
          d={`M ${M} ${M - 154} A 154 154 0 0 1 ${M + 109} ${M - 109}`}
          strokeWidth="2.5"
          strokeOpacity="0.55"
          className="impuls-bogen-rechts"
        />
        <path
          d={`M ${M} ${M + 154} A 154 154 0 0 1 ${M - 109} ${M + 109}`}
          strokeWidth="2.5"
          strokeOpacity="0.35"
          className="impuls-bogen-links"
        />
      </g>

      {/* Der Kreis, auf dem die Punkte sitzen */}
      <circle cx={M} cy={M} r={R_PUNKTE} fill="none" strokeWidth="1" className="impuls-innenring" />

      {/* Der Fortschrittsring: zeichnet sich beim Öffnen einmal selbst -
          wie eine Uhr, die eine Trainingseinheit abzählt. */}
      <circle cx={M} cy={M} r={R_FORTSCHRITT - 3} className="impuls-scheibe" />
      <circle cx={M} cy={M} r={R_FORTSCHRITT} fill="none" strokeWidth="4" className="impuls-bahn" />
      <circle
        cx={M}
        cy={M}
        r={R_FORTSCHRITT}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className="impuls-ring"
        style={{ "--ring-len": `${UMFANG}` } as React.CSSProperties}
        strokeDasharray={UMFANG}
        transform={`rotate(-90 ${M} ${M})`}
      />

      {/* Die Zahl. Als Text im SVG und nicht daneben im HTML: So bleibt sie
          bei jeder Breite mittig im Ring, ohne dass zwei Größen
          aufeinander abgestimmt werden müssen. */}
      <text
        x={M}
        y={M - 4}
        textAnchor="middle"
        className="impuls-zahl"
        style={{ fontSize: "68px", fontWeight: 900, letterSpacing: "-0.03em" }}
      >
        20
      </text>
      <text
        x={M}
        y={M + 30}
        textAnchor="middle"
        className="impuls-einheit"
        style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.28em" }}
      >
        MINUTEN
      </text>

      {/* Die Ablesezeile unter der Zahl */}
      <path
        d={KURVE}
        fill="none"
        stroke="url(#kurven-verlauf)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="impuls-kurve"
      />

      {/* Die Punkte auf dem Kreis - sie sprechen der Reihe nach an, wie die
          Elektroden im Anzug. */}
      {punkte.map(({ x, y, takt }, i) => (
        <g key={i} style={{ "--takt": `${takt}s` } as React.CSSProperties}>
          <circle cx={x} cy={y} r="5" className="figur-welle" fill="var(--color-lime)" />
          <circle cx={x} cy={y} r="5" className="figur-punkt" fill="var(--ring-mark)" />
        </g>
      ))}
    </svg>
  );
}
